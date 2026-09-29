package backend

import (
	"os"
	"path/filepath"
	"testing"
)

func TestDBManagerOperations(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "trackplan_test_*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "test.db")
	mgr := &DBManager{
		dbPath: dbPath,
	}

	if err := mgr.openAndMigrate(); err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}
	defer mgr.Close()

	// 1. Create Application
	app, err := mgr.CreateApplication(CreateApplicationRequest{
		Company:     "Google",
		Position:    "Software Engineer Intern",
		Type:        TypeInternship,
		Status:      StatusApplied,
		AppliedDate: "2026-09-20",
		Location:    "Jakarta",
		InitialNote: "Applied via careers portal",
	})
	if err != nil {
		t.Fatalf("failed to create application: %v", err)
	}
	if app.ID == 0 {
		t.Fatalf("expected valid app ID, got 0")
	}

	// 2. Verify Detail and Timeline
	detail, err := mgr.GetApplicationDetail(app.ID)
	if err != nil {
		t.Fatalf("failed to get detail: %v", err)
	}
	if len(detail.Timeline) != 1 {
		t.Fatalf("expected 1 timeline event, got %d", len(detail.Timeline))
	}

	// 3. Update Status
	err = mgr.UpdateStatus(app.ID, StatusInterview, "Invited to technical screening")
	if err != nil {
		t.Fatalf("failed to update status: %v", err)
	}

	detail, err = mgr.GetApplicationDetail(app.ID)
	if err != nil {
		t.Fatalf("failed to get detail after update: %v", err)
	}
	if detail.Status != StatusInterview {
		t.Fatalf("expected status %s, got %s", StatusInterview, detail.Status)
	}
	if len(detail.Timeline) != 2 {
		t.Fatalf("expected 2 timeline events, got %d", len(detail.Timeline))
	}

	// 4. Verify Stats
	stats, err := mgr.GetStats()
	if err != nil {
		t.Fatalf("failed to get stats: %v", err)
	}
	if stats.TotalApplications != 1 {
		t.Fatalf("expected 1 total application, got %d", stats.TotalApplications)
	}
	if stats.Interviews != 1 {
		t.Fatalf("expected 1 interview, got %d", stats.Interviews)
	}

	// 5. Verify Filter and Search
	apps, err := mgr.GetApplications(FilterOptions{
		Search: "goog",
		Type:   "ALL",
		Status: "ALL",
	})
	if err != nil {
		t.Fatalf("failed to search: %v", err)
	}
	if len(apps) != 1 {
		t.Fatalf("expected 1 result for search 'goog', got %d", len(apps))
	}

	// 6. CSV & JSON Export
	csvData, err := mgr.ExportCSV()
	if err != nil || len(csvData) == 0 {
		t.Fatalf("expected valid csv data, got err: %v", err)
	}

	records, err := mgr.ExportAllData()
	if err != nil || len(records) != 1 {
		t.Fatalf("expected 1 exported record, got %d, err: %v", len(records), err)
	}
}
