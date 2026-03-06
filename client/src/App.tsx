import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { LayoutProvider } from "./contexts/layout-context";
import { AuthProvider } from "./contexts/AuthContext";
import { AppSidebar } from "./components/app-sidebar";

// Lazy load all pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AIReportDetailPage = lazy(() => import("./pages/AIReportDetail"));
const PlaceholderPage = lazy(() => import("./pages/PlaceholderPage"));

// Friends
const FriendListPage = lazy(() => import("./pages/friends/FriendList"));
const FriendInfoListPage = lazy(() => import("./pages/friends/FriendInfoList"));
const TagsPage = lazy(() => import("./pages/friends/Tags"));
const ConversionsPage = lazy(() => import("./pages/friends/Conversions"));
const BlockedListPage = lazy(() => import("./pages/friends/BlockedList"));

// Messages
const BroadcastPage = lazy(() => import("./pages/messages/Broadcast"));
const StepManagerPage = lazy(() => import("./pages/messages/StepManager"));
const ScenarioEditorPage = lazy(() => import("./pages/messages/ScenarioEditor"));
const AutoReplyPage = lazy(() => import("./pages/messages/AutoReply"));
const ActionSchedulePage = lazy(() => import("./pages/messages/ActionScheduleNew"));
const GreetingPage = lazy(() => import("./pages/messages/Greeting"));
const TemplatesPage = lazy(() => import("./pages/messages/Templates"));
const RichMenuListPage = lazy(() => import("./pages/messages/RichMenuList"));
const RichMenuEditorPage = lazy(() => import("./pages/messages/RichMenuEditor"));
const TemplateCreatePage = lazy(() => import("./pages/messages/TemplateCreate"));
const TemplateAnalysisPage = lazy(() => import("./pages/messages/TemplateAnalysis"));

// Events
const EventManagerPage = lazy(() => import("./pages/events/EventManager"));
const ReservationListPage = lazy(() => import("./pages/events/ReservationList"));
const EventCreatePage = lazy(() => import("./pages/events/EventCreate"));
const EventCalendarPage = lazy(() => import("./pages/events/EventCalendar"));
const EventSettingsPage = lazy(() => import("@/pages/events/EventSettings"));
const LearningCenterPage = lazy(() => import("@/pages/learning/LearningCenter"));
const VideoDetailPage = lazy(() => import("@/pages/learning/VideoDetail"));
const ShopBuilderPage = lazy(() => import("@/pages/shop-builder/ShopBuilder"));
const UnifiedPageManagerPage = lazy(() => import("@/pages/admin/pages/UnifiedPageManager"));

// Forms
const FormManagerPage = lazy(() => import("./pages/forms/FormManager"));
const FormCreatePage = lazy(() => import("./pages/forms/FormCreate"));
const FormResponsesPage = lazy(() => import("./pages/forms/FormResponses"));

// Orders & Products
const OrderListPage = lazy(() => import("./pages/orders/OrderList"));
const ShippingManagementPage = lazy(() => import("./pages/orders/ShippingManagement"));
const ProductListPage = lazy(() => import("./pages/shop/ProductList"));
const ProductRegistration = lazy(() => import("./pages/products/ProductRegistration"));
const ProductImport = lazy(() => import("./pages/products/ProductImport"));
const ChatbotBuilder = lazy(() => import("./pages/chatbot/ChatbotBuilder"));
const ProductManagementPage = lazy(() => import("./pages/orders/ProductManagement"));
const ProductEditPage = lazy(() => import("./pages/orders/ProductEdit"));
const PageEditPage = lazy(() => import("./pages/admin/pages/PageEdit"));
const PublicPageViewer = lazy(() => import("./pages/shop/PublicPageViewer"));
const StaticPageListPage = lazy(() => import("./pages/admin/static-pages/StaticPageList"));
const StaticPageEditPage = lazy(() => import("./pages/admin/static-pages/StaticPageEdit"));
const StaticPageViewer = lazy(() => import("./pages/shop/StaticPageViewer"));

