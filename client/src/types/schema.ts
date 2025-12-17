// Common Types
export type ID = string;
export type DateTime = string; // ISO 8601
export type JSONValue = string | number | boolean | null | { [key: string]: JSONValue } | JSONValue[];

// Enums
export type Role = 'owner' | 'admin' | 'staff' | 'viewer';
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled';
export type FriendStatus = 'active' | 'blocked';

// Core Entities
export interface Tenant {
  id: ID;
  name: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  created_at: DateTime;
}

export interface User {
  id: ID;
  tenant_id: ID;
  name: string;
  email: string;
  role: Role;
  avatar_url?: string;
  created_at: DateTime;
}

export interface AuditLog {
  id: ID;
  tenant_id: ID;
  actor_user_id: ID;
  action: 'create' | 'update' | 'delete' | 'execute' | 'login';
  target_type: string;
  target_id: ID;
  diff_json?: JSONValue;
  created_at: DateTime;
}

export interface Notification {
  id: ID;
  tenant_id: ID;
  user_id: ID;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  body: string;
  is_read: boolean;
  created_at: DateTime;
}

export interface Job {
  id: ID;
  tenant_id: ID;
  type: 'broadcast' | 'export' | 'import' | 'report_generation';
  status: JobStatus;
  payload_json: JSONValue;
  scheduled_at?: DateTime;
  started_at?: DateTime;
  finished_at?: DateTime;
  created_at: DateTime;
}

// Feature: Friends / Contacts
export interface Contact {
  id: ID;
  tenant_id: ID;
  line_user_id: string;
  display_name: string;
  avatar_url?: string;
  status: FriendStatus;
  tags: string[]; // Tag IDs
  attributes: Record<string, any>;
  last_active_at: DateTime;
  created_at: DateTime;
}

export interface Tag {
  id: ID;
  tenant_id: ID;
  name: string;
  color: string;
  count: number;
  created_at: DateTime;
}

// Feature: Messages
export interface MessageTemplate {
  id: ID;
  tenant_id: ID;
  name: string;
  content_type: 'text' | 'image' | 'card' | 'flex';
  content_json: JSONValue;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface Broadcast {
  id: ID;
  tenant_id: ID;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  target_filter_json: JSONValue;
  messages_json: JSONValue[]; // Array of message objects
  scheduled_at?: DateTime;
  sent_count: number;
  created_at: DateTime;
}

export interface StepScenario {
  id: ID;
  tenant_id: ID;
  name: string;
  is_active: boolean;
  trigger_type: 'tag_added' | 'friend_added';
  trigger_value?: string;
  nodes_json: JSONValue; // Step nodes structure
  created_at: DateTime;
}

export interface AutoReply {
  id: ID;
  tenant_id: ID;
  keyword: string;
  match_type: 'exact' | 'partial' | 'regex';
  response_type: 'text' | 'template';
  response_content: JSONValue;
  is_active: boolean;
  created_at: DateTime;
}

// Feature: Events / Reservations
export interface Event {
  id: ID;
  tenant_id: ID;
  title: string;
  description?: string;
  start_at: DateTime;
  end_at: DateTime;
  capacity: number;
  current_participants: number;
  location?: string;
  status: 'draft' | 'published' | 'canceled' | 'finished';
  created_at: DateTime;
}

export interface Reservation {
  id: ID;
  tenant_id: ID;
  event_id: ID;
  contact_id: ID;
  status: 'pending' | 'confirmed' | 'canceled' | 'attended';
  created_at: DateTime;
}

// Feature: Forms
export interface Form {
  id: ID;
  tenant_id: ID;
  title: string;
  description?: string;
  fields_json: JSONValue; // Array of field definitions
  is_active: boolean;
  response_count: number;
  created_at: DateTime;
}

export interface FormResponse {
  id: ID;
  tenant_id: ID;
  form_id: ID;
  contact_id: ID;
  answers_json: JSONValue;
  created_at: DateTime;
}

// Feature: Analytics (Events)
export interface AnalyticsEvent {
  id: ID;
  tenant_id: ID;
  name: string; // e.g., 'message_sent', 'link_clicked', 'order_created'
  actor_contact_id?: ID;
  actor_user_id?: ID;
  meta_json: JSONValue;
  occurred_at: DateTime;
}

// Feature: Traffic Analysis
export interface TrafficSource {
  id: ID;
  tenant_id: ID;
  name: string;
  code: string; // パラメータ識別子
  url: string;
  actions_json: {
    add_tags?: string[];
    start_scenario_id?: string;
    send_template_id?: string;
    change_rich_menu_id?: string;
  };
  stats: {
    visits: number;
    friends_added: number;
    blocks: number;
    conversions: number;
  };
  is_active: boolean;
  created_at: DateTime;
}
