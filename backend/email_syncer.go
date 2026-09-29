package backend

import (
	"crypto/tls"
	"fmt"
	"mime"
	"regexp"
	"strings"
	"time"

	"github.com/emersion/go-imap"
	"github.com/emersion/go-imap/client"
)

// EmailSyncer handles IMAP connections and parsing
type EmailSyncer struct{}

// NewEmailSyncer creates an instance of EmailSyncer
func NewEmailSyncer() *EmailSyncer {
	return &EmailSyncer{}
}

// connect opens an IMAP TLS/Plain connection and logs in
func (s *EmailSyncer) connect(host string, port int, email, appPassword string, useSSL bool) (*client.Client, error) {
	if host == "" {
		return nil, fmt.Errorf("IMAP host is required")
	}
	if port <= 0 {
		port = 993
	}
	if email == "" || appPassword == "" {
		return nil, fmt.Errorf("email and app password are required")
	}

	addr := fmt.Sprintf("%s:%d", host, port)
	var c *client.Client
	var err error

	if useSSL {
		tlsConfig := &tls.Config{
			ServerName:         host,
			InsecureSkipVerify: false,
		}
		c, err = client.DialTLS(addr, tlsConfig)
	} else {
		c, err = client.Dial(addr)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to connect to server %s: %w", addr, err)
	}

	// Login with credentials
	if err := c.Login(email, appPassword); err != nil {
		_ = c.Logout()
		return nil, fmt.Errorf("authentication failed: %w", err)
	}

	return c, nil
}

// TestConnection verifies if IMAP server and credentials are valid
func (s *EmailSyncer) TestConnection(req EmailAccountRequest) error {
	c, err := s.connect(req.IMAPHost, req.IMAPPort, req.Email, req.AppPassword, req.UseSSL)
	if err != nil {
		return err
	}
	defer c.Logout()

	// Verify mailbox access
	if _, err := c.Select("INBOX", true); err != nil {
		return fmt.Errorf("connected but failed to access INBOX: %w", err)
	}

	return nil
}

// SyncMailbox fetches recent relevant job emails from the account
func (s *EmailSyncer) SyncMailbox(account *EmailAccount, existingMessageIDs map[string]bool) ([]EmailNotification, error) {
	c, err := s.connect(account.IMAPHost, account.IMAPPort, account.Email, account.AppPassword, account.UseSSL)
	if err != nil {
		return nil, err
	}
	defer c.Logout()

	// Select INBOX in read-only mode so we never modify user emails on server
	mbox, err := c.Select("INBOX", true)
	if err != nil {
		return nil, fmt.Errorf("failed to open INBOX: %w", err)
	}

	if mbox.Messages == 0 {
		return []EmailNotification{}, nil
	}

	// Fetch up to the last 150 messages from INBOX for inspection
	from := uint32(1)
	if mbox.Messages > 150 {
		from = mbox.Messages - 149
	}
	to := mbox.Messages

	seqSet := new(imap.SeqSet)
	seqSet.AddRange(from, to)

	section := &imap.BodySectionName{
		Peek: true,
	}
	items := []imap.FetchItem{imap.FetchEnvelope, imap.FetchUid, imap.FetchInternalDate, section.FetchItem()}

	messages := make(chan *imap.Message, 150)
	done := make(chan error, 1)
	go func() {
		done <- c.Fetch(seqSet, items, messages)
	}()

	var notifications []EmailNotification
	wordDecoder := new(mime.WordDecoder)

	for msg := range messages {
		if msg == nil || msg.Envelope == nil {
			continue
		}

		// Decode Subject
		rawSubject := msg.Envelope.Subject
		subject, decErr := wordDecoder.DecodeHeader(rawSubject)
		if decErr != nil || subject == "" {
			subject = rawSubject
		}

		// Message-ID
		msgID := msg.Envelope.MessageId
		if msgID == "" {
			msgID = fmt.Sprintf("%d-%d", account.ID, msg.Uid)
		}

		// Skip if already in database
		if existingMessageIDs[msgID] {
			continue
		}

		// Sender address
		senderAddr := ""
		senderName := ""
		if len(msg.Envelope.From) > 0 {
			fromAddr := msg.Envelope.From[0]
			senderAddr = fmt.Sprintf("%s@%s", fromAddr.MailboxName, fromAddr.HostName)
			senderName = fromAddr.PersonalName
			if decSender, err := wordDecoder.DecodeHeader(senderName); err == nil && decSender != "" {
				senderName = decSender
			}
		}

		// Check platform
		platform := detectPlatform(senderAddr, senderName, subject)
		if platform == "" {
			// Not a recognized job platform or job related email, skip
			continue
		}

		// Extract snippet from body
		var snippet string
		r := msg.GetBody(section)
		if r != nil {
			buf := make([]byte, 2048)
			n, _ := r.Read(buf)
			snippet = cleanSnippet(string(buf[:n]))
		}

		// Detect metadata
		company, role, status := parseJobDetails(platform, subject, snippet)

		receivedTime := msg.Envelope.Date
		if receivedTime.IsZero() {
			receivedTime = msg.InternalDate
		}
		if receivedTime.IsZero() {
			receivedTime = time.Now()
		}

		notif := EmailNotification{
			AccountID:       account.ID,
			AccountEmail:    account.Email,
			MessageID:       msgID,
			Sender:          fmt.Sprintf("%s <%s>", senderName, senderAddr),
			Subject:         subject,
			Snippet:         snippet,
			Platform:        platform,
			DetectedCompany: company,
			DetectedRole:    role,
			DetectedStatus:  status,
			ReceivedAt:      receivedTime.Format("2006-01-02 15:04"),
			IsRead:          false,
			CreatedAt:       time.Now().UTC().Format(time.RFC3339),
		}

		notifications = append(notifications, notif)
	}

	if err := <-done; err != nil {
		return notifications, fmt.Errorf("fetch error: %w", err)
	}

	return notifications, nil
}

