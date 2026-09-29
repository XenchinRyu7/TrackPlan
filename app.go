package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"time"
	"trackplan/backend"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
	db  *backend.DBManager
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	db, err := backend.NewDBManager()
	if err != nil {
		runtime.LogErrorf(ctx, "Failed to initialize database: %s", err.Error())
		return
	}
	a.db = db
}

// shutdown is called when the app terminates
func (a *App) shutdown(ctx context.Context) {
	if a.db != nil {
		_ = a.db.Close()
	}
}

// OpenURL opens a URL in the default browser
func (a *App) OpenURL(url string) {
	if url != "" {
		runtime.BrowserOpenURL(a.ctx, url)
	}
}

// GetStats returns metrics for dashboard
func (a *App) GetStats() (*backend.Stats, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.GetStats()
}

// GetApplications returns filtered & sorted applications
func (a *App) GetApplications(filter backend.FilterOptions) ([]backend.Application, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.GetApplications(filter)
}

// GetRecentApplications returns recently updated applications
func (a *App) GetRecentApplications(limit int) ([]backend.Application, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.GetRecentApplications(limit)
}

// GetApplicationDetail returns detail with timeline
func (a *App) GetApplicationDetail(id int64) (*backend.ApplicationDetail, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.GetApplicationDetail(id)
}

// CreateApplication creates a new application
func (a *App) CreateApplication(req backend.CreateApplicationRequest) (*backend.Application, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.CreateApplication(req)
}

// UpdateApplication updates an existing application
func (a *App) UpdateApplication(req backend.UpdateApplicationRequest) (*backend.Application, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.UpdateApplication(req)
}

// UpdateStatus updates the application status and logs a timeline event
func (a *App) UpdateStatus(id int64, newStatus string, note string) error {
	if a.db == nil {
		return fmt.Errorf("database not initialized")
	}
	return a.db.UpdateStatus(id, newStatus, note)
}

// AddTimelineNote adds a note to the timeline
func (a *App) AddTimelineNote(applicationID int64, status string, note string) (*backend.TimelineEvent, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.AddTimelineNote(applicationID, status, note)
}

// GetScheduleEvents returns schedule items for calendar
func (a *App) GetScheduleEvents() ([]backend.ScheduleEvent, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.GetScheduleEvents()
}

// SetInterviewDate sets or updates the scheduled interview date
func (a *App) SetInterviewDate(applicationID int64, interviewDate string, note string) error {
	if a.db == nil {
		return fmt.Errorf("database not initialized")
	}
	return a.db.SetInterviewDate(applicationID, interviewDate, note)
}

// DeleteApplication deletes an application
func (a *App) DeleteApplication(id int64) error {
	if a.db == nil {
		return fmt.Errorf("database not initialized")
	}
	return a.db.DeleteApplication(id)
}

// GetDatabasePath returns the location of the database file
func (a *App) GetDatabasePath() string {
	if a.db == nil {
		return ""
	}
	return a.db.GetDBPath()
}

// BackupDatabaseFile prompts user for destination and backs up the SQLite database file
func (a *App) BackupDatabaseFile() (string, error) {
	if a.db == nil {
		return "", fmt.Errorf("database not initialized")
	}
	defaultName := fmt.Sprintf("trackplan-backup-%s.db", time.Now().Format("2006-01-02-150405"))
	selectedPath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Save Database Backup",
		DefaultFilename: defaultName,
		Filters: []runtime.FileFilter{
			{DisplayName: "SQLite Database (*.db)", Pattern: "*.db"},
		},
	})
	if err != nil || selectedPath == "" {
		return "", err
	}

	srcFile, err := os.Open(a.db.GetDBPath())
	if err != nil {
		return "", fmt.Errorf("failed to open source database: %w", err)
	}
	defer srcFile.Close()

	destFile, err := os.Create(selectedPath)
	if err != nil {
		return "", fmt.Errorf("failed to create destination backup: %w", err)
	}
	defer destFile.Close()

	if _, err := io.Copy(destFile, srcFile); err != nil {
		return "", fmt.Errorf("failed to write backup file: %w", err)
	}

	return selectedPath, nil
}

// RestoreDatabaseFile prompts user to choose a .db file and restores it
func (a *App) RestoreDatabaseFile() (bool, error) {
	if a.db == nil {
		return false, fmt.Errorf("database not initialized")
	}
	selectedPath, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Database Backup to Restore",
		Filters: []runtime.FileFilter{
			{DisplayName: "SQLite Database (*.db)", Pattern: "*.db"},
		},
	})
	if err != nil || selectedPath == "" {
		return false, err
	}

	if err := a.db.RestoreFromBackup(selectedPath); err != nil {
		return false, fmt.Errorf("restore failed: %w", err)
	}

	return true, nil
}

// ExportApplicationsJSON prompts user for save location and exports all applications to JSON
func (a *App) ExportApplicationsJSON() (string, error) {
	if a.db == nil {
		return "", fmt.Errorf("database not initialized")
	}
	records, err := a.db.ExportAllData()
	if err != nil {
		return "", err
	}

	jsonData, err := json.MarshalIndent(records, "", "  ")
	if err != nil {
		return "", err
	}

	defaultName := fmt.Sprintf("trackplan-export-%s.json", time.Now().Format("2006-01-02"))
	selectedPath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Export Applications as JSON",
		DefaultFilename: defaultName,
		Filters: []runtime.FileFilter{
			{DisplayName: "JSON (*.json)", Pattern: "*.json"},
		},
	})
	if err != nil || selectedPath == "" {
		return "", err
	}

	if err := os.WriteFile(selectedPath, jsonData, 0644); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	return selectedPath, nil
}

