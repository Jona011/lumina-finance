import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FinancialProvider } from "@/context/FinancialContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LandingPage from "./pages/LandingPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthPage from "./pages/AuthPage";
import PricingPage from "./pages/PricingPage";
import UploadPage from "./pages/UploadPage";
import DashboardLayout from "./components/DashboardLayout";
import OverviewPage from "./pages/dashboard/OverviewPage";
import ForecastsPage from "./pages/dashboard/ForecastsPage";
import AnomaliesPage from "./pages/dashboard/AnomaliesPage";
import HealthScorePage from "./pages/dashboard/HealthScorePage";
import ScenarioLabPage from "./pages/dashboard/ScenarioLabPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import DataQualityPage from "./pages/dashboard/DataQualityPage";
import CopilotPage from "./pages/dashboard/CopilotPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <FinancialProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<OverviewPage />} />
                <Route path="forecasts" element={<ForecastsPage />} />
                <Route path="anomalies" element={<AnomaliesPage />} />
                <Route path="health" element={<HealthScorePage />} />
                <Route path="scenario" element={<ScenarioLabPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="data-quality" element={<DataQualityPage />} />
                <Route path="copilot" element={<CopilotPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </FinancialProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
