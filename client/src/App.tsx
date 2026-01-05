import { Switch, Route } from "wouter";
import { LayoutProvider } from "./contexts/layout-context";
import { AuthProvider } from "./contexts/AuthContext";
import { AppSidebar } from "./components/app-sidebar";
import Dashboard from "./pages/Dashboard";
import AIReportDetailPage from "./pages/AIReportDetail";
import PlaceholderPage from "./pages/PlaceholderPage";

// Friends
import FriendListPage from "./pages/friends/FriendList";
import FriendInfoListPage from "./pages/friends/FriendInfoList";
import TagsPage from "./pages/friends/Tags";
import ConversionsPage from "./pages/friends/Conversions";
// Messages
import BroadcastPage from "./pages/messages/Broadcast";
import StepManagerPage from "./pages/messages/StepManager";
import ScenarioEditorPage from "./pages/messages/ScenarioEditor";
import AutoReplyPage from "./pages/messages/AutoReply";
import ActionSchedulePage from "./pages/messages/ActionSchedule";
import GreetingPage from "./pages/messages/Greeting";
import TemplatesPage from "./pages/messages/Templates";
import RichMenuListPage from "./pages/messages/RichMenuList";
import RichMenuEditorPage from "./pages/messages/RichMenuEditor";
import RichMenuCreatePage from "./pages/messages/RichMenuCreate";
import TemplateCreatePage from "./pages/messages/TemplateCreate";
import TemplateAnalysisPage from "./pages/messages/TemplateAnalysis";

// Events
import EventManagerPage from "./pages/events/EventManager";
import ReservationListPage from "./pages/events/ReservationList";
import EventCreatePage from "./pages/events/EventCreate";
import EventCalendarPage from "./pages/events/EventCalendar";
import EventSettingsPage from "@/pages/events/EventSettings";
import LearningCenterPage from "@/pages/learning/LearningCenter";
import VideoDetailPage from "@/pages/learning/VideoDetail";
import ShopBuilderPage from "@/pages/shop-builder/ShopBuilder";
import UnifiedPageManagerPage from "@/pages/admin/pages/UnifiedPageManager";

// Forms
import FormManagerPage from "./pages/forms/FormManager";
import FormCreatePage from "./pages/forms/FormCreate";
import FormResponsesPage from "./pages/forms/FormResponses";

// Orders & Products
import OrderListPage from "./pages/orders/OrderList";
import ShippingManagementPage from "./pages/orders/ShippingManagement";
import ProductListPage from "./pages/shop/ProductList";
import ProductManagementPage from "./pages/orders/ProductManagement";
import ProductEditPage from "./pages/orders/ProductEdit";
import PageListPage from "./pages/admin/pages/PageList";
import PageEditPage from "./pages/admin/pages/PageEdit";
import PublicPageViewer from "./pages/shop/PublicPageViewer";
import StaticPageListPage from "./pages/admin/static-pages/StaticPageList";
import StaticPageEditPage from "./pages/admin/static-pages/StaticPageEdit";
import StaticPageViewer from "./pages/shop/StaticPageViewer";

// Analysis
import AnalysisDashboard from "./pages/analysis/index";
import FriendsAnalysisPage from "./pages/analysis/FriendsAnalysis";
import MessagesAnalysisPage from "./pages/analysis/MessagesAnalysis";
import TrafficSourcesPage from "./pages/marketing/TrafficSourceManager";
import TrafficSourceCreatePage from "./pages/marketing/TrafficSourceCreate";
import ConversionSettingsPage from "./pages/analysis/ConversionSettings";
import SiteAnalysisPage from "./pages/analysis/SiteAnalysis";
import ActionLogsPage from "./pages/analysis/ActionLogs";
import AIInsightsPage from "./pages/analysis/AIInsights";
import RakutenSettingsPage from "./pages/rakuten/RakutenSettings";
import RakutenOrderListPage from "./pages/rakuten/RakutenOrderList";
import ChatPage from "./pages/chats/ChatPage";
import ChatSettingsPage from "./pages/chats/ChatSettings";
import OmikujiPage from "./pages/omikuji/OmikujiPage";
import OmikujiWizard from "./pages/omikuji/OmikujiWizard";
import MyPage from "./pages/settings/MyPage";

// Others
import AIDashboard from "./pages/ai/index";
import AIReportsPage from "./pages/ai/AIReports";
import GenerationHistoryPage from "./pages/ai/GenerationHistory";
import ModelSettingsPage from "./pages/ai/ModelSettings";
import IntegrationsPage from "./pages/integrations/index";
import IntegrationHub from "./pages/admin/integrations/IntegrationHub";
import ShopifyIntegrationPage from "./pages/admin/integrations/ShopifyIntegration";
import LineOfficialIntegrationPage from "./pages/admin/integrations/LineOfficialIntegration";
import LineAdsIntegrationPage from "./pages/admin/integrations/LineAdsIntegration";
import ChatGPTSettingsPage from "./pages/admin/integrations/ChatGPTSettings";
import AdminDashboard from "./pages/admin/index";
import PlanSettingsPage from "./pages/admin/billing/PlanSettings";

function App() {
  return (
    <AuthProvider>
      <LayoutProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <Switch>
            {/* Dashboard */}
            <Route path="/" component={Dashboard} />
            
            {/* Friends */}
            <Route path="/friends" component={FriendListPage} />
            <Route path="/friends/list" component={FriendListPage} />
            <Route path="/friends/info" component={FriendInfoListPage} />
            <Route path="/friends/tags" component={TagsPage} />
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
            <Route path="/products/inventory" component={ProductManagementPage} />
            <Route path="/shop-builder" component={ShopBuilderPage} />
            <Route path="/orders/products/:id" component={ProductEditPage} />

            {/* Analysis */}
            <Route path="/analysis" component={AnalysisDashboard} />
            <Route path="/analysis/friends" component={FriendsAnalysisPage} />
            <Route path="/analysis/messages" component={MessagesAnalysisPage} />
            <Route path="/analysis/traffic" component={TrafficSourcesPage} />
            <Route path="/analysis/traffic/create" component={TrafficSourceCreatePage} />
            <Route path="/analysis/conversions" component={ConversionSettingsPage} />
            <Route path="/analysis/logs" component={ActionLogsPage} />
            <Route path="/analysis/ai-insights" component={AIInsightsPage} />
          
          {/* Rakuten */}
          <Route path="/rakuten/settings" component={RakutenSettingsPage} />
          <Route path="/rakuten/orders" component={RakutenOrderListPage} />

          {/* Chats */}
          <Route path="/chats" component={ChatPage} />
          <Route path="/chats/settings" component={ChatSettingsPage} />

            {/* Omikuji */}
            <Route path="/omikuji" component={OmikujiPage} />
            <Route path="/omikuji/new" component={OmikujiWizard} />

            {/* Settings */}
            <Route path="/mypage" component={MyPage} />
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
        </main>
      </div>
      </LayoutProvider>
    </AuthProvider>
  );
}

export default App;
