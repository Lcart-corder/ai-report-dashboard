import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LayoutProvider } from "./contexts/layout-context";
import { NotificationProvider } from "./contexts/NotificationContext";
import AIReportDetailPage from "./pages/AIReportDetail";
import DashboardPage from "./pages/Dashboard";
import PlaceholderPage from "./pages/PlaceholderPage";
import FriendsListPage from "./pages/FriendsList";
import TagsPage from "./pages/friends/Tags";
import BlockedPage from "./pages/friends/Blocked";
import FriendInfoEditPage from "./pages/friends/FriendInfoEdit";
import MessagesDashboard from "./pages/messages/index";
import BroadcastPage from "./pages/messages/Broadcast";
import StepPage from "./pages/messages/Step";
import AutoReplyPage from "./pages/messages/AutoReply";
import ActionScheduleCreatePage from "./pages/messages/ActionScheduleCreate";
import TemplatesPage from "./pages/messages/Templates";
import TemplateCreatePage from "./pages/messages/TemplateCreate";
import TemplateAnalysisPage from "./pages/messages/TemplateAnalysis";
import EventsDashboard from "./pages/events/index";
import ReservationListPage from "./pages/events/ReservationList";
import FormsPage from "./pages/forms/index";
import AnalysisDashboard from "./pages/analysis/index";
import FriendsAnalysisPage from "./pages/analysis/FriendsAnalysis";
import MessagesAnalysisPage from "./pages/analysis/MessagesAnalysis";
import TrafficSourcesPage from "./pages/analysis/TrafficSources";
import TrafficSourceCreatePage from "./pages/analysis/TrafficSourceCreate";
import AIDashboard from "./pages/ai/index";
import IntegrationsPage from "./pages/integrations/index";
import AdminDashboard from "./pages/admin/index";

function Router() {
  return (
    <Switch>
      {/* Dashboard */}
      <Route path="/" component={DashboardPage} />
      <Route path="/analysis/dashboard" component={DashboardPage} />
      
      {/* AI Reports */}
      <Route path="/ai/reports" component={AIReportDetailPage} />
      <Route path="/ai/reports/:id" component={AIReportDetailPage} />

      {/* Friends */}
      <Route path="/friends" component={FriendsListPage} />
      <Route path="/friends/list" component={FriendsListPage} />
      <Route path="/friends/tags" component={TagsPage} />
      <Route path="/friends/blocked" component={BlockedPage} />
      <Route path="/friends/info/create" component={FriendInfoEditPage} />

      {/* Messages */}
      <Route path="/messages" component={MessagesDashboard} />
      <Route path="/messages/broadcast" component={BroadcastPage} />
      <Route path="/messages/step" component={StepPage} />
      <Route path="/messages/auto-reply" component={AutoReplyPage} />
      <Route path="/messages/schedule/create" component={ActionScheduleCreatePage} />
      <Route path="/messages/templates" component={TemplatesPage} />
      <Route path="/messages/templates/create" component={TemplateCreatePage} />
      <Route path="/messages/templates/:id/analysis" component={TemplateAnalysisPage} />

      {/* Events */}
      <Route path="/events" component={EventsDashboard} />
      <Route path="/events/calendar" component={PlaceholderPage} />
      <Route path="/events/list" component={ReservationListPage} />
      <Route path="/events/participants" component={PlaceholderPage} />

      {/* Forms */}
      <Route path="/forms" component={FormsPage} />
      <Route path="/forms/responses" component={PlaceholderPage} />
      <Route path="/forms/create" component={PlaceholderPage} />

      {/* Analysis */}
      <Route path="/analysis" component={AnalysisDashboard} />
      <Route path="/analysis/friends" component={FriendsAnalysisPage} />
      <Route path="/analysis/messages" component={MessagesAnalysisPage} />
      <Route path="/analysis/traffic" component={TrafficSourcesPage} />
      <Route path="/analysis/traffic/create" component={TrafficSourceCreatePage} />

      {/* AI */}
      <Route path="/ai" component={AIDashboard} />
      <Route path="/ai/history" component={PlaceholderPage} />
      <Route path="/ai/settings" component={PlaceholderPage} />

      {/* Integrations */}
      <Route path="/integrations" component={IntegrationsPage} />
      <Route path="/integrations/shopify" component={PlaceholderPage} />
      <Route path="/integrations/line" component={PlaceholderPage} />

      {/* Admin */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/account" component={PlaceholderPage} />
      <Route path="/admin/members" component={PlaceholderPage} />
      <Route path="/admin/billing" component={PlaceholderPage} />

      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <NotificationProvider>
          <LayoutProvider>
            <Toaster />
            <Router />
          </LayoutProvider>
        </NotificationProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
