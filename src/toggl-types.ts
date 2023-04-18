namespace models {
  export type CardDetails = unknown;
  export type ContactDetail = unknown;
  export type PaymentDetail = unknown;
  export type Period = unknown;
  export type RecurringPeriod = unknown;
  export type RecurringProjectParameters = unknown;
}
export type Subscription = {
  auto_renew: boolean;
  card_details: models.CardDetails;
  company_id: number;
  contact_detail: models.ContactDetail;
  created_at: string;
  currency: string;
  customer_id: number;
  deleted_at: string;
  last_pricing_plan_id: number;
  organization_id: number;
  payment_details: models.PaymentDetail;
  pricing_plan_id: number;
  renewal_at: string;
  subscription_id: number;
  subscription_period: models.Period;
  workspace_id: number;
};

export type TimeEntryConstraints = {
  description_present: boolean;
  project_present: boolean;
  tag_present: boolean;
  task_present: boolean;
  time_entry_constraints_enabled: boolean;
};

export type CsvUpload = {
  at: string;
  log_id: number;
};

export type Workspace = {
  admin: boolean;
  api_token: string;
  at: string;
  business_ws: boolean;
  csv_upload: CsvUpload;
  default_currency: string;
  default_hourly_rate: number;
  ical_enabled: boolean;
  ical_url: string;
  id: number;
  logo_url: string;
  name: string;
  only_admins_may_create_projects: boolean;
  only_admins_may_create_tags: boolean;
  only_admins_see_billable_rates: boolean;
  only_admins_see_team_dashboard: boolean;
  organization_id: number;
  premium: boolean;
  profile: number;
  projects_billable_by_default: boolean;
  rate_last_updated: string;
  reports_collapse: boolean;
  rounding: number;
  rounding_minutes: number;
  server_deleted_at: string;
  subscription: Subscription;
  suspended_at: string;
  te_constraints: TimeEntryConstraints;
};
type Clients = {
  archived: boolean;
  at: string;
  id: number;
  name: string;
  server_deleted_at: string | null;
  wid: number;
};

type Projects = {
  active: boolean;
  actual_hours: number | null;
  at: string;
  auto_estimates: boolean | null;
  billable: boolean | null;
  cid: number;
  client_id: number | null;
  color: string;
  created_at: string;
  currency: string | null;
  current_period: models.RecurringPeriod;
  end_date: string;
  estimated_hours: number | null;
  first_time_entry: string;
  fixed_fee: number;
  id: number;
  is_private: boolean;
  name: string;
  rate: number;
  rate_last_updated: string | null;
  recurring: boolean;
  recurring_parameters: models.RecurringProjectParameters[];
  server_deleted_at: string | null;
  start_date: string;
  template: boolean | null;
  wid: number;
  workspace_id: number;
};

type Tags = {
  at: string;
  deleted_at: string;
  id: number;
  name: string;
  workspace_id: number;
};

type Tasks = {
  active: boolean;
  at: string;
  estimated_seconds: number | null;
  id: number;
  name: string;
  project_id: number;
  recurring: boolean;
  server_deleted_at: string | null;
  tracked_seconds: number;
  user_id: number | null;
  workspace_id: number;
};

type Options = {
  additionalProperties: object;
};
export interface TimeEntryBase {
  billable?: boolean;
  description?: string | null;
  duration?: number;
  duronly?: boolean; // Deprecated
  pid?: number; // Legacy field
  project_id?: number | null;
  start: string;
  stop?: string | null;
  tag_ids?: number[] | null;
  tags?: string[] | null;
  task_id?: number | null;
  tid?: number; // Legacy field
  uid?: number; // Legacy field
  user_id?: number;
  wid?: number; // Legacy field
  workspace_id: number;
}

export interface TimeEntry extends TimeEntryBase {
  at: string;
  duronly: true; // For GET requests, always true
  id: number;
  server_deleted_at: string | null;
}

export type Me = {
  api_token: string;
  at: string;
  beginning_of_week: number;
  clients: Clients[] | null;
  country_id: number;
  created_at: string;
  default_workspace_id: number;
  email: string;
  fullname: string;
  has_password: boolean;
  id: number;
  image_url: string;
  intercom_hash: string | null;
  oauth_providers: string[];
  openid_email: string;
  openid_enabled: boolean;
  options: Options | null;
  password_hash: string;
  projects: Projects[] | null;
  tags: Tags[] | null;
  tasks: Tasks[] | null;
  time_entries: TimeEntry[] | null;
  timezone: string;
  updated_at: string;
  workspaces: Workspace[];
};
