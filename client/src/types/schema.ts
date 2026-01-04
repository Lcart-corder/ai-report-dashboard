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
  | 'block'
  | 'omikuji';

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

// Feature: Omikuji
export interface OmikujiConfig {
  id: ID;
  tenant_id: ID;
  name: string;
  status: 'draft' | 'published';
  timezone: string;
  richmenu_id?: ID;
  richmenu_area_id?: ID;
  daily_limit: number; // default 1
  reset_time: string; // default "00:00"
  block_template_id?: ID;
  points_attribute_key: string; // default "omikuji_points"
  created_by: ID;
  updated_by: ID;
  created_at: DateTime;
  updated_at: DateTime;
  deleted_at?: DateTime;
}

export interface OmikujiResult {
  id: ID;
  tenant_id: ID;
  omikuji_id: ID;
  name: string;
  weight: number; // 確率の重み
  points_delta: number;
  result_template_id?: ID;
  created_at: DateTime;
  updated_at: DateTime;
  deleted_at?: DateTime;
}

export interface OmikujiDailyState {
  tenant_id: ID;
  omikuji_id: ID;
  contact_id: ID;
  last_played_date: string; // YYYY-MM-DD
  last_result_id?: ID;
  updated_at: DateTime;
}

export interface OmikujiReward {
  id: ID;
  tenant_id: ID;
  omikuji_id: ID;
  name: string;
  required_points: number;
  reward_template_id?: ID;
  points_cost: number;
  created_at: DateTime;
  updated_at: DateTime;
  deleted_at?: DateTime;
}

export interface OmikujiRewardRedemption {
  id: ID;
  tenant_id: ID;
  omikuji_id: ID;
  reward_id: ID;
  contact_id: ID;
  redeemed_at: DateTime;
  points_spent: number;
  status: 'succeeded' | 'failed';
  error?: string;
}

export interface OmikujiPointLedger {
  id: ID;
  tenant_id: ID;
  omikuji_id: ID;
  contact_id: ID;
  delta: number;
  balance_after: number;
  reason: 'play' | 'redeem' | 'admin_adjust';
  meta_json?: JSONValue;
  created_at: DateTime;
}

// Feature: Authentication
export interface AuthSession {
  id: ID;
  user_id: ID;
  refresh_token_hash: string;
  user_agent?: string;
  ip?: string;
  expires_at: DateTime;
  revoked_at?: DateTime;
  created_at: DateTime;
}

export interface PasswordReset {
  id: ID;
  user_id: ID;
  reset_token_hash: string;
  expires_at: DateTime;
  used_at?: DateTime;
  created_at: DateTime;
}

export interface LoginAttempt {
  id: ID;
  email: string;
  ip?: string;
  success: boolean;
  created_at: DateTime;
}

// Feature: Cart & Checkout (L-Cart)

// 1. Products
export type ProductStatus = 'public' | 'private' | 'stopped';
export type ShippingRule = 'global' | 'per_product';

export interface Product {
  id: ID;
  tenant_id: ID;
  name: string;
  description?: string;
  status: ProductStatus;
  category_id?: ID;
  sort_order: number;
  base_price: number;
  cost_price?: number;
  shipping_rule: ShippingRule;
  per_product_shipping_fee?: number;
  stock_control_flg: boolean;
  stock_quantity?: number;
  stock_alert_threshold?: number;
  sale_start_at?: DateTime;
  sale_end_at?: DateTime;
  purchase_limit_per_user?: number;
  images: ProductImage[];
  variants: Sku[]; // Renamed from ProductVariant to match specs
  deleted_at?: DateTime;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface ProductImage {
  id: ID;
  product_id: ID;
  image_url: string;
  sort_order: number;
  created_at: DateTime;
}

export interface Sku {
  id: ID;
  product_id: ID;
  option_name: string;
  option_value: string;
  price: number;
  stock: number;
  jan_code?: string;
  is_active: boolean;
  deleted_at?: DateTime;
  created_at: DateTime;
  updated_at: DateTime;
}

// 2. Cart
export interface Cart {
  id: ID;
  tenant_id: ID;
  user_id: ID; // line_user_id linked via Contact
  is_active: boolean;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface CartItem {
  id: ID;
  cart_id: ID;
  product_id: ID;
  variant_id: ID;
  quantity: number;
  created_at: DateTime;
  updated_at: DateTime;
}

// 3. Order
export type OrderStatus = 
  | 'draft' 
  | 'awaiting_payment' 
  | 'paid' 
  | 'canceled' 
  | 'fulfilled' 
  | 'refunded';

export interface Order {
  id: ID;
  tenant_id: ID;
  order_no: string; // Unique human-readable ID
  user_id: ID;
  status: OrderStatus;
  
