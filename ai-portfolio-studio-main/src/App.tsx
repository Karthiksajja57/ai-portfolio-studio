import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import AIChatPage from "./pages/AIChatPage";
import PortfolioBuilderPage from "./pages/PortfolioBuilderPage";
import TemplatesPage from "./pages/TemplatesPage";
import AnalyzerPage from "./pages/AnalyzerPage";
import PortfolioEditorPage from "./pages/PortfolioEditorPage";
import PublishPage from "./pages/PublishPage";
import SettingsPage from "./pages/SettingsPage";
import RecruiterSimulationPage from "./pages/RecruiterSimulationPage";
import PublicPortfolioPage from "./pages/PublicPortfolioPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="builder" element={<PortfolioBuilderPage />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="editor" element={<PortfolioEditorPage />} />
              <Route path="analyzer" element={<AnalyzerPage />} />
              <Route path="publish" element={<PublishPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="chat" element={<AIChatPage />} />
              <Route path="recruiter" element={<RecruiterSimulationPage />} />
            </Route>
            <Route path="/p/:slug" element={<PublicPortfolioPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
