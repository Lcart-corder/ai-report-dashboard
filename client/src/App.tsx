import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LayoutProvider } from "./contexts/layout-context";
import AIReportDetailPage from "./pages/AIReportDetail";

// Redirect root to the report detail page for this demo
function HomeRedirect() {
  return <AIReportDetailPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/ai/reports" component={AIReportDetailPage} />
      <Route path="/ai/reports/:id" component={AIReportDetailPage} />
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