  // Pricing (Server Calculated)
  subtotal: number;
  tax_total: number;
  shipping_fee: number;
  discount_total: number;
  grand_total: number;
  currency: string; // e.g., "JPY"

  // Customer Info
  shipping_info_json: {
    name: string;
    postal_code: string;
    address: string;
    phone: string;
  };
  customer_note?: string;

  created_at: DateTime;
  updated_at: DateTime;
  paid_at?: DateTime;
  canceled_at?: DateTime;
  fulfilled_at?: DateTime;
}

export interface OrderItem {
  id: ID;
  order_id: ID;
  product_id: ID;
  variant_id: ID;
  product_name: string;
  variant_name: string;
  price: number; // Snapshot at order time
  tax_rate: number;
  quantity: number;
}

// 4. Payment
export type PaymentStatus = 
  | 'initiated' 
  | 'requires_action' 
  | 'succeeded' 
  | 'failed' 
  | 'canceled' 
  | 'refunded';

export interface Payment {
  id: ID;
  tenant_id: ID;
  order_id: ID;
  provider: string; // e.g., "stripe", "paypay"
  provider_payment_id?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  raw_response_json?: JSONValue;
  expires_at?: DateTime;
  created_at: DateTime;
  updated_at: DateTime;
}

// 5. Shipment
export type ShipmentStatus = 'preparing' | 'shipped' | 'delivered' | 'returned';

export interface Shipment {
  id: ID;
  order_id: ID;
  tracking_number?: string;
  carrier?: string;
  status: ShipmentStatus;
  shipped_at?: DateTime;
  created_at: DateTime;
  updated_at: DateTime;
}

// 6. Inventory Reservation
export interface InventoryReservation {
  id: ID;
  variant_id: ID;
  order_id: ID;
  quantity: number;
  expires_at: DateTime;
  status: 'reserved' | 'confirmed' | 'released';
  created_at: DateTime;
}

// 7. Message Job (Notification Queue)
export interface MessageJob {
  id: ID;
  tenant_id: ID;
  type: 'order_confirmation' | 'payment_reminder' | 'shipping_notice' | 'cancellation_notice';
  target_user_id: ID;
  order_id: ID;
  status: JobStatus;
  scheduled_at?: DateTime;
  retry_count: number;
  created_at: DateTime;
  updated_at: DateTime;
}

// 8. Pages (Shopify-like Page Builder)
export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type BlockType = 'PRODUCT_LIST' | 'HERO_IMAGE' | 'TEXT' | 'CTA';

export interface PageBlock {
  id: ID;
  page_id: ID;
  block_type: BlockType;
  sort_order: number;
  config_json: JSONValue; // { image_url, headline, collection_id, content, etc. }
  created_at: DateTime;
  updated_at: DateTime;
}

export interface Page {
  id: ID;
  tenant_id: ID; // shop_id
  type: 'SHOP' | 'LP' | 'BLOG';
  title: string;
  slug: string;
  status: PageStatus;
  template_key: string; // 'top_default', 'landing_page_v1'
  blocks: PageBlock[];
  created_by?: ID;
  updated_by?: ID;
  created_at: DateTime;
  updated_at: DateTime;
}

// 9. Static Pages (Shopify-like Standard Pages)
export interface StaticPage {
  id: ID;
  tenant_id: ID;
  title: string;
  content: string; // HTML content
  seo_title?: string;
  seo_description?: string;
  handle: string; // URL slug
  status: 'draft' | 'published' | 'scheduled';
  publish_at?: DateTime;
  template_key: string; // default: 'default'
  deleted_at?: DateTime;
  created_at: DateTime;
  updated_at: DateTime;
}
