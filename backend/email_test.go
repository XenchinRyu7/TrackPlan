package backend

import (
	"os"
	"path/filepath"
	"testing"
)

func TestEmailAccountsAndNotifications(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "trackplan_email_test_*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "test.db")
	mgr := &DBManager{dbPath: dbPath}
	if err := mgr.openAndMigrate(); err != nil {
		t.Fatalf("Failed to open & migrate: %v", err)
	}
	defer mgr.Close()

	// 1. Create two accounts (Multi-email test)
	acc1, err := mgr.SaveEmailAccount(EmailAccountRequest{
		Label:       "Primary Gmail",
		Provider:    ProviderGmail,
		Email:       "candidate@gmail.com",
		IMAPHost:    "imap.gmail.com",
		IMAPPort:    993,
		AppPassword: "abcd efgh ijkl mnop",
		UseSSL:      true,
		IsActive:    true,
	})
	if err != nil {
		t.Fatalf("Failed to save acc1: %v", err)
	}

	acc2, err := mgr.SaveEmailAccount(EmailAccountRequest{
		Label:       "Secondary Yahoo",
		Provider:    ProviderYahoo,
		Email:       "career.seeker@yahoo.com",
		IMAPHost:    "imap.mail.yahoo.com",
		IMAPPort:    993,
		AppPassword: "secretapppass",
		UseSSL:      true,
		IsActive:    true,
	})
	if err != nil {
		t.Fatalf("Failed to save acc2: %v", err)
	}

	// 2. Fetch all accounts
	accounts, err := mgr.GetEmailAccounts()
	if err != nil {
		t.Fatalf("Failed to get email accounts: %v", err)
	}
	if len(accounts) != 2 {
		t.Fatalf("Expected 2 accounts, got %d", len(accounts))
	}

	// 3. Insert mock notifications for both accounts
	notifs := []EmailNotification{
		{
			AccountID:       acc1.ID,
			AccountEmail:    acc1.Email,
			MessageID:       "msg-glassdoor-001",
			Sender:          "Glassdoor <jobs-noreply@glassdoor.com>",
			Subject:         "Your application for Senior Go Developer at Tokopedia was sent",
			Snippet:         "Thank you for applying. Tokopedia has received your application.",
			Platform:        PlatformGlassdoor,
			DetectedCompany: "Tokopedia",
			DetectedRole:    "Senior Go Developer",
			DetectedStatus:  StatusApplied,
			ReceivedAt:      "2026-09-29 10:00",
		},
		{
			AccountID:       acc2.ID,
			AccountEmail:    acc2.Email,
			MessageID:       "msg-linkedin-002",
			Sender:          "LinkedIn <messages-noreply@linkedin.com>",
			Subject:         "Interview invitation from Shopee for Frontend Engineer",
			Snippet:         "Hi, we would like to invite you for a virtual interview.",
			Platform:        PlatformLinkedIn,
			DetectedCompany: "Shopee",
			DetectedRole:    "Frontend Engineer",
			DetectedStatus:  StatusInterview,
			ReceivedAt:      "2026-09-29 11:30",
		},
	}

	inserted, err := mgr.InsertEmailNotifications(notifs)
	if err != nil {
		t.Fatalf("Failed to insert notifications: %v", err)
	}
	if inserted != 2 {
		t.Fatalf("Expected 2 inserted notifications, got %d", inserted)
	}

	// 4. Test duplicate prevention
	insertedDup, err := mgr.InsertEmailNotifications(notifs)
	if err != nil {
		t.Fatalf("Failed to test duplicate insert: %v", err)
	}
	if insertedDup != 0 {
		t.Fatalf("Expected 0 duplicate inserted, got %d", insertedDup)
	}

	// 5. Test unread count
	unreadCount, err := mgr.GetUnreadNotificationCount()
	if err != nil {
		t.Fatalf("Failed to get unread count: %v", err)
	}
	if unreadCount != 2 {
		t.Fatalf("Expected 2 unread, got %d", unreadCount)
	}

	// 6. Test platform filtering
	gdNotifs, err := mgr.GetEmailNotifications(10, false, PlatformGlassdoor)
	if err != nil {
		t.Fatalf("Failed to query Glassdoor notifs: %v", err)
	}
	if len(gdNotifs) != 1 || gdNotifs[0].DetectedCompany != "Tokopedia" {
		t.Fatalf("Expected 1 Tokopedia Glassdoor notif, got %+v", gdNotifs)
	}

	// 7. Mark as read
	if err := mgr.MarkNotificationAsRead(gdNotifs[0].ID, true); err != nil {
		t.Fatalf("Failed to mark as read: %v", err)
	}

	newUnread, _ := mgr.GetUnreadNotificationCount()
	if newUnread != 1 {
		t.Fatalf("Expected 1 unread, got %d", newUnread)
	}

	// 8. Delete notification
	if err := mgr.DeleteNotification(gdNotifs[0].ID); err != nil {
		t.Fatalf("Failed to delete notification: %v", err)
	}

	remaining, _ := mgr.GetEmailNotifications(10, false, "ALL")
	if len(remaining) != 1 {
		t.Fatalf("Expected 1 remaining notification, got %d", len(remaining))
	}
}

func TestJobDetailParser(t *testing.T) {
	// Test Glassdoor subject parsing
	comp, role, status := parseJobDetails(
		PlatformGlassdoor,
		"Your application for Backend Engineer at Traveloka was sent",
		"Your application has been received.",
	)
	if comp != "Traveloka" || role != "Backend Engineer" || status != StatusApplied {
		t.Errorf("Glassdoor parse failed: comp=%s, role=%s, status=%s", comp, role, status)
	}

	// Test Glassdoor interview invitation
	comp2, role2, status2 := parseJobDetails(
		PlatformGlassdoor,
		"Interview invitation from Bukalapak for Full Stack Developer",
		"Congratulations! You are invited to an interview.",
	)
	if comp2 == "" || status2 != StatusInterview {
		t.Errorf("Interview parse failed: comp=%s, role=%s, status=%s", comp2, role2, status2)
	}
	_ = role2
}
