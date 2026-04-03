import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { WorkspaceProvider } from "@/hooks/useWorkspace";

// Landing pages
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import HelpPage from "./pages/HelpPage";
import ForInstitutionsPage from "./pages/ForInstitutionsPage";
import TermsPage from "./pages/TermsPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import ReportFraudPage from "./pages/ReportFraudPage";

// Auth pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyPage from "./pages/VerifyPage";

// Dashboard pages
import DashboardLayout from "./pages/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import StudentsPage from "./pages/dashboard/StudentsPage";
import CertificatesPage from "./pages/dashboard/CertificatesPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import CredentialPassportPage from "./pages/dashboard/CredentialPassportPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import VaultPage from "./pages/VaultPage";

// Explorer & Student Dashboard
import ExplorerPage from "./pages/ExplorerPage";
import StudentDashboardPage from "./pages/dashboard/StudentDashboardPage";

// Public pages
import PublicCredentialLedger from "./pages/credentials/PublicCredentialLedger";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WorkspaceProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Landing Pages - No Auth Required */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/institutions" element={<ForInstitutionsPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/report-fraud" element={<ReportFraudPage />} />

                {/* Auth Pages - No Auth Required */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify" element={<VerifyPage />} />

                {/* Public Credential Verification - No Auth Required */}
                <Route path="/credentials/:studentId" element={<PublicCredentialLedger />} />

                {/* Institution Dashboard - Auth Required */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardOverview />} />
                  <Route path="students" element={<StudentsPage />} />
                  <Route path="certificates" element={<CertificatesPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="passports" element={<CredentialPassportPage />} />
                  <Route path="passports/:passportId" element={<CredentialPassportPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Vault - Auth Required */}
                <Route path="/vault" element={<DashboardLayout />}>
                  <Route index element={<VaultPage />} />
                </Route>

                {/* Explorer - Auth Required */}
                <Route path="/explorer" element={<DashboardLayout />}>
                  <Route index element={<ExplorerPage />} />
                </Route>

                {/* Student Passport Dashboard */}
                <Route path="/student" element={<DashboardLayout />}>
                  <Route index element={<StudentDashboardPage />} />
                </Route>

                {/* Temporary redirect for /index to home */}
                <Route path="/index" element={<Index />} />

                {/* 404 Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