// Analysis
const AnalysisDashboard = lazy(() => import("./pages/analysis/index"));
const FriendsAnalysisPage = lazy(() => import("./pages/analysis/FriendsAnalysis"));
const MessagesAnalysisPage = lazy(() => import("./pages/analysis/MessagesAnalysis"));
const TrafficSourceCreatePage = lazy(() => import("./pages/marketing/TrafficSourceCreate"));
const ConversionSettingsPage = lazy(() => import("./pages/analysis/ConversionSettings"));
const SiteAnalysisPage = lazy(() => import("./pages/analysis/SiteAnalysis"));
const ActionLogsPage = lazy(() => import("./pages/analysis/ActionLogs"));
const AIInsightsPage = lazy(() => import("./pages/analysis/AIInsights"));
const RakutenSettingsPage = lazy(() => import("./pages/rakuten/RakutenSettings"));
const RakutenOrderListPage = lazy(() => import("./pages/rakuten/RakutenOrderList"));
const ChatPage = lazy(() => import("./pages/chats/ChatPage"));
const ChatPageNew = lazy(() => import("./pages/chat/ChatPageComplete"));
const ChatSettingsPage = lazy(() => import("./pages/chats/ChatSettings"));
const OmikujiPage = lazy(() => import("./pages/omikuji/OmikujiPage"));
const OmikujiWizard = lazy(() => import("./pages/omikuji/OmikujiWizard"));
const MyPage = lazy(() => import("./pages/settings/MyPage"));
const MyPageNew = lazy(() => import("./pages/settings/MyPageNew"));
const NotificationSettings = lazy(() => import("./pages/settings/NotificationSettings"));
const QRCodeActionManager = lazy(() => import("./pages/marketing/QRCodeActionManager"));
const QRCodeDetailComplete = lazy(() => import("./pages/marketing/QRCodeDetailComplete"));