// detectPlatform checks if sender or subject is from a job platform
func detectPlatform(senderAddr, senderName, subject string) string {
	sLower := strings.ToLower(senderAddr)
	nameLower := strings.ToLower(senderName)
	subjLower := strings.ToLower(subject)

	if strings.Contains(sLower, "glassdoor.com") || strings.Contains(nameLower, "glassdoor") {
		return PlatformGlassdoor
	}
	if strings.Contains(sLower, "linkedin.com") || strings.Contains(nameLower, "linkedin") {
		return PlatformLinkedIn
	}
	if strings.Contains(sLower, "jobstreet") || strings.Contains(nameLower, "jobstreet") {
		return PlatformJobStreet
	}
	if strings.Contains(sLower, "indeed") || strings.Contains(nameLower, "indeed") {
		return PlatformIndeed
	}
	if strings.Contains(sLower, "glints") || strings.Contains(nameLower, "glints") {
		return PlatformGlints
	}
	if strings.Contains(sLower, "kalibrr") || strings.Contains(nameLower, "kalibrr") {
		return PlatformKalibrr
	}
	if strings.Contains(sLower, "greenhouse.io") || strings.Contains(sLower, "lever.co") ||
		strings.Contains(sLower, "ashbyhq.com") || strings.Contains(sLower, "workday") ||
		strings.Contains(sLower, "smartrecruiters") {
		return PlatformCareers
	}

	// Keywords in subject for company emails that invite to interviews
	if strings.Contains(subjLower, "interview") ||
		strings.Contains(subjLower, "undangan wawancara") ||
		strings.Contains(subjLower, "jadwal interview") ||
		strings.Contains(subjLower, "application status") ||
		strings.Contains(subjLower, "offering letter") ||
		strings.Contains(subjLower, "job application") {
		return PlatformOther
	}

	return ""
}

// cleanSnippet converts raw email / html snippet into human readable text
func cleanSnippet(raw string) string {
	// Strip HTML tags
	reHTML := regexp.MustCompile(`<[^>]*>`)
	text := reHTML.ReplaceAllString(raw, " ")

	// Replace common HTML entities
	text = strings.ReplaceAll(text, "&nbsp;", " ")
	text = strings.ReplaceAll(text, "&amp;", "&")
	text = strings.ReplaceAll(text, "&quot;", "\"")
	text = strings.ReplaceAll(text, "&lt;", "<")
	text = strings.ReplaceAll(text, "&gt;", ">")

	// Collapse multiple whitespaces
	reSpaces := regexp.MustCompile(`\s+`)
	text = strings.TrimSpace(reSpaces.ReplaceAllString(text, " "))

	if len(text) > 280 {
		return text[:280] + "..."
	}
	return text
}

