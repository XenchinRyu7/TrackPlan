package backend

import (
	"database/sql"
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	_ "modernc.org/sqlite"
)

type DBManager struct {
	mu     sync.RWMutex
	db     *sql.DB
	dbPath string
}

func NewDBManager() (*DBManager, error) {
	var dbDir string
	userConfig, err := os.UserConfigDir()
	if err == nil && userConfig != "" {
		dbDir = filepath.Join(userConfig, "TrackPlan")
	} else {
		dbDir = "."
	}

	if err := os.MkdirAll(dbDir, 0755); err != nil {
		dbDir = "."
	}
	dbPath := filepath.Join(dbDir, "trackplan.db")

	mgr := &DBManager{
		dbPath: dbPath,
	}

	if err := mgr.openAndMigrate(); err != nil {
		return nil, err
	}

	return mgr, nil
}

func (m *DBManager) GetDBPath() string {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.dbPath
}

func (m *DBManager) openAndMigrate() error {
	db, err := sql.Open("sqlite", m.dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	if _, err := db.Exec(`
		PRAGMA journal_mode = WAL;
		PRAGMA foreign_keys = ON;
		PRAGMA busy_timeout = 5000;
	`); err != nil {
		// Ignore pragma failures on some environments
	}

	m.db = db

	return m.migrate()
}

func (m *DBManager) migrate() error {
	baseTables := `
	CREATE TABLE IF NOT EXISTS applications (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		company TEXT NOT NULL,
		position TEXT NOT NULL,
		type TEXT NOT NULL,
		status TEXT NOT NULL,
		applied_date TEXT NOT NULL,
		interview_date TEXT NOT NULL DEFAULT '',
		location TEXT NOT NULL DEFAULT '',
		employment_type TEXT NOT NULL DEFAULT '',
		salary_min REAL NOT NULL DEFAULT 0,
		salary_max REAL NOT NULL DEFAULT 0,
		currency TEXT NOT NULL DEFAULT 'IDR',
		job_url TEXT NOT NULL DEFAULT '',
		company_url TEXT NOT NULL DEFAULT '',
		contact_name TEXT NOT NULL DEFAULT '',
		contact_email TEXT NOT NULL DEFAULT '',
		notes TEXT NOT NULL DEFAULT '',
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS timeline_events (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
		status TEXT NOT NULL,
		note TEXT NOT NULL DEFAULT '',
		created_at TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS email_accounts (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		label TEXT NOT NULL DEFAULT '',
		provider TEXT NOT NULL DEFAULT 'GMAIL',
		email TEXT NOT NULL,
		imap_host TEXT NOT NULL DEFAULT 'imap.gmail.com',
		imap_port INTEGER NOT NULL DEFAULT 993,
		app_password TEXT NOT NULL DEFAULT '',
		use_ssl INTEGER NOT NULL DEFAULT 1,
		is_active INTEGER NOT NULL DEFAULT 1,
		last_sync_at TEXT NOT NULL DEFAULT '',
		last_sync_status TEXT NOT NULL DEFAULT '',
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS email_notifications (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		account_id INTEGER NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
		account_email TEXT NOT NULL DEFAULT '',
		message_id TEXT NOT NULL,
		sender TEXT NOT NULL DEFAULT '',
		subject TEXT NOT NULL DEFAULT '',
		snippet TEXT NOT NULL DEFAULT '',
		platform TEXT NOT NULL DEFAULT 'OTHER',
		detected_company TEXT NOT NULL DEFAULT '',
		detected_role TEXT NOT NULL DEFAULT '',
		detected_status TEXT NOT NULL DEFAULT 'UPDATE',
		received_at TEXT NOT NULL,
		is_read INTEGER NOT NULL DEFAULT 0,
		created_at TEXT NOT NULL,
		UNIQUE(account_id, message_id)
	);
	`

	if _, err := m.db.Exec(baseTables); err != nil {
		return fmt.Errorf("failed to create base tables: %w", err)
	}

	// For existing databases, ensure interview_date column exists before creating index
	_, _ = m.db.Exec(`ALTER TABLE applications ADD COLUMN interview_date TEXT NOT NULL DEFAULT ''`)

	indices := `
	CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);
	CREATE INDEX IF NOT EXISTS idx_apps_type ON applications(type);
	CREATE INDEX IF NOT EXISTS idx_apps_updated_at ON applications(updated_at DESC);
	CREATE INDEX IF NOT EXISTS idx_apps_applied_date ON applications(applied_date DESC);
	CREATE INDEX IF NOT EXISTS idx_apps_interview_date ON applications(interview_date);
	CREATE INDEX IF NOT EXISTS idx_timeline_app_id ON timeline_events(application_id);
	CREATE INDEX IF NOT EXISTS idx_email_notif_account ON email_notifications(account_id);
	CREATE INDEX IF NOT EXISTS idx_email_notif_read ON email_notifications(is_read);
	CREATE INDEX IF NOT EXISTS idx_email_notif_platform ON email_notifications(platform);
	CREATE INDEX IF NOT EXISTS idx_email_notif_received ON email_notifications(received_at DESC);
	`

	if _, err := m.db.Exec(indices); err != nil {
		return fmt.Errorf("failed to create indices: %w", err)
	}

	return nil
}

// Close closes the database connection
func (m *DBManager) Close() error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.db != nil {
		return m.db.Close()
	}
	return nil
}