// Others
const AIDashboard = lazy(() => import("./pages/ai/index"));
const AIReportsPage = lazy(() => import("./pages/ai/AIReports"));
const GenerationHistoryPage = lazy(() => import("./pages/ai/GenerationHistory"));
const ModelSettingsPage = lazy(() => import("./pages/ai/ModelSettings"));
const IntegrationsPage = lazy(() => import("./pages/integrations/index"));
const IntegrationHub = lazy(() => import("./pages/admin/integrations/IntegrationHub"));
const ShopifyIntegrationPage = lazy(() => import("./pages/admin/integrations/ShopifyIntegration"));
const LineOfficialIntegrationPage = lazy(() => import("./pages/admin/integrations/LineOfficialIntegration"));
const LineAdsIntegrationPage = lazy(() => import("./pages/admin/integrations/LineAdsIntegration"));
const ChatGPTSettingsPage = lazy(() => import("./pages/admin/integrations/ChatGPTSettings"));
const AdminDashboard = lazy(() => import("./pages/admin/index"));
const PlanSettingsPage = lazy(() => import("./pages/admin/billing/PlanSettings"));
const StaffManagement = lazy(() => import("./pages/admin/StaffManagement"));

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LayoutProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
          <Switch>
            {/* Dashboard */}
            <Route path="/" component={Dashboard} />
            
            {/* Friends */}
            <Route path="/friends" component={FriendListPage} />
            <Route path="/friends/list" component={FriendListPage} />
            <Route path="/friends/info" component={FriendInfoListPage} />
            <Route path="/friends/tags" component={TagsPage} />
            <Route path="/friends/blocked" component={BlockedListPage} />
            <Route path="/friends/conversions" component={ConversionsPage} />

            {/* Messages */}
            <Route path="/messages/broadcast" component={BroadcastPage} />
            <Route path="/messages/step" component={StepManagerPage} />
            <Route path="/messages/step/create" component={ScenarioEditorPage} />
            <Route path="/messages/step/:id/edit" component={ScenarioEditorPage} />
            <Route path="/messages/auto-reply" component={AutoReplyPage} />
            <Route path="/messages/templates" component={TemplatesPage} />
            <Route path="/messages/templates/create" component={TemplateCreatePage} />
            <Route path="/messages/templates/analysis" component={TemplateAnalysisPage} />
            <Route path="/messages/action-schedule" component={ActionSchedulePage} />
            <Route path="/messages/greeting" component={GreetingPage} />
            <Route path="/messages/rich-menus" component={RichMenuListPage} />
            <Route path="/messages/rich-menus/create" component={RichMenuEditorPage} />
            <Route path="/messages/rich-menus/:id/edit" component={RichMenuEditorPage} />

            {/* Forms */}
            <Route path="/forms" component={FormManagerPage} />
            <Route path="/forms/create" component={FormCreatePage} />
            <Route path="/forms/responses" component={FormResponsesPage} />
            <Route path="/forms/:id/responses" component={FormResponsesPage} />
            <Route path="/forms/:id/edit" component={FormCreatePage} />

            {/* Orders */}
            <Route path="/orders" component={OrderListPage} />
            <Route path="/orders/shipments" component={ShippingManagementPage} />

            {/* Products */}
            <Route path="/products" component={ProductListPage} />
            <Route path="/products/register" component={ProductRegistration} />
            <Route path="/products/import" component={ProductImport} />
            <Route path="/chatbot/builder" component={ChatbotBuilder} />
            <Route path="/products/inventory" component={ProductManagementPage} />
            <Route path="/shop-builder" component={ShopBuilderPage} />
            <Route path="/orders/products/:id" component={ProductEditPage} />

            {/* Analysis */}
            <Route path="/analysis" component={AnalysisDashboard} />
            <Route path="/analysis/friends" component={FriendsAnalysisPage} />
            <Route path="/analysis/messages" component={MessagesAnalysisPage} />
            <Route path="/analysis/traffic" component={QRCodeActionManager} />
            <Route path="/analysis/traffic/create" component={TrafficSourceCreatePage} />
            <Route path="/marketing/qr-code" component={QRCodeActionManager} />
            <Route path="/marketing/qr-code/:id" component={QRCodeDetailComplete} />
            <Route path="/analysis/conversions" component={ConversionSettingsPage} />
            <Route path="/analysis/logs" component={ActionLogsPage} />
            <Route path="/analysis/ai-insights" component={AIInsightsPage} />
          
          {/* Rakuten */}
          <Route path="/rakuten/settings" component={RakutenSettingsPage} />
          <Route path="/rakuten/orders" component={RakutenOrderListPage} />

          {/* Chats */}
          <Route path="/chats" component={ChatPage} />
          <Route path="/chats/settings" component={ChatSettingsPage} />
          <Route path="/chat" component={ChatPageNew} />

            {/* Omikuji */}
            <Route path="/omikuji" component={OmikujiPage} />
            <Route path="/omikuji/new" component={OmikujiWizard} />

            {/* Settings */}
            <Route path="/mypage" component={MyPage} />
            <Route path="/settings" component={MyPageNew} />
            <Route path="/settings/notifications" component={NotificationSettings} />
            <Route path="/analysis/site" component={SiteAnalysisPage} />

            {/* Events */}
            <Route path="/events" component={EventManagerPage} />
            <Route path="/events/:id/edit" component={EventCreatePage} />
            <Route path="/events/reservations" component={ReservationListPage} />
            <Route path="/events/create" component={EventCreatePage} />
            <Route path="/events/calendar" component={EventCalendarPage} />
            <Route path="/events/settings" component={EventSettingsPage} />
            <Route path="/learning" component={LearningCenterPage} />
            <Route path="/learning/video/:id" component={VideoDetailPage} />

            {/* AI Reports */}
            <Route path="/ai" component={AIDashboard} />
            <Route path="/ai/reports" component={AIReportsPage} />
            <Route path="/ai/reports/:id" component={AIReportDetailPage} />
            <Route path="/ai/history" component={GenerationHistoryPage} />
            <Route path="/ai/settings" component={ModelSettingsPage} />

            {/* Integrations */}
            <Route path="/integrations" component={IntegrationsPage} />
            <Route path="/admin/integrations" component={IntegrationHub} />
            <Route path="/admin/integrations/shopify" component={ShopifyIntegrationPage} />
            <Route path="/admin/integrations/line-official" component={LineOfficialIntegrationPage} />
            <Route path="/admin/integrations/line-ads" component={LineAdsIntegrationPage} />
            <Route path="/admin/integrations/chatgpt" component={ChatGPTSettingsPage} />

            {/* Admin */}
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/pages" component={UnifiedPageManagerPage} />
            <Route path="/admin/pages/new" component={PageEditPage} />
            <Route path="/admin/pages/:id" component={PageEditPage} />
            <Route path="/admin/billing" component={PlanSettingsPage} />
            <Route path="/admin/staff" component={StaffManagement} />

            {/* Static Pages (Shopify-like) */}
            <Route path="/admin/static-pages" component={StaticPageListPage} />
            <Route path="/admin/static-pages/new" component={StaticPageEditPage} />
            <Route path="/admin/static-pages/:id" component={StaticPageEditPage} />

            {/* Public Pages */}
            <Route path="/s/:slug" component={PublicPageViewer} />
            <Route path="/pages/:handle" component={StaticPageViewer} />

            {/* Fallback */}
            <Route component={PlaceholderPage} />
          </Switch>
          </Suspense>
        </main>
      </div>
      </LayoutProvider>
    </AuthProvider>
  );
}

export default App;
