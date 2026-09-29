export namespace backend {
	
	export class Application {
	    id: number;
	    company: string;
	    position: string;
	    type: string;
	    status: string;
	    applied_date: string;
	    interview_date: string;
	    location: string;
	    employment_type: string;
	    salary_min: number;
	    salary_max: number;
	    currency: string;
	    job_url: string;
	    company_url: string;
	    contact_name: string;
	    contact_email: string;
	    notes: string;
	    created_at: string;
	    updated_at: string;
	
	    static createFrom(source: any = {}) {
	        return new Application(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.company = source["company"];
	        this.position = source["position"];
	        this.type = source["type"];
	        this.status = source["status"];
	        this.applied_date = source["applied_date"];
	        this.interview_date = source["interview_date"];
	        this.location = source["location"];
	        this.employment_type = source["employment_type"];
	        this.salary_min = source["salary_min"];
	        this.salary_max = source["salary_max"];
	        this.currency = source["currency"];
	        this.job_url = source["job_url"];
	        this.company_url = source["company_url"];
	        this.contact_name = source["contact_name"];
	        this.contact_email = source["contact_email"];
	        this.notes = source["notes"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}
	export class TimelineEvent {
	    id: number;
	    application_id: number;
	    status: string;
	    note: string;
	    created_at: string;
	
	    static createFrom(source: any = {}) {
	        return new TimelineEvent(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.application_id = source["application_id"];
	        this.status = source["status"];
	        this.note = source["note"];
	        this.created_at = source["created_at"];
	    }
	}
	export class ApplicationDetail {
	    id: number;
	    company: string;
	    position: string;
	    type: string;
	    status: string;
	    applied_date: string;
	    interview_date: string;
	    location: string;
	    employment_type: string;
	    salary_min: number;
	    salary_max: number;
	    currency: string;
	    job_url: string;
	    company_url: string;
	    contact_name: string;
	    contact_email: string;
	    notes: string;
	    created_at: string;
	    updated_at: string;
	    timeline: TimelineEvent[];
	
	    static createFrom(source: any = {}) {
	        return new ApplicationDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.company = source["company"];
	        this.position = source["position"];
	        this.type = source["type"];
	        this.status = source["status"];
	        this.applied_date = source["applied_date"];
	        this.interview_date = source["interview_date"];
	        this.location = source["location"];
	        this.employment_type = source["employment_type"];
	        this.salary_min = source["salary_min"];
	        this.salary_max = source["salary_max"];
	        this.currency = source["currency"];
	        this.job_url = source["job_url"];
	        this.company_url = source["company_url"];
	        this.contact_name = source["contact_name"];
	        this.contact_email = source["contact_email"];
	        this.notes = source["notes"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	        this.timeline = this.convertValues(source["timeline"], TimelineEvent);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CreateApplicationRequest {
	    company: string;
	    position: string;
	    type: string;
	    status: string;
	    applied_date: string;
	    interview_date: string;
	    location: string;
	    employment_type: string;
	    salary_min: number;
	    salary_max: number;
	    currency: string;
	    job_url: string;
	    company_url: string;
	    contact_name: string;
	    contact_email: string;
	    notes: string;
	    initial_note: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateApplicationRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.company = source["company"];
	        this.position = source["position"];
	        this.type = source["type"];
	        this.status = source["status"];
	        this.applied_date = source["applied_date"];
	        this.interview_date = source["interview_date"];
	        this.location = source["location"];
	        this.employment_type = source["employment_type"];
	        this.salary_min = source["salary_min"];
	        this.salary_max = source["salary_max"];
	        this.currency = source["currency"];
	        this.job_url = source["job_url"];
	        this.company_url = source["company_url"];
	        this.contact_name = source["contact_name"];
	        this.contact_email = source["contact_email"];
	        this.notes = source["notes"];
	        this.initial_note = source["initial_note"];
	    }
	}
	export class EmailAccount {
	    id: number;
	    label: string;
	    provider: string;
	    email: string;
	    imap_host: string;
	    imap_port: number;
	    app_password: string;
	    use_ssl: boolean;
	    is_active: boolean;
	    last_sync_at: string;
	    last_sync_status: string;
	    created_at: string;
	    updated_at: string;
	
	    static createFrom(source: any = {}) {
	        return new EmailAccount(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.label = source["label"];
	        this.provider = source["provider"];
	        this.email = source["email"];
	        this.imap_host = source["imap_host"];
	        this.imap_port = source["imap_port"];
	        this.app_password = source["app_password"];
	        this.use_ssl = source["use_ssl"];
	        this.is_active = source["is_active"];
	        this.last_sync_at = source["last_sync_at"];
	        this.last_sync_status = source["last_sync_status"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}
	export class EmailAccountRequest {
	    id: number;
	    label: string;
	    provider: string;
	    email: string;
	    imap_host: string;
	    imap_port: number;
	    app_password: string;
	    use_ssl: boolean;
	    is_active: boolean;
	
	    static createFrom(source: any = {}) {
	        return new EmailAccountRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.label = source["label"];
	        this.provider = source["provider"];
	        this.email = source["email"];
	        this.imap_host = source["imap_host"];
	        this.imap_port = source["imap_port"];
	        this.app_password = source["app_password"];
	        this.use_ssl = source["use_ssl"];
	        this.is_active = source["is_active"];
	    }
	}
	export class EmailNotification {
	    id: number;
	    account_id: number;
	    account_email: string;
	    message_id: string;
	    sender: string;
	    subject: string;
	    snippet: string;
	    platform: string;
	    detected_company: string;
	    detected_role: string;
	    detected_status: string;
	    received_at: string;
	    is_read: boolean;
	    created_at: string;
	
	    static createFrom(source: any = {}) {
	        return new EmailNotification(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.account_id = source["account_id"];
	        this.account_email = source["account_email"];
	        this.message_id = source["message_id"];
	        this.sender = source["sender"];
	        this.subject = source["subject"];
	        this.snippet = source["snippet"];
	        this.platform = source["platform"];
	        this.detected_company = source["detected_company"];
	        this.detected_role = source["detected_role"];
	        this.detected_status = source["detected_status"];
	        this.received_at = source["received_at"];
	        this.is_read = source["is_read"];
	        this.created_at = source["created_at"];
	    }
	}
	export class FilterOptions {
	    search: string;
	    type: string;
	    status: string;
	    location: string;
	    sort_by: string;
	
	    static createFrom(source: any = {}) {
	        return new FilterOptions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.search = source["search"];
	        this.type = source["type"];
	        this.status = source["status"];
	        this.location = source["location"];
	        this.sort_by = source["sort_by"];
	    }
	}
	export class ScheduleEvent {
	    id: number;
	    application_id: number;
	    company: string;
	    position: string;
	    event_type: string;
	    date: string;
	    time: string;
	    status: string;
	    title: string;
	    description: string;
	
	    static createFrom(source: any = {}) {
	        return new ScheduleEvent(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.application_id = source["application_id"];
	        this.company = source["company"];
	        this.position = source["position"];
	        this.event_type = source["event_type"];
	        this.date = source["date"];
	        this.time = source["time"];
	        this.status = source["status"];
	        this.title = source["title"];
	        this.description = source["description"];
	    }
	}
	export class Stats {
	    total_applications: number;
	    active_applications: number;
	    interviews: number;
	    offers: number;
	    rejected: number;
	    status_distribution: Record<string, number>;
	
	    static createFrom(source: any = {}) {
	        return new Stats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.total_applications = source["total_applications"];
	        this.active_applications = source["active_applications"];
	        this.interviews = source["interviews"];
	        this.offers = source["offers"];
	        this.rejected = source["rejected"];
	        this.status_distribution = source["status_distribution"];
	    }
	}
	export class SyncResult {
	    account_id: number;
	    account_email: string;
	    success: boolean;
	    new_emails: number;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new SyncResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.account_id = source["account_id"];
	        this.account_email = source["account_email"];
	        this.success = source["success"];
	        this.new_emails = source["new_emails"];
	        this.error = source["error"];
	    }
	}
	
	export class UpdateApplicationRequest {
	    id: number;
	    company: string;
	    position: string;
	    type: string;
	    status: string;
	    applied_date: string;
	    interview_date: string;
	    location: string;
	    employment_type: string;
	    salary_min: number;
	    salary_max: number;
	    currency: string;
	    job_url: string;
	    company_url: string;
	    contact_name: string;
	    contact_email: string;
	    notes: string;
	    status_note: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateApplicationRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.company = source["company"];
	        this.position = source["position"];
	        this.type = source["type"];
	        this.status = source["status"];
	        this.applied_date = source["applied_date"];
	        this.interview_date = source["interview_date"];
	        this.location = source["location"];
	        this.employment_type = source["employment_type"];
	        this.salary_min = source["salary_min"];
	        this.salary_max = source["salary_max"];
	        this.currency = source["currency"];
	        this.job_url = source["job_url"];
	        this.company_url = source["company_url"];
	        this.contact_name = source["contact_name"];
	        this.contact_email = source["contact_email"];
	        this.notes = source["notes"];
	        this.status_note = source["status_note"];
	    }
	}

}