// parseJobDetails extracts Company, Role, and Status from Subject and Snippet
func parseJobDetails(platform, subject, snippet string) (company, role, status string) {
	combined := subject + " " + snippet
	sLower := strings.ToLower(combined)

	// Determine status
	if strings.Contains(sLower, "interview") ||
		strings.Contains(sLower, "wawancara") ||
		strings.Contains(sLower, "technical test") ||
		strings.Contains(sLower, "user interview") ||
		strings.Contains(sLower, "assessment") {
		status = StatusInterview
	} else if strings.Contains(sLower, "offer") || strings.Contains(sLower, "offering") || strings.Contains(sLower, "selamat bergabung") {
		status = StatusOffer
	} else if strings.Contains(sLower, "viewed") || strings.Contains(sLower, "dilihat") || strings.Contains(sLower, "reviewed") {
		status = "VIEWED"
	} else if strings.Contains(sLower, "applied") ||
		strings.Contains(sLower, "application") ||
		strings.Contains(sLower, "submitted") ||
		strings.Contains(sLower, "lamaran") ||
		strings.Contains(sLower, "melamar") {
		status = StatusApplied
	} else if strings.Contains(sLower, "job alert") ||
		strings.Contains(sLower, "lowongan baru") ||
		strings.Contains(sLower, "rekomendasi lowongan") {
		status = "ALERT"
	} else {
		status = "UPDATE"
	}

	// Platform specific subject parsing
	switch platform {
	case PlatformGlassdoor:
		// "Your application for [Role] at [Company] was sent"
		re1 := regexp.MustCompile(`(?i)application for (.+?) at (.+?)(?: was|$)`)
		if m := re1.FindStringSubmatch(subject); len(m) >= 3 {
			role = strings.TrimSpace(m[1])
			company = strings.TrimSpace(m[2])
			return
		}
		// "[Company] viewed your application for [Role]"
		re2 := regexp.MustCompile(`(?i)(.+?) viewed your application for (.+)`)
		if m := re2.FindStringSubmatch(subject); len(m) >= 3 {
			company = strings.TrimSpace(m[1])
			role = strings.TrimSpace(m[2])
			return
		}
		// "New jobs for [Role] at [Company]"
		re3 := regexp.MustCompile(`(?i)New jobs for (.+?) at (.+)`)
		if m := re3.FindStringSubmatch(subject); len(m) >= 3 {
			role = strings.TrimSpace(m[1])
			company = strings.TrimSpace(m[2])
			return
		}
		// "[Company] has an open [Role]"
		re4 := regexp.MustCompile(`(?i)(.+?) has an open (.+?)(?: position| role|$)`)
		if m := re4.FindStringSubmatch(subject); len(m) >= 3 {
			company = strings.TrimSpace(m[1])
			role = strings.TrimSpace(m[2])
			return
		}

	case PlatformLinkedIn:
		// "Your application to [Company] was sent"
		re1 := regexp.MustCompile(`(?i)application to (.+?) was sent`)
		if m := re1.FindStringSubmatch(subject); len(m) >= 2 {
			company = strings.TrimSpace(m[1])
			return
		}
		// "Your application for [Role] at [Company] was sent"
		re2 := regexp.MustCompile(`(?i)application for (.+?) at (.+?)(?: was|$)`)
		if m := re2.FindStringSubmatch(subject); len(m) >= 3 {
			role = strings.TrimSpace(m[1])
			company = strings.TrimSpace(m[2])
			return
		}
		// "[Company] is looking for a [Role]"
		re3 := regexp.MustCompile(`(?i)(.+?) is looking for an? (.+)`)
		if m := re3.FindStringSubmatch(subject); len(m) >= 3 {
			company = strings.TrimSpace(m[1])
			role = strings.TrimSpace(m[2])
			return
		}

	case PlatformJobStreet:
		// "Lamaran Anda untuk [Role] di [Company]"
		re1 := regexp.MustCompile(`(?i)Lamaran Anda untuk (.+?) di (.+)`)
		if m := re1.FindStringSubmatch(subject); len(m) >= 3 {
			role = strings.TrimSpace(m[1])
			company = strings.TrimSpace(m[2])
			return
		}
	}

	// Generic fallback patterns:
	// "... at [Company]" or "... di [Company]"
	if company == "" {
		reComp := regexp.MustCompile(`(?i)(?:at|di|with|from)\s+([A-Za-z0-9\s&.,\-]+?)(?:\s+was|\s+is|\s+has|\s+on|\s*$)`)
		if m := reComp.FindStringSubmatch(subject); len(m) >= 2 {
			candidate := strings.TrimSpace(m[1])
			if len(candidate) > 2 && len(candidate) < 50 {
				company = candidate
			}
		}
	}

	// Fallback role:
	if role == "" {
		reRole := regexp.MustCompile(`(?i)(?:for|sebagai|role|position)\s+([A-Za-z0-9\s&.,\-]+?)(?:\s+at|\s+di|\s+with|\s*$)`)
		if m := reRole.FindStringSubmatch(subject); len(m) >= 2 {
			candidate := strings.TrimSpace(m[1])
			if len(candidate) > 2 && len(candidate) < 50 {
				role = candidate
			}
		}
	}

	return company, role, status
}
