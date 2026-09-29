package backend

// Email providers
const (
	ProviderGmail   = "GMAIL"
	ProviderOutlook = "OUTLOOK"
	ProviderYahoo   = "YAHOO"
	ProviderCustom  = "CUSTOM"
)

// Supported platforms
const (
	PlatformGlassdoor = "GLASSDOOR"
	PlatformLinkedIn  = "LINKEDIN"
	PlatformJobStreet = "JOBSTREET"
	PlatformIndeed    = "INDEED"
	PlatformGlints    = "GLINTS"
	PlatformKalibrr   = "KALIBRR"
	PlatformCareers   = "CAREERS"
	PlatformOther     = "OTHER"
)

// EmailAccount stores credentials for an IMAP mailbox
type EmailAccount struct {
	ID             int64  `json:"id"`
	Label          string `json:"label"`
	Provider       string `json:"provider"`
	Email          string `json:"email"`
	IMAPHost       string `json:"imap_host"`
	IMAPPort       int    `json:"imap_port"`
	AppPassword    string `json:"app_password"`
	UseSSL         bool   `json:"use_ssl"`
	IsActive       bool   `json:"is_active"`
	LastSyncAt     string `json:"last_sync_at"`
	LastSyncStatus string `json:"last_sync_status"`
	CreatedAt      string `json:"created_at"`
	UpdatedAt      string `json:"updated_at"`
}

// EmailAccountRequest represents form input for creating or updating an account
type EmailAccountRequest struct {
	ID          int64  `json:"id"`
	Label       string `json:"label"`
	Provider    string `json:"provider"`
	Email       string `json:"email"`
	IMAPHost    string `json:"imap_host"`
	IMAPPort    int    `json:"imap_port"`
	AppPassword string `json:"app_password"`
	UseSSL      bool   `json:"use_ssl"`
	IsActive    bool   `json:"is_active"`
}

// EmailNotification represents a parsed job notification email
type EmailNotification struct {
	ID              int64  `json:"id"`
	AccountID       int64  `json:"account_id"`
	AccountEmail    string `json:"account_email"`
	MessageID       string `json:"message_id"`
	Sender          string `json:"sender"`
	Subject         string `json:"subject"`
	Snippet         string `json:"snippet"`
	Platform        string `json:"platform"`
	DetectedCompany string `json:"detected_company"`
	DetectedRole    string `json:"detected_role"`
	DetectedStatus  string `json:"detected_status"` // INTERVIEW, APPLIED, VIEWED, OFFER, ALERT, UPDATE
	ReceivedAt      string `json:"received_at"`
	IsRead          bool   `json:"is_read"`
	CreatedAt       string `json:"created_at"`
}

// SyncResult represents the output of syncing a mailbox
type SyncResult struct {
	AccountID    int64  `json:"account_id"`
	AccountEmail string `json:"account_email"`
	Success      bool   `json:"success"`
	NewEmails    int    `json:"new_emails"`
	Error        string `json:"error"`
}