// CreateApplication inserts a new application and its initial timeline event
func (m *DBManager) CreateApplication(req CreateApplicationRequest) (*Application, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	tx, err := m.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	now := FormatTimeISO(time.Now())
	if req.AppliedDate == "" {
		req.AppliedDate = time.Now().Format("2006-01-02")
	}
	if req.Currency == "" {
		req.Currency = "IDR"
	}
	if req.Type == "" {
		req.Type = TypeJob
	}
	if req.Status == "" {
		req.Status = StatusSaved
	}

	query := `
		INSERT INTO applications (
			company, position, type, status, applied_date, interview_date,
			location, employment_type, salary_min, salary_max, currency,
			job_url, company_url, contact_name, contact_email, notes,
			created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	res, err := tx.Exec(
		query,
		req.Company, req.Position, req.Type, req.Status, req.AppliedDate, req.InterviewDate,
		req.Location, req.EmploymentType, req.SalaryMin, req.SalaryMax, req.Currency,
		req.JobURL, req.CompanyURL, req.ContactName, req.ContactEmail, req.Notes,
		now, now,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert application: %w", err)
	}

	appID, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}

	initialNote := req.InitialNote
	if initialNote == "" {
		initialNote = fmt.Sprintf("Application created with status: %s", req.Status)
	}

	_, err = tx.Exec(`
		INSERT INTO timeline_events (application_id, status, note, created_at)
		VALUES (?, ?, ?, ?)
	`, appID, req.Status, initialNote, now)
	if err != nil {
		return nil, fmt.Errorf("failed to insert timeline event: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &Application{
		ID:             appID,
		Company:        req.Company,
		Position:       req.Position,
		Type:           req.Type,
		Status:         req.Status,
		AppliedDate:    req.AppliedDate,
		InterviewDate:  req.InterviewDate,
		Location:       req.Location,
		EmploymentType: req.EmploymentType,
		SalaryMin:      req.SalaryMin,
		SalaryMax:      req.SalaryMax,
		Currency:       req.Currency,
		JobURL:         req.JobURL,
		CompanyURL:     req.CompanyURL,
		ContactName:    req.ContactName,
		ContactEmail:   req.ContactEmail,
		Notes:          req.Notes,
		CreatedAt:      now,
		UpdatedAt:      now,
	}, nil
}

// UpdateApplication updates application details
func (m *DBManager) UpdateApplication(req UpdateApplicationRequest) (*Application, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	tx, err := m.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var currentStatus string
	err = tx.QueryRow(`SELECT status FROM applications WHERE id = ?`, req.ID).Scan(&currentStatus)
	if err != nil {
		return nil, fmt.Errorf("application not found: %w", err)
	}

	now := FormatTimeISO(time.Now())

	query := `
		UPDATE applications SET
			company = ?, position = ?, type = ?, status = ?, applied_date = ?, interview_date = ?,
			location = ?, employment_type = ?, salary_min = ?, salary_max = ?, currency = ?,
			job_url = ?, company_url = ?, contact_name = ?, contact_email = ?, notes = ?,
			updated_at = ?
		WHERE id = ?
	`

	_, err = tx.Exec(
		query,
		req.Company, req.Position, req.Type, req.Status, req.AppliedDate, req.InterviewDate,
		req.Location, req.EmploymentType, req.SalaryMin, req.SalaryMax, req.Currency,
		req.JobURL, req.CompanyURL, req.ContactName, req.ContactEmail, req.Notes,
		now, req.ID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update application: %w", err)
	}

	if req.Status != currentStatus || req.StatusNote != "" {
		note := req.StatusNote
		if note == "" {
			note = fmt.Sprintf("Status changed from %s to %s", currentStatus, req.Status)
		}
		_, err = tx.Exec(`
			INSERT INTO timeline_events (application_id, status, note, created_at)
			VALUES (?, ?, ?, ?)
		`, req.ID, req.Status, note, now)
		if err != nil {
			return nil, fmt.Errorf("failed to record status change: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &Application{
		ID:             req.ID,
		Company:        req.Company,
		Position:       req.Position,
		Type:           req.Type,
		Status:         req.Status,
		AppliedDate:    req.AppliedDate,
		InterviewDate:  req.InterviewDate,
		Location:       req.Location,
		EmploymentType: req.EmploymentType,
		SalaryMin:      req.SalaryMin,
		SalaryMax:      req.SalaryMax,
		Currency:       req.Currency,
		JobURL:         req.JobURL,
		CompanyURL:     req.CompanyURL,
		ContactName:    req.ContactName,
		ContactEmail:   req.ContactEmail,
		Notes:          req.Notes,
		UpdatedAt:      now,
	}, nil
}

// UpdateStatus changes only the status with an optional note
func (m *DBManager) UpdateStatus(id int64, newStatus string, note string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	tx, err := m.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var oldStatus string
	err = tx.QueryRow(`SELECT status FROM applications WHERE id = ?`, id).Scan(&oldStatus)
	if err != nil {
		return fmt.Errorf("application not found: %w", err)
	}

	now := FormatTimeISO(time.Now())

	_, err = tx.Exec(`
		UPDATE applications SET status = ?, updated_at = ? WHERE id = ?
	`, newStatus, now, id)
	if err != nil {
		return err
	}

	if note == "" {
		note = fmt.Sprintf("Status changed from %s to %s", oldStatus, newStatus)
	}

	_, err = tx.Exec(`
		INSERT INTO timeline_events (application_id, status, note, created_at)
		VALUES (?, ?, ?, ?)
	`, id, newStatus, note, now)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// SetInterviewDate sets or updates the scheduled interview date
func (m *DBManager) SetInterviewDate(applicationID int64, interviewDate string, note string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	now := FormatTimeISO(time.Now())
	_, err := m.db.Exec(`
		UPDATE applications SET interview_date = ?, updated_at = ? WHERE id = ?
	`, interviewDate, now, applicationID)
	if err != nil {
		return err
	}

	if note == "" && interviewDate != "" {
		note = fmt.Sprintf("Scheduled interview for %s", interviewDate)
	}

	if note != "" {
		_, _ = m.db.Exec(`
			INSERT INTO timeline_events (application_id, status, note, created_at)
			VALUES (?, ?, ?, ?)
		`, applicationID, StatusInterview, note, now)
	}

	return nil
}

// AddTimelineNote adds an entry to the timeline
func (m *DBManager) AddTimelineNote(applicationID int64, status string, note string) (*TimelineEvent, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if status == "" {
		_ = m.db.QueryRow(`SELECT status FROM applications WHERE id = ?`, applicationID).Scan(&status)
		if status == "" {
			status = StatusApplied
		}
	}

	now := FormatTimeISO(time.Now())
	res, err := m.db.Exec(`
		INSERT INTO timeline_events (application_id, status, note, created_at)
		VALUES (?, ?, ?, ?)
	`, applicationID, status, note, now)
	if err != nil {
		return nil, err
	}

	_, _ = m.db.Exec(`UPDATE applications SET updated_at = ? WHERE id = ?`, now, applicationID)

	id, _ := res.LastInsertId()
	return &TimelineEvent{
		ID:            id,
		ApplicationID: applicationID,
		Status:        status,
		Note:          note,
		CreatedAt:     now,
	}, nil
}

// DeleteApplication removes an application and all its timeline events
func (m *DBManager) DeleteApplication(id int64) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	_, err := m.db.Exec(`DELETE FROM applications WHERE id = ?`, id)
	return err
}

// GetApplicationDetail retrieves an application by ID along with its full timeline
func (m *DBManager) GetApplicationDetail(id int64) (*ApplicationDetail, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	row := m.db.QueryRow(`
		SELECT id, company, position, type, status, applied_date, interview_date,
		       location, employment_type, salary_min, salary_max, currency,
		       job_url, company_url, contact_name, contact_email, notes,
		       created_at, updated_at
		FROM applications WHERE id = ?
	`, id)

	var app Application
	err := row.Scan(
		&app.ID, &app.Company, &app.Position, &app.Type, &app.Status, &app.AppliedDate, &app.InterviewDate,
		&app.Location, &app.EmploymentType, &app.SalaryMin, &app.SalaryMax, &app.Currency,
		&app.JobURL, &app.CompanyURL, &app.ContactName, &app.ContactEmail, &app.Notes,
		&app.CreatedAt, &app.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	rows, err := m.db.Query(`
		SELECT id, application_id, status, note, created_at
		FROM timeline_events
		WHERE application_id = ?
		ORDER BY created_at DESC, id DESC
	`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	timeline := make([]TimelineEvent, 0)
	for rows.Next() {
		var evt TimelineEvent
		if err := rows.Scan(&evt.ID, &evt.ApplicationID, &evt.Status, &evt.Note, &evt.CreatedAt); err == nil {
			timeline = append(timeline, evt)
		}
	}

	return &ApplicationDetail{
		Application: app,
		Timeline:    timeline,
	}, nil
}

// GetApplications queries applications with search, filters, and sorting
func (m *DBManager) GetApplications(opt FilterOptions) ([]Application, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var conditions []string
	var args []interface{}

	if strings.TrimSpace(opt.Search) != "" {
		searchTerm := "%" + strings.TrimSpace(opt.Search) + "%"
		conditions = append(conditions, "(company LIKE ? OR position LIKE ? OR location LIKE ? OR notes LIKE ? OR contact_name LIKE ?)")
		args = append(args, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
	}

	if opt.Type != "" && strings.ToUpper(opt.Type) != "ALL" {
		conditions = append(conditions, "type = ?")
		args = append(args, strings.ToUpper(opt.Type))
	}

	if opt.Status != "" && strings.ToUpper(opt.Status) != "ALL" {
		conditions = append(conditions, "status = ?")
		args = append(args, strings.ToUpper(opt.Status))
	}

	if strings.TrimSpace(opt.Location) != "" {
		conditions = append(conditions, "location LIKE ?")
		args = append(args, "%"+strings.TrimSpace(opt.Location)+"%")
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	orderBy := "updated_at DESC"
	switch opt.SortBy {
	case "oldest_updated":
		orderBy = "updated_at ASC"
	case "newest_applied":
		orderBy = "applied_date DESC, updated_at DESC"
	case "oldest_applied":
		orderBy = "applied_date ASC, updated_at ASC"
	case "company_asc":
		orderBy = "company COLLATE NOCASE ASC"
	case "company_desc":
		orderBy = "company COLLATE NOCASE DESC"
	default:
		orderBy = "updated_at DESC"
	}

	query := fmt.Sprintf(`
		SELECT id, company, position, type, status, applied_date, interview_date,
		       location, employment_type, salary_min, salary_max, currency,
		       job_url, company_url, contact_name, contact_email, notes,
		       created_at, updated_at
		FROM applications
		%s
		ORDER BY %s
	`, whereClause, orderBy)

	rows, err := m.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	apps := make([]Application, 0)
	for rows.Next() {
		var a Application
		err := rows.Scan(
			&a.ID, &a.Company, &a.Position, &a.Type, &a.Status, &a.AppliedDate, &a.InterviewDate,
			&a.Location, &a.EmploymentType, &a.SalaryMin, &a.SalaryMax, &a.Currency,
			&a.JobURL, &a.CompanyURL, &a.ContactName, &a.ContactEmail, &a.Notes,
			&a.CreatedAt, &a.UpdatedAt,
		)
		if err == nil {
			apps = append(apps, a)
		}
	}

	return apps, nil
}

// GetRecentApplications retrieves the top N most recently updated applications
func (m *DBManager) GetRecentApplications(limit int) ([]Application, error) {
	if limit <= 0 {
		limit = 10
	}
	return m.GetApplications(FilterOptions{
		SortBy: "recently_updated",
	})
}

// GetStats computes KPI metrics and status distribution
func (m *DBManager) GetStats() (*Stats, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	stats := &Stats{
		StatusDistribution: map[string]int{
			StatusSaved:     0,
			StatusApplied:   0,
			StatusScreening: 0,
			StatusInterview: 0,
			StatusOffer:     0,
			StatusRejected:  0,
			StatusWithdrawn: 0,
		},
	}

	rows, err := m.db.Query(`SELECT status, COUNT(*) FROM applications GROUP BY status`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var status string
		var count int
		if err := rows.Scan(&status, &count); err == nil {
			stats.TotalApplications += count
			stats.StatusDistribution[status] = count

			switch status {
			case StatusSaved, StatusApplied, StatusScreening, StatusInterview:
				stats.ActiveApplications += count
			}

			if status == StatusInterview {
				stats.Interviews = count
			} else if status == StatusOffer {
				stats.Offers = count
			} else if status == StatusRejected {
				stats.Rejected = count
			}
		}
	}

	return stats, nil
}

// GetScheduleEvents aggregates interview dates, applied dates, and timeline activities for the calendar
func (m *DBManager) GetScheduleEvents() ([]ScheduleEvent, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	events := make([]ScheduleEvent, 0)

	// 1. Applications with interview_date
	rows, err := m.db.Query(`
		SELECT id, company, position, status, interview_date
		FROM applications
		WHERE interview_date != ''
		ORDER BY interview_date ASC
	`)
	if err == nil {
		for rows.Next() {
			var id int64
			var comp, pos, stat, iDate string
			if err := rows.Scan(&id, &comp, &pos, &stat, &iDate); err == nil {
				datePart := iDate
				timePart := ""
				if strings.Contains(iDate, "T") {
					parts := strings.Split(iDate, "T")
					datePart = parts[0]
					if len(parts) > 1 {
						timePart = parts[1]
					}
				} else if strings.Contains(iDate, " ") {
					parts := strings.Split(iDate, " ")
					datePart = parts[0]
					if len(parts) > 1 {
						timePart = parts[1]
					}
				}
				events = append(events, ScheduleEvent{
					ID:            id,
					ApplicationID: id,
					Company:       comp,
					Position:      pos,
					EventType:     "INTERVIEW",
					Date:          datePart,
					Time:          timePart,
					Status:        stat,
					Title:         fmt.Sprintf("Interview: %s", comp),
					Description:   fmt.Sprintf("%s at %s", pos, comp),
				})
			}
		}
		rows.Close()
	}

	// 2. Applications applied_date
	appRows, err := m.db.Query(`
		SELECT id, company, position, status, applied_date
		FROM applications
		WHERE applied_date != ''
		ORDER BY applied_date ASC
	`)
	if err == nil {
		for appRows.Next() {
			var id int64
			var comp, pos, stat, aDate string
			if err := appRows.Scan(&id, &comp, &pos, &stat, &aDate); err == nil {
				events = append(events, ScheduleEvent{
					ID:            id,
					ApplicationID: id,
					Company:       comp,
					Position:      pos,
					EventType:     "APPLIED",
					Date:          aDate,
					Status:        stat,
					Title:         fmt.Sprintf("Applied: %s", comp),
					Description:   fmt.Sprintf("Submitted application for %s", pos),
				})
			}
		}
		appRows.Close()
	}

	// 3. Timeline events
	tmRows, err := m.db.Query(`
		SELECT t.id, t.application_id, a.company, a.position, t.status, t.note, t.created_at
		FROM timeline_events t
		JOIN applications a ON a.id = t.application_id
		WHERE t.note != ''
		ORDER BY t.created_at ASC
	`)
	if err == nil {
		for tmRows.Next() {
			var tid, aid int64
			var comp, pos, stat, note, created string
			if err := tmRows.Scan(&tid, &aid, &comp, &pos, &stat, &note, &created); err == nil {
				datePart := created
				timePart := ""
				if len(created) >= 10 {
					datePart = created[:10]
				}
				if len(created) >= 16 && strings.Contains(created, "T") {
					parts := strings.Split(created, "T")
					if len(parts) > 1 && len(parts[1]) >= 5 {
						timePart = parts[1][:5]
					}
				}
				events = append(events, ScheduleEvent{
					ID:            tid,
					ApplicationID: aid,
					Company:       comp,
					Position:      pos,
					EventType:     "TIMELINE",
					Date:          datePart,
					Time:          timePart,
					Status:        stat,
					Title:         fmt.Sprintf("%s: %s", stat, comp),
					Description:   note,
				})
			}
		}
		tmRows.Close()
	}

	return events, nil
}

// ExportAllData returns full json representation of all applications and timelines
func (m *DBManager) ExportAllData() ([]ExportImportRecord, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	apps, err := m.GetApplications(FilterOptions{SortBy: "recently_updated"})
	if err != nil {
		return nil, err
	}

	records := make([]ExportImportRecord, 0, len(apps))
	for _, app := range apps {
		detail, err := m.GetApplicationDetail(app.ID)
		if err == nil {
			records = append(records, ExportImportRecord{
				Application: detail.Application,
				Timeline:    detail.Timeline,
			})
		}
	}

	return records, nil
}

// ExportCSV returns CSV string of applications
func (m *DBManager) ExportCSV() (string, error) {
	apps, err := m.GetApplications(FilterOptions{SortBy: "recently_updated"})
	if err != nil {
		return "", err
	}

	var sb strings.Builder
	writer := csv.NewWriter(&sb)

	headers := []string{
		"ID", "Company", "Position", "Type", "Status", "Applied Date", "Interview Date",
		"Location", "Employment Type", "Salary Min", "Salary Max", "Currency",
		"Job URL", "Company URL", "Contact Name", "Contact Email", "Notes", "Updated At",
	}
	if err := writer.Write(headers); err != nil {
		return "", err
	}

	for _, a := range apps {
		record := []string{
			fmt.Sprintf("%d", a.ID),
			a.Company,
			a.Position,
			a.Type,
			a.Status,
			a.AppliedDate,
			a.InterviewDate,
			a.Location,
			a.EmploymentType,
			fmt.Sprintf("%.0f", a.SalaryMin),
			fmt.Sprintf("%.0f", a.SalaryMax),
			a.Currency,
			a.JobURL,
			a.CompanyURL,
			a.ContactName,
			a.ContactEmail,
			a.Notes,
			a.UpdatedAt,
		}
		if err := writer.Write(record); err != nil {
			return "", err
		}
	}

	writer.Flush()
	return sb.String(), nil
}

// ImportData imports records into SQLite
func (m *DBManager) ImportData(records []ExportImportRecord) (int, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	tx, err := m.db.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	insertedCount := 0
	for _, rec := range records {
		app := rec.Application
		now := FormatTimeISO(time.Now())
		if app.CreatedAt == "" {
			app.CreatedAt = now
		}
		if app.UpdatedAt == "" {
			app.UpdatedAt = now
		}

		res, err := tx.Exec(`
			INSERT INTO applications (
				company, position, type, status, applied_date, interview_date,
				location, employment_type, salary_min, salary_max, currency,
				job_url, company_url, contact_name, contact_email, notes,
				created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, app.Company, app.Position, app.Type, app.Status, app.AppliedDate, app.InterviewDate,
			app.Location, app.EmploymentType, app.SalaryMin, app.SalaryMax, app.Currency,
			app.JobURL, app.CompanyURL, app.ContactName, app.ContactEmail, app.Notes,
			app.CreatedAt, app.UpdatedAt)
		if err != nil {
			continue
		}

		newAppID, _ := res.LastInsertId()
		insertedCount++

		for _, evt := range rec.Timeline {
			evtCreated := evt.CreatedAt
			if evtCreated == "" {
				evtCreated = now
			}
			_, _ = tx.Exec(`
				INSERT INTO timeline_events (application_id, status, note, created_at)
				VALUES (?, ?, ?, ?)
			`, newAppID, evt.Status, evt.Note, evtCreated)
		}
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return insertedCount, nil
}

