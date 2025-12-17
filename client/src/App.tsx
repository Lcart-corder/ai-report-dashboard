import { Switch, Route } from "wouter";
import { LayoutProvider } from "./contexts/layout-context";
import { AppSidebar } from "./components/app-sidebar";
import Dashboard from "./pages/Dashboard";
import AIReportDetailPage from "./pages/AIReportDetail";
import PlaceholderPage from "./pages/PlaceholderPage";
import FriendsListPage from "./pages/FriendsList";
import FriendInfoPage from "./pages/friends/FriendInfoEdit";
import BroadcastPage from "./pages/messages/Broadcast";
import StepPage from "./pages/messages/Step";
import AutoReplyPage from "./pages/messages/AutoReply";
import ActionScheduleCreatePage from "./pages/messages/ActionScheduleCreate";
import TemplatesPage from "./pages/messages/Templates";
import RichMenuCreatePage from "./pages/messages/RichMenuCreate";
import TemplateCreatePage from "./pages/messages/TemplateCreate";
import TemplateAnalysisPage from "./pages/messages/TemplateAnalysis";
import EventsDashboard from "./pages/events/index";
import ReservationListPage from "./pages/events/ReservationList";
import EventCreatePage from "./pages/events/EventCreate";
import FormsPage from "./pages/forms/index";
import FormCreatePage from "./pages/forms/FormCreate";
import AnalysisDashboard from "./pages/analysis/index";
import FriendsAnalysisPage from "./pages/analysis/FriendsAnalysis";
import MessagesAnalysisPage from "./pages/analysis/MessagesAnalysis";
import TrafficSourcesPage from "./pages/analysis/TrafficSources";
import TrafficSourceCreatePage from "./pages/analysis/TrafficSourceCreate";
import ConversionSettingsPage from "./pages/analysis/ConversionSettings";
import AIDashboard from "./pages/ai/index";
import IntegrationsPage from "./pages/integrations/index";
import AdminDashboard from "./pages/admin/index";

function App() {
  return (
    <LayoutProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <Switch>
            {/* Dashboard */}
            <Route path="/" component={Dashboard} />
            
            {/* Friends */}
            <Route path="/friends" component={FriendsListPage} />
            <Route path="/friends/list" component={FriendsListPage} />
            <Route path="/friends/info" component={FriendInfoPage} />
            <Route path="/friends/tags" component={PlaceholderPage} />
            <Route path="/friends/conversions" component={PlaceholderPage} />

            {/* Messages */}
            <Route path="/messages/broadcast" component={BroadcastPage} />
            <Route path="/messages/step" component={StepPage} />
            <Route path="/messages/auto-reply" component={AutoReplyPage} />
            <Route path="/messages/templates" component={TemplatesPage} />
            <Route path="/messages/templates/create" component={TemplateCreatePage} />
            <Route path="/messages/templates/analysis" component={TemplateAnalysisPage} />
            <Route path="/messages/action-schedule" component={ActionScheduleCreatePage} />
            <Route path="/messages/greeting" component={PlaceholderPage} />
            <Route path="/messages/rich-menus" component={PlaceholderPage} />
            <Route path="/messages/rich-menus/create" component={RichMenuCreatePage} />

            {/* Forms */}
            <Route path="/forms" component={FormsPage} />
            <Route path="/forms/create" component={FormCreatePage} />
            <Route path="/forms/responses" component={PlaceholderPage} />

            {/* Analysis */}
            <Route path="/analysis" component={AnalysisDashboard} />
            <Route path="/analysis/friends" component={FriendsAnalysisPage} />
            <Route path="/analysis/messages" component={MessagesAnalysisPage} />
            <Route path="/analysis/traffic" component={TrafficSourcesPage} />
      <Route path="/analysis/traffic/create" component={TrafficSourceCreatePage} />
      <Route path="/analysis/conversions" component={ConversionSettingsPage} />
            <Route path="/analysis/site" component={PlaceholderPage} />

            {/* Events */}
            <Route path="/events" component={EventsDashboard} />
      <Route path="/events/reservations" component={ReservationListPage} />
      <Route path="/events/create" component={EventCreatePage} />
      <Route path="/events/calendar" component={PlaceholderPage} />
            <Route path="/events/settings" component={PlaceholderPage} />

            {/* AI Reports */}
            <Route path="/ai" component={AIDashboard} />
            <Route path="/ai/reports/:id" component={AIReportDetailPage} />

            {/* Integrations */}
            <Route path="/integrations" component={IntegrationsPage} />

            {/* Admin */}
            <Route path="/admin" component={AdminDashboard} />

            {/* Fallback */}
            <Route component={PlaceholderPage} />
          </Switch>
        </main>
      </div>
    </LayoutProvider>
  );
}

export default App;
