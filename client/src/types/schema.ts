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

// Feature: Folders
export interface Folder {
  id: ID;
  tenant_id: ID;
  name: string;
  parent_id?: ID | null; // For nested folders
  scope: string; // Changed from type to scope to match requirements
  sort_order: number;
  created_at: DateTime | Date;
  updated_at: DateTime | Date;
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
  folder_id?: ID; // Added folder support
  created_at: DateTime;
}

// Feature: Messages
export interface MessageTemplate {
  id: ID;
  tenant_id: ID;
  name: string;
  folder_id?: ID; // Added folder support
  content_type: 'text' | 'image' | 'card' | 'flex';
  content_json: JSONValue;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface Broadcast {
  id: ID;
  tenant_id: ID;
  name: string;
  folder_id?: ID; // Added folder support
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
  folder_id?: ID; // Added folder support
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
  folder_id?: ID; // Added folder support
  match_type: 'exact' | 'partial' | 'regex';
  response_type: 'text' | 'template';
  response_content: JSONValue;
  is_active: boolean;
  created_at: DateTime;
}

export interface ActionSchedule {
  id: ID;
  tenant_id: ID;
  name: string;
  folder_id?: ID; // Added folder support
  trigger_type: 'time' | 'event';
  actions_json: JSONValue;
  is_active: boolean;
  created_at: DateTime;
}

// Feature: Events / Reservations
export interface Event {
  id: ID;
  tenant_id: ID;
  title: string;
  folder_id?: ID; // Added folder support
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
  folder_id?: ID; // Added folder support
  status: 'pending' | 'confirmed' | 'canceled' | 'attended';
  created_at: DateTime;
}

// Feature: Forms
export interface Form {
  id: ID;
  tenant_id: ID;
  title: string;
  folder_id?: ID; // Added folder support
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
  folder_id?: ID; // Added folder support
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

// Feature: LME Actions
export type ActionType = 
  | 'step_scenario' 
  | 'template_message' 
  | 'text_message' 
  | 'reminder' 
  | 'tag' 
  | 'rich_menu' 
  | 'bookmark' 
  | 'friend_info' 
  | 'status' 
  | 'block';

export interface ActionSet {
  id: ID;
  tenant_id: ID;
  name: string;
  description?: string;
  is_active: boolean;
  created_by: ID;
  updated_by: ID;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface ActionSetStep {
  id: ID;
  tenant_id: ID;
  action_set_id: ID;
  order: number;
  action_type: ActionType;
  action_payload_json: JSONValue;
  conditions_json?: JSONValue; // Added for action filtering
  created_at: DateTime;
}

export interface TriggerBinding {
  id: ID;
  tenant_id: ID;
  trigger_type: string; // e.g., 'friend_added', 'rich_menu_tap', 'tag_added'
  trigger_source_id?: ID; // e.g., rich_menu_id, tag_id
  action_set_id: ID;
  condition_json?: JSONValue;
  is_active: boolean;
  created_at: DateTime;
}

export interface ActionExecution {
  id: ID;
  tenant_id: ID;
  action_set_id: ID;
  trigger_binding_id: ID;
  contact_id: ID;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  started_at?: DateTime;
  finished_at?: DateTime;
  error?: string;
  request_id: string;
  meta_json?: JSONValue;
}

// Rakuten Integration
export interface RakutenConnection {
  id: string;
  tenant_id: string;
  shop_url: string;
  shop_name: string;
  status: 'active' | 'inactive' | 'error';
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RakutenOrder {
  id: string;
  tenant_id: string;
  contact_id?: string; // Linked LINE user
  order_number: string;
  order_date: string;
  total_price: number;
  status: string;
  items: RakutenOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface RakutenOrderItem {
  id: string;
  order_id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  price: number;
  category?: string;
}

// 1:1 Chat
export interface ChatThread {
  id: string;
  tenant_id: string;
  contact_id: string;
  last_message_at: string;
  last_message_preview: string;
  unread_count: number;
  status: 'active' | 'archived';
  assigned_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  tenant_id: string;
  thread_id: string;
  sender_type: 'user' | 'contact' | 'system';
  sender_id?: string; // user_id or contact_id
  content_type: 'text' | 'image' | 'sticker' | 'template';
  content: string; // JSON string for non-text
  status: 'pending' | 'sent' | 'failed';
  meta_json?: JSONValue;
  read_at?: string;
  created_at: string;
}

export interface UrlShortener {
  id: string;
  tenant_id: string;
  original_url: string;
  short_url: string;
  created_at: string;
}

export interface UrlClickEvent {
  id: string;
  tenant_id: string;
  short_url_id: string;
  contact_id: string;
  clicked_at: string;
}

export interface ChatSettings {
  id: string;
  tenant_id: string;
  enable_url_shortener: boolean;
  send_shortcut: 'enter' | 'ctrl_enter';
  created_at: string;
  updated_at: string;
}
