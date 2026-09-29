package backend

import (
	"time"
)

// Application types
const (
	TypeJob        = "JOB"
	TypeInternship = "INTERNSHIP"
)

// Application statuses
const (
	StatusSaved     = "SAVED"
	StatusApplied   = "APPLIED"
	StatusScreening = "SCREENING"
	StatusInterview = "INTERVIEW"
	StatusOffer     = "OFFER"
	StatusRejected  = "REJECTED"
	StatusWithdrawn = "WITHDRAWN"
)

// Application represents a job or internship application
type Application struct {
	ID             int64   `json:"id"`
	Company        string  `json:"company"`
	Position       string  `json:"position"`
	Type           string  `json:"type"`            // JOB, INTERNSHIP
	Status         string  `json:"status"`          // SAVED, APPLIED, SCREENING, INTERVIEW, OFFER, REJECTED, WITHDRAWN
	AppliedDate    string  `json:"applied_date"`    // YYYY-MM-DD
	InterviewDate  string  `json:"interview_date"`  // YYYY-MM-DD or YYYY-MM-DDTHH:mm
	Location       string  `json:"location"`        // optional
	EmploymentType string  `json:"employment_type"` // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
	SalaryMin      float64 `json:"salary_min"`
	SalaryMax      float64 `json:"salary_max"`
	Currency       string  `json:"currency"`        // Default IDR
	JobURL         string  `json:"job_url"`
	CompanyURL     string  `json:"company_url"`
	ContactName    string  `json:"contact_name"`
	ContactEmail   string  `json:"contact_email"`
	Notes          string  `json:"notes"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}

// TimelineEvent represents status change history or log note
type TimelineEvent struct {
	ID            int64  `json:"id"`
	ApplicationID int64  `json:"application_id"`
	Status        string `json:"status"`
	Note          string `json:"note"`
	CreatedAt     string `json:"created_at"`
}

// ApplicationDetail includes application data along with timeline events
type ApplicationDetail struct {
	Application
	Timeline []TimelineEvent `json:"timeline"`
}

// FilterOptions for querying applications
type FilterOptions struct {
	Search   string `json:"search"`
	Type     string `json:"type"`      // ALL, JOB, INTERNSHIP
	Status   string `json:"status"`    // ALL, SAVED, APPLIED, ...
	Location string `json:"location"`
	SortBy   string `json:"sort_by"`   // recently_updated, oldest_updated, newest_applied, oldest_applied, company_asc, company_desc
}

// Stats for dashboard KPI cards and distribution
type Stats struct {
	TotalApplications  int            `json:"total_applications"`
	ActiveApplications int            `json:"active_applications"`
	Interviews         int            `json:"interviews"`
	Offers             int            `json:"offers"`
	Rejected           int            `json:"rejected"`
	StatusDistribution map[string]int `json:"status_distribution"`
}

// CreateApplicationRequest payload
type CreateApplicationRequest struct {
	Company        string  `json:"company"`
	Position       string  `json:"position"`
	Type           string  `json:"type"`
	Status         string  `json:"status"`
	AppliedDate    string  `json:"applied_date"`
	InterviewDate  string  `json:"interview_date"`
	Location       string  `json:"location"`
	EmploymentType string  `json:"employment_type"`
	SalaryMin      float64 `json:"salary_min"`
	SalaryMax      float64 `json:"salary_max"`
	Currency       string  `json:"currency"`
	JobURL         string  `json:"job_url"`
	CompanyURL     string  `json:"company_url"`
	ContactName    string  `json:"contact_name"`
	ContactEmail   string  `json:"contact_email"`
	Notes          string  `json:"notes"`
	InitialNote    string  `json:"initial_note"`
}

// UpdateApplicationRequest payload
type UpdateApplicationRequest struct {
	ID             int64   `json:"id"`
	Company        string  `json:"company"`
	Position       string  `json:"position"`
	Type           string  `json:"type"`
	Status         string  `json:"status"`
	AppliedDate    string  `json:"applied_date"`
	InterviewDate  string  `json:"interview_date"`
	Location       string  `json:"location"`
	EmploymentType string  `json:"employment_type"`
	SalaryMin      float64 `json:"salary_min"`
	SalaryMax      float64 `json:"salary_max"`
	Currency       string  `json:"currency"`
	JobURL         string  `json:"job_url"`
	CompanyURL     string  `json:"company_url"`
	ContactName    string  `json:"contact_name"`
	ContactEmail   string  `json:"contact_email"`
	Notes          string  `json:"notes"`
	StatusNote     string  `json:"status_note"` // note if status is being changed
}

// ScheduleEvent represents an item on the calendar
type ScheduleEvent struct {
	ID            int64  `json:"id"`
	ApplicationID int64  `json:"application_id"`
	Company       string `json:"company"`
	Position      string `json:"position"`
	EventType     string `json:"event_type"` // INTERVIEW, APPLIED, TIMELINE
	Date          string `json:"date"`       // YYYY-MM-DD
	Time          string `json:"time"`       // HH:mm if available
	Status        string `json:"status"`
	Title         string `json:"title"`
	Description   string `json:"description"`
}

// ExportImportRecord represents full dump for backup/import
type ExportImportRecord struct {
	Application Application     `json:"application"`
	Timeline    []TimelineEvent `json:"timeline"`
}

// FormatTimeISO formats Go time to ISO8601 string
func FormatTimeISO(t time.Time) string {
	return t.UTC().Format(time.RFC3339)
}