// RestoreFromBackup replaces the current SQLite file with a backup file
func (m *DBManager) RestoreFromBackup(backupPath string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.db != nil {
		_ = m.db.Close()
	}

	source, err := os.Open(backupPath)
	if err != nil {
		return fmt.Errorf("failed to open backup file: %w", err)
	}
	defer source.Close()

	dest, err := os.Create(m.dbPath)
	if err != nil {
		return fmt.Errorf("failed to create destination db file: %w", err)
	}
	defer dest.Close()

	if _, err := io.Copy(dest, source); err != nil {
		return fmt.Errorf("failed to copy file: %w", err)
	}

	db, err := sql.Open("sqlite", m.dbPath)
	if err != nil {
		return fmt.Errorf("failed to reopen database: %w", err)
	}
	m.db = db
	return m.migrate()
}

// GetEmailAccounts returns all configured email accounts
func (m *DBManager) GetEmailAccounts() ([]EmailAccount, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	rows, err := m.db.Query(`
		SELECT id, label, provider, email, imap_host, imap_port, app_password, use_ssl, is_active,
		       last_sync_at, last_sync_status, created_at, updated_at
		FROM email_accounts
		ORDER BY id ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var accounts []EmailAccount
	for rows.Next() {
		var a EmailAccount
		var useSSL, isActive int
		if err := rows.Scan(
			&a.ID, &a.Label, &a.Provider, &a.Email, &a.IMAPHost, &a.IMAPPort, &a.AppPassword,
			&useSSL, &isActive, &a.LastSyncAt, &a.LastSyncStatus, &a.CreatedAt, &a.UpdatedAt,
		); err != nil {
			return nil, err
		}
		a.UseSSL = useSSL == 1
		a.IsActive = isActive == 1
		accounts = append(accounts, a)
	}

	if accounts == nil {
		accounts = []EmailAccount{}
	}
	return accounts, nil
}

// GetEmailAccount returns a single email account by ID
func (m *DBManager) GetEmailAccount(id int64) (*EmailAccount, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var a EmailAccount
	var useSSL, isActive int
	err := m.db.QueryRow(`
		SELECT id, label, provider, email, imap_host, imap_port, app_password, use_ssl, is_active,
		       last_sync_at, last_sync_status, created_at, updated_at
		FROM email_accounts
		WHERE id = ?
	`, id).Scan(
		&a.ID, &a.Label, &a.Provider, &a.Email, &a.IMAPHost, &a.IMAPPort, &a.AppPassword,
		&useSSL, &isActive, &a.LastSyncAt, &a.LastSyncStatus, &a.CreatedAt, &a.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	a.UseSSL = useSSL == 1
	a.IsActive = isActive == 1
	return &a, nil
}

// SaveEmailAccount inserts or updates an email account
func (m *DBManager) SaveEmailAccount(req EmailAccountRequest) (*EmailAccount, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	now := time.Now().UTC().Format(time.RFC3339)
	useSSLInt := 0
	if req.UseSSL {
		useSSLInt = 1
	}
	isActiveInt := 0
	if req.IsActive {
		isActiveInt = 1
	}

	if req.IMAPPort <= 0 {
		req.IMAPPort = 993
	}
	if req.Provider == "" {
		req.Provider = ProviderGmail
	}

	if req.ID > 0 {
		// Update existing
		_, err := m.db.Exec(`
			UPDATE email_accounts
			SET label = ?, provider = ?, email = ?, imap_host = ?, imap_port = ?,
			    app_password = ?, use_ssl = ?, is_active = ?, updated_at = ?
			WHERE id = ?
		`, req.Label, req.Provider, req.Email, req.IMAPHost, req.IMAPPort,
			req.AppPassword, useSSLInt, isActiveInt, now, req.ID)
		if err != nil {
			return nil, err
		}
	} else {
		// Insert new
		res, err := m.db.Exec(`
			INSERT INTO email_accounts (
				label, provider, email, imap_host, imap_port, app_password,
				use_ssl, is_active, last_sync_at, last_sync_status, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', '', ?, ?)
		`, req.Label, req.Provider, req.Email, req.IMAPHost, req.IMAPPort,
			req.AppPassword, useSSLInt, isActiveInt, now, now)
		if err != nil {
			return nil, err
		}
		newID, _ := res.LastInsertId()
		req.ID = newID
	}

	var a EmailAccount
	var useSSL, isActive int
	err := m.db.QueryRow(`
		SELECT id, label, provider, email, imap_host, imap_port, app_password, use_ssl, is_active,
		       last_sync_at, last_sync_status, created_at, updated_at
		FROM email_accounts
		WHERE id = ?
	`, req.ID).Scan(
		&a.ID, &a.Label, &a.Provider, &a.Email, &a.IMAPHost, &a.IMAPPort, &a.AppPassword,
		&useSSL, &isActive, &a.LastSyncAt, &a.LastSyncStatus, &a.CreatedAt, &a.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	a.UseSSL = useSSL == 1
	a.IsActive = isActive == 1
	return &a, nil
}

// DeleteEmailAccount deletes an email account and its associated notifications
func (m *DBManager) DeleteEmailAccount(id int64) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	_, err := m.db.Exec(`DELETE FROM email_accounts WHERE id = ?`, id)
	return err
}

// UpdateEmailAccountSyncStatus records last sync timestamp and status
func (m *DBManager) UpdateEmailAccountSyncStatus(id int64, status string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	now := time.Now().Format("2006-01-02 15:04")
	_, err := m.db.Exec(`
		UPDATE email_accounts
		SET last_sync_at = ?, last_sync_status = ?
		WHERE id = ?
	`, now, status, id)
	return err
}

// GetExistingMessageIDs returns map of already fetched message IDs for an account
func (m *DBManager) GetExistingMessageIDs(accountID int64) (map[string]bool, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	rows, err := m.db.Query(`SELECT message_id FROM email_notifications WHERE account_id = ?`, accountID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	ids := make(map[string]bool)
	for rows.Next() {
		var msgID string
		if err := rows.Scan(&msgID); err == nil {
			ids[msgID] = true
		}
	}
	return ids, nil
}

// InsertEmailNotifications saves newly parsed notifications
func (m *DBManager) InsertEmailNotifications(notifs []EmailNotification) (int, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if len(notifs) == 0 {
		return 0, nil
	}

	tx, err := m.db.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
		INSERT OR IGNORE INTO email_notifications (
			account_id, account_email, message_id, sender, subject, snippet, platform,
			detected_company, detected_role, detected_status, received_at, is_read, created_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	inserted := 0
	for _, n := range notifs {
		res, err := stmt.Exec(
			n.AccountID, n.AccountEmail, n.MessageID, n.Sender, n.Subject, n.Snippet, n.Platform,
			n.DetectedCompany, n.DetectedRole, n.DetectedStatus, n.ReceivedAt, n.CreatedAt,
		)
		if err == nil {
			rowsAffected, _ := res.RowsAffected()
			if rowsAffected > 0 {
				inserted++
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}
	return inserted, nil
}

// GetEmailNotifications returns notifications with optional platform and unread filtering
func (m *DBManager) GetEmailNotifications(limit int, unreadOnly bool, platform string) ([]EmailNotification, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	query := `
		SELECT id, account_id, account_email, message_id, sender, subject, snippet, platform,
		       detected_company, detected_role, detected_status, received_at, is_read, created_at
		FROM email_notifications
		WHERE 1=1
	`
	var args []interface{}

	if unreadOnly {
		query += ` AND is_read = 0`
	}
	if platform != "" && platform != "ALL" {
		query += ` AND platform = ?`
		args = append(args, platform)
	}

	query += ` ORDER BY received_at DESC, id DESC`
	if limit > 0 {
		query += ` LIMIT ?`
		args = append(args, limit)
	} else {
		query += ` LIMIT 200`
	}

	rows, err := m.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifs []EmailNotification
	for rows.Next() {
		var n EmailNotification
		var isReadInt int
		if err := rows.Scan(
			&n.ID, &n.AccountID, &n.AccountEmail, &n.MessageID, &n.Sender, &n.Subject, &n.Snippet,
			&n.Platform, &n.DetectedCompany, &n.DetectedRole, &n.DetectedStatus,
			&n.ReceivedAt, &isReadInt, &n.CreatedAt,
		); err != nil {
			return nil, err
		}
		n.IsRead = isReadInt == 1
		notifs = append(notifs, n)
	}

	if notifs == nil {
		notifs = []EmailNotification{}
	}
	return notifs, nil
}

// MarkNotificationAsRead updates the read state of a notification
func (m *DBManager) MarkNotificationAsRead(id int64, isRead bool) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	readInt := 0
	if isRead {
		readInt = 1
	}
	_, err := m.db.Exec(`UPDATE email_notifications SET is_read = ? WHERE id = ?`, readInt, id)
	return err
}

// MarkAllNotificationsAsRead marks all notifications as read
func (m *DBManager) MarkAllNotificationsAsRead() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	_, err := m.db.Exec(`UPDATE email_notifications SET is_read = 1`)
	return err
}

// DeleteNotification removes a notification
func (m *DBManager) DeleteNotification(id int64) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	_, err := m.db.Exec(`DELETE FROM email_notifications WHERE id = ?`, id)
	return err
}

// GetUnreadNotificationCount returns the number of unread notifications
func (m *DBManager) GetUnreadNotificationCount() (int, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var count int
	err := m.db.QueryRow(`SELECT COUNT(*) FROM email_notifications WHERE is_read = 0`).Scan(&count)
	return count, err
}
