import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LayoutProvider } from "./contexts/layout-context";
import AIReportDetailPage from "./pages/AIReportDetail";
import DashboardPage from "./pages/Dashboard";
import PlaceholderPage from "./pages/PlaceholderPage";
import FriendsListPage from "./pages/FriendsList";

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
      <Route path="/friends/tags" component={PlaceholderPage} />
      <Route path="/friends/blocked" component={PlaceholderPage} />

      {/* Messages */}
      <Route path="/messages" component={PlaceholderPage} />
      <Route path="/messages/broadcast" component={PlaceholderPage} />
      <Route path="/messages/step" component={PlaceholderPage} />
      <Route path="/messages/auto-reply" component={PlaceholderPage} />
      <Route path="/messages/templates" component={PlaceholderPage} />

      {/* Events */}
      <Route path="/events" component={PlaceholderPage} />
      <Route path="/events/calendar" component={PlaceholderPage} />
      <Route path="/events/list" component={PlaceholderPage} />
      <Route path="/events/participants" component={PlaceholderPage} />

      {/* Forms */}
      <Route path="/forms" component={PlaceholderPage} />
      <Route path="/forms/responses" component={PlaceholderPage} />
      <Route path="/forms/create" component={PlaceholderPage} />

      {/* Analysis */}
      <Route path="/analysis" component={PlaceholderPage} />
      <Route path="/analysis/friends" component={PlaceholderPage} />
      <Route path="/analysis/messages" component={PlaceholderPage} />

      {/* AI */}
      <Route path="/ai" component={PlaceholderPage} />
      <Route path="/ai/history" component={PlaceholderPage} />
      <Route path="/ai/settings" component={PlaceholderPage} />

      {/* Integrations */}
      <Route path="/integrations" component={PlaceholderPage} />
      <Route path="/integrations/shopify" component={PlaceholderPage} />
      <Route path="/integrations/line" component={PlaceholderPage} />

      {/* Admin */}
      <Route path="/admin" component={PlaceholderPage} />
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
          <LayoutProvider>
            <Toaster />
            <Router />
          </LayoutProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