// ExportApplicationsCSV prompts user for save location and exports all applications to CSV
func (a *App) ExportApplicationsCSV() (string, error) {
	if a.db == nil {
		return "", fmt.Errorf("database not initialized")
	}
	csvContent, err := a.db.ExportCSV()
	if err != nil {
		return "", err
	}

	defaultName := fmt.Sprintf("trackplan-export-%s.csv", time.Now().Format("2006-01-02"))
	selectedPath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Export Applications as CSV",
		DefaultFilename: defaultName,
		Filters: []runtime.FileFilter{
			{DisplayName: "CSV (*.csv)", Pattern: "*.csv"},
		},
	})
	if err != nil || selectedPath == "" {
		return "", err
	}

	if err := os.WriteFile(selectedPath, []byte(csvContent), 0644); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	return selectedPath, nil
}

// ImportApplicationsFile prompts user to select a JSON export file and imports data
func (a *App) ImportApplicationsFile() (int, error) {
	if a.db == nil {
		return 0, fmt.Errorf("database not initialized")
	}
	selectedPath, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select JSON Export File to Import",
		Filters: []runtime.FileFilter{
			{DisplayName: "JSON (*.json)", Pattern: "*.json"},
		},
	})
	if err != nil || selectedPath == "" {
		return 0, err
	}

	data, err := os.ReadFile(selectedPath)
	if err != nil {
		return 0, fmt.Errorf("failed to read file: %w", err)
	}

	var records []backend.ExportImportRecord
	if err := json.Unmarshal(data, &records); err != nil {
		return 0, fmt.Errorf("invalid JSON format: %w", err)
	}

	count, err := a.db.ImportData(records)
	if err != nil {
		return 0, err
	}

	return count, nil
}

// GetEmailAccounts returns all configured email accounts
func (a *App) GetEmailAccounts() ([]backend.EmailAccount, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.GetEmailAccounts()
}

// SaveEmailAccount inserts or updates an email account
func (a *App) SaveEmailAccount(req backend.EmailAccountRequest) (*backend.EmailAccount, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.SaveEmailAccount(req)
}

// DeleteEmailAccount deletes an email account and its notifications
func (a *App) DeleteEmailAccount(id int64) error {
	if a.db == nil {
		return fmt.Errorf("database not initialized")
	}
	return a.db.DeleteEmailAccount(id)
}

// TestEmailConnection tests connection to IMAP server with provided credentials
func (a *App) TestEmailConnection(req backend.EmailAccountRequest) (string, error) {
	syncer := backend.NewEmailSyncer()
	if err := syncer.TestConnection(req); err != nil {
		return "", err
	}
	return "Connected to mailbox successfully!", nil
}

// SyncEmailAccount fetches recent notifications for a specific account
func (a *App) SyncEmailAccount(accountID int64) (*backend.SyncResult, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}

	account, err := a.db.GetEmailAccount(accountID)
	if err != nil {
		return nil, fmt.Errorf("account not found: %w", err)
	}

	existingIDs, err := a.db.GetExistingMessageIDs(accountID)
	if err != nil {
		return nil, err
	}

	syncer := backend.NewEmailSyncer()
	notifs, syncErr := syncer.SyncMailbox(account, existingIDs)
	if syncErr != nil {
		_ = a.db.UpdateEmailAccountSyncStatus(accountID, "FAILED: "+syncErr.Error())
		return &backend.SyncResult{
			AccountID:    accountID,
			AccountEmail: account.Email,
			Success:      false,
			Error:        syncErr.Error(),
		}, syncErr
	}

	insertedCount, err := a.db.InsertEmailNotifications(notifs)
	if err != nil {
		return nil, err
	}

	_ = a.db.UpdateEmailAccountSyncStatus(accountID, "SUCCESS")
	return &backend.SyncResult{
		AccountID:    accountID,
		AccountEmail: account.Email,
		Success:      true,
		NewEmails:    insertedCount,
	}, nil
}

// SyncAllEmailAccounts syncs all active email accounts
func (a *App) SyncAllEmailAccounts() ([]backend.SyncResult, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}

	accounts, err := a.db.GetEmailAccounts()
	if err != nil {
		return nil, err
	}

	var results []backend.SyncResult
	for _, acc := range accounts {
		if !acc.IsActive {
			continue
		}
		res, _ := a.SyncEmailAccount(acc.ID)
		if res != nil {
			results = append(results, *res)
		}
	}

	if results == nil {
		results = []backend.SyncResult{}
	}
	return results, nil
}

// GetEmailNotifications returns parsed job notifications
func (a *App) GetEmailNotifications(limit int, unreadOnly bool, platform string) ([]backend.EmailNotification, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.GetEmailNotifications(limit, unreadOnly, platform)
}

// MarkNotificationAsRead marks notification as read or unread
func (a *App) MarkNotificationAsRead(id int64, isRead bool) error {
	if a.db == nil {
		return fmt.Errorf("database not initialized")
	}
	return a.db.MarkNotificationAsRead(id, isRead)
}

// MarkAllNotificationsAsRead marks all notifications as read
func (a *App) MarkAllNotificationsAsRead() error {
	if a.db == nil {
		return fmt.Errorf("database not initialized")
	}
	return a.db.MarkAllNotificationsAsRead()
}

// DeleteNotification deletes a notification
func (a *App) DeleteNotification(id int64) error {
	if a.db == nil {
		return fmt.Errorf("database not initialized")
	}
	return a.db.DeleteNotification(id)
}

// GetUnreadNotificationCount returns unread count for badge
func (a *App) GetUnreadNotificationCount() (int, error) {
	if a.db == nil {
		return 0, nil
	}
	return a.db.GetUnreadNotificationCount()
}

