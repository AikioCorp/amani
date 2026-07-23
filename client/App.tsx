import React from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Context Providers
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import LoadingSpinner from "./components/LoadingSpinner";
import ScrollToTop from "./components/ScrollToTop";
import { Navigation } from "./components/Navigation";
import DashboardShell from "./components/DashboardShell";
import Footer from "./components/Footer";
import { useLocation } from "react-router-dom";

// Global Footer component that hides on Dashboard routes
const GlobalFooter = () => {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/dashboard');
  if (isDashboard) return null;
  return <Footer />;
};

// Public Pages
import Index from "./pages/Index";
import Article from "./pages/Article";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Podcast from "./pages/Podcast";
import Indices from "./pages/Indices";
import BrvmLatest from "./pages/BrvmLatest";
import Calculateur from "./pages/Calculateur";
import GuideDebutant from "./pages/GuideDebutant";
import Actualites from "./pages/Actualites";
import Newsletter from "./pages/Newsletter";
import Marche from "./pages/Marche";
import Economie from "./pages/Economie";
import EconomieNews from "./pages/EconomieNews";
import Industrie from "./pages/Industrie";
import Investissement from "./pages/Investissement";
import Insights from "./pages/Insights";
import Tech from "./pages/Tech";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SerperIntegration from "./pages/SerperIntegration";
import PipelineMonitoring from "./pages/PipelineMonitoring";
import ImportsManagement from "./pages/ImportsManagement";

// Dashboard Pages
import DashboardMain from "./pages/DashboardMain";
import ContentManagement from "./pages/ContentManagement";
import Articles from "./pages/Articles";
import NewArticle from "./pages/NewArticle";
import EditArticle from "./pages/EditArticle";
import PodcastsManager from "./pages/PodcastsManager";
import NewPodcast from "./pages/NewPodcast";
import EditPodcast from "./pages/EditPodcast";
import LegacyIndicesDisabled from "./pages/LegacyIndicesDisabled";
import BrvmIndicesManagement from "./pages/BrvmIndicesManagement";
import CommoditiesManagement from "./pages/CommoditiesManagement";
import InvestmentOpportunitiesManagement from "./pages/InvestmentOpportunitiesManagement";
import IndicesHelp from "./pages/IndicesHelp";
import Analytics from "./pages/Analytics";
import Moderation from "./pages/Moderation";
import ReportsModeration from "./pages/ReportsModeration";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import PermissionsManager from "./pages/PermissionsManager";
import Users from "./pages/Users";
import NewUser from "./pages/NewUser";
import EditUser from "./pages/EditUser";
import BannedUsers from "./pages/BannedUsers";
import Notifications from "./pages/Notifications";
import Logs from "./pages/Logs";
import UserActivity from "./pages/UserActivity";
import ReportsManager from "./pages/ReportsManager";
import NewUserAdvanced from "./pages/NewUserAdvanced";
import Integrations from "./pages/Integrations";
import Pricing from "./pages/Pricing";
import SubscriptionsManagement from "./pages/SubscriptionsManagement";

// Create a single instance of QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Main App Content Component
const AppContent = () => {
  const { isLoading } = useAuth();

  // Intercepteur proactif & filet de sécurité global pour les images :
  // Remplace immédiatement les anciennes URLs Supabase mortes par /placeholder.svg
  // AVANT que le navigateur ne tente la résolution DNS et ne génère une erreur net::ERR_NAME_NOT_RESOLVED dans la console.
  React.useEffect(() => {
    const sanitizeSrc = (url: string) => {
      if (url && (url.includes("supabase.co") || url.includes("rrhcctylbczzahgiqoub"))) {
        return "/placeholder.svg";
      }
      return url;
    };

    // Patch sur le prototype HTMLImageElement
    const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
    if (descriptor && descriptor.set) {
      const originalSet = descriptor.set;
      Object.defineProperty(HTMLImageElement.prototype, "src", {
        configurable: true,
        enumerable: true,
        get() {
          return descriptor.get ? descriptor.get.call(this) : "";
        },
        set(val: string) {
          originalSet.call(this, sanitizeSrc(val));
        },
      });
    }

    const onImgError = (e: Event) => {
      const el = e.target as HTMLElement;
      if (el?.tagName === "IMG") {
        const img = el as HTMLImageElement;
        if (!img.src.endsWith("/placeholder.svg")) {
          img.src = "/placeholder.svg";
        }
      }
    };
    document.addEventListener("error", onImgError, true);
    return () => document.removeEventListener("error", onImgError, true);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      <Navigation />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/article/:id" element={<Article />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/podcast" element={<Podcast />} />
        <Route path="/indices" element={<Indices />} />
        <Route path="/brvm-latest" element={<BrvmLatest />} />
        <Route path="/calculateur" element={<Calculateur />} />
        <Route path="/guide-debutant" element={<GuideDebutant />} />
        <Route path="/actualites" element={<Actualites />} />
        <Route path="/newsletter" element={<Newsletter />} />
        <Route path="/marche" element={<Marche />} />
        <Route path="/economie" element={<Economie />} />
        <Route path="/economie/news" element={<EconomieNews />} />
        <Route path="/industrie" element={<Industrie />} />
        <Route path="/investissement" element={<Investissement />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/tech" element={<Tech />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/abonnement" element={<Pricing />} />

        {/* Protected Dashboard Routes (persistent layout with nested routes) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardMain />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="content-management" element={<ContentManagement />} />
          <Route path="articles" element={<Articles />} />
          <Route path="articles/new" element={<NewArticle />} />
          <Route path="articles/edit/:id" element={<EditArticle />} />
          <Route path="podcasts" element={<PodcastsManager />} />
          <Route path="podcasts/new" element={<NewPodcast />} />
          <Route path="podcasts/edit/:id" element={<EditPodcast />} />
          <Route path="indices" element={<LegacyIndicesDisabled />} />
          <Route path="indices/new" element={<LegacyIndicesDisabled />} />
          <Route path="indices/edit/:id" element={<LegacyIndicesDisabled />} />
          <Route path="indices-management" element={<BrvmIndicesManagement />} />
          <Route path="commodities-management" element={<CommoditiesManagement />} />
          <Route path="investment-opportunities" element={<InvestmentOpportunitiesManagement />} />
          <Route path="indices-help" element={<IndicesHelp />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="moderation" element={<Moderation />} />
          <Route path="reports-moderation" element={<ReportsModeration />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="permissions" element={<PermissionsManager />} />
          <Route path="users" element={<Users />} />
          <Route path="users/new" element={<NewUser />} />
          <Route path="users/new-advanced" element={<NewUserAdvanced />} />
          <Route path="subscriptions" element={<SubscriptionsManagement />} />
          <Route path="users/edit/:userId" element={<EditUser />} />
          <Route path="user-activity" element={<UserActivity />} />
          <Route path="reports" element={<ReportsManager />} />
          <Route path="banned-users" element={<BannedUsers />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="logs" element={<Logs />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="serper" element={<SerperIntegration />} />
          <Route path="imports" element={<ImportsManagement />} />
          <Route path="monitoring" element={<PipelineMonitoring />} />
        </Route>

        {/* 404 route */}
        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
      <GlobalFooter />
    </BrowserRouter>
  );
};

// Main App Component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ToastProvider>
            <Toaster />
            <Sonner />
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </ToastProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Initialize React root
const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;
