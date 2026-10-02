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
import { AudioProvider } from "./context/AudioContext";

// Correctif de sécurité DOM pour éviter les crashs React dus aux extensions navigateur / Google Translate (insertBefore/removeChild)
if (typeof window !== "undefined") {
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(node: T, child: Node | null): T {
    if (child && child.parentNode !== this) {
      if (child.parentNode) {
        return child.parentNode.insertBefore(node, child);
      }
      return this.appendChild(node) as T;
    }
    return originalInsertBefore.call(this, node, child) as T;
  };

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (child.parentNode) {
        return child.parentNode.removeChild(child) as T;
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };
}

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import LoadingSpinner from "./components/LoadingSpinner";
import ScrollToTop from "./components/ScrollToTop";
import { Navigation } from "./components/Navigation";
import DashboardShell from "./components/DashboardShell";
import Footer from "./components/Footer";
import GlobalAudioPlayer from "./components/GlobalAudioPlayer";
import { useLocation } from "react-router-dom";

// Global Footer component that hides on Dashboard routes
const GlobalFooter = () => {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/dashboard');
  if (isDashboard) return null;
  return <Footer />;
};

// Public Pages (Direct import for Home, Lazy import for secondary routes to optimize bundle size)
import Index from "./pages/Index";
const Article = React.lazy(() => import("./pages/Article"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Podcast = React.lazy(() => import("./pages/Podcast"));
const PodcastDetail = React.lazy(() => import("./pages/PodcastDetail"));
const Indices = React.lazy(() => import("./pages/Indices"));
const BrvmLatest = React.lazy(() => import("./pages/BrvmLatest"));
const Calculateur = React.lazy(() => import("./pages/Calculateur"));
const GuideDebutant = React.lazy(() => import("./pages/GuideDebutant"));
const ConvertisseurDevises = React.lazy(() => import("./pages/ConvertisseurDevises"));
const Actualites = React.lazy(() => import("./pages/Actualites"));
const Newsletter = React.lazy(() => import("./pages/Newsletter"));
const Marche = React.lazy(() => import("./pages/Marche"));
const Economie = React.lazy(() => import("./pages/Economie"));
const EconomieNews = React.lazy(() => import("./pages/EconomieNews"));
const Industrie = React.lazy(() => import("./pages/Industrie"));
const Investissement = React.lazy(() => import("./pages/Investissement"));
const Insights = React.lazy(() => import("./pages/Insights"));
const Tech = React.lazy(() => import("./pages/Tech"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const SerperIntegration = React.lazy(() => import("./pages/SerperIntegration"));
const PipelineMonitoring = React.lazy(() => import("./pages/PipelineMonitoring"));
const ImportsManagement = React.lazy(() => import("./pages/ImportsManagement"));
const Terms = React.lazy(() => import("./pages/Terms"));
const Confidentialite = React.lazy(() => import("./pages/Confidentialite"));
const MentionsLegales = React.lazy(() => import("./pages/MentionsLegales"));
const CookiesPage = React.lazy(() => import("./pages/Cookies"));
const PlanDuSite = React.lazy(() => import("./pages/PlanDuSite"));

// Dashboard Pages (Lazy loaded for maximum initial load performance)
const DashboardMain = React.lazy(() => import("./pages/DashboardMain"));
const ContentManagement = React.lazy(() => import("./pages/ContentManagement"));
const Articles = React.lazy(() => import("./pages/Articles"));
const NewArticle = React.lazy(() => import("./pages/NewArticle"));
const EditArticle = React.lazy(() => import("./pages/EditArticle"));
const PodcastsManager = React.lazy(() => import("./pages/PodcastsManager"));
const NewPodcast = React.lazy(() => import("./pages/NewPodcast"));
const EditPodcast = React.lazy(() => import("./pages/EditPodcast"));
const LegacyIndicesDisabled = React.lazy(() => import("./pages/LegacyIndicesDisabled"));
const BrvmIndicesManagement = React.lazy(() => import("./pages/BrvmIndicesManagement"));
const CommoditiesManagement = React.lazy(() => import("./pages/CommoditiesManagement"));
const InvestmentOpportunitiesManagement = React.lazy(() => import("./pages/InvestmentOpportunitiesManagement"));
const IndicesHelp = React.lazy(() => import("./pages/IndicesHelp"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Moderation = React.lazy(() => import("./pages/Moderation"));
const ReportsModeration = React.lazy(() => import("./pages/ReportsModeration"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Profile = React.lazy(() => import("./pages/Profile"));
const PermissionsManager = React.lazy(() => import("./pages/PermissionsManager"));
const Users = React.lazy(() => import("./pages/Users"));
const NewUser = React.lazy(() => import("./pages/NewUser"));
const EditUser = React.lazy(() => import("./pages/EditUser"));
const BannedUsers = React.lazy(() => import("./pages/BannedUsers"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const Logs = React.lazy(() => import("./pages/Logs"));
const UserActivity = React.lazy(() => import("./pages/UserActivity"));
const ReportsManager = React.lazy(() => import("./pages/ReportsManager"));
const NewUserAdvanced = React.lazy(() => import("./pages/NewUserAdvanced"));
const Integrations = React.lazy(() => import("./pages/Integrations"));
const Pricing = React.lazy(() => import("./pages/Pricing"));
const SubscriptionsManagement = React.lazy(() => import("./pages/SubscriptionsManagement"));
const NewsletterManagement = React.lazy(() => import("./pages/NewsletterManagement"));
const LegalPagesManagement = React.lazy(() => import("./pages/LegalPagesManagement"));

// Create a single instance of QueryClient with aggressive caching (5 min staleTime)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // 5 minutes cache before refetch
      gcTime: 10 * 60 * 1000, // 10 minutes memory retention
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

    // 1. Patch setAttribute ('src') pour intercepter React 18 DOM mutations
    const originalSetAttribute = HTMLImageElement.prototype.setAttribute;
    HTMLImageElement.prototype.setAttribute = function (name: string, value: string) {
      if (name && name.toLowerCase() === "src") {
        originalSetAttribute.call(this, name, sanitizeSrc(value));
      } else {
        originalSetAttribute.call(this, name, value);
      }
    };

    // 2. Patch le setter de propriété HTMLImageElement.src
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
    window.addEventListener("error", onImgError, true);
    return () => {
      HTMLImageElement.prototype.setAttribute = originalSetAttribute;
      window.removeEventListener("error", onImgError, true);
    };
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
      <React.Suspense fallback={<LoadingSpinner />}>
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
          <Route path="/podcast/:id" element={<PodcastDetail />} />
          <Route path="/indices" element={<Indices />} />
          <Route path="/brvm-latest" element={<BrvmLatest />} />
          <Route path="/calculateur" element={<Calculateur />} />
          <Route path="/guide-debutant" element={<GuideDebutant />} />
          <Route path="/guides/debutant" element={<GuideDebutant />} />
          <Route path="/guide/debutant" element={<GuideDebutant />} />
          <Route path="/convertisseur-devises" element={<ConvertisseurDevises />} />
          <Route path="/convertisseur-devise" element={<ConvertisseurDevises />} />
          <Route path="/convertisseur-cfa" element={<ConvertisseurDevises />} />
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

          {/* Pages Légales & Réglementaires */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/conditions-utilisation" element={<Terms />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/privacy" element={<Confidentialite />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/legal" element={<MentionsLegales />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/politique-cookies" element={<CookiesPage />} />
          <Route path="/plan-du-site" element={<PlanDuSite />} />
          <Route path="/sitemap" element={<PlanDuSite />} />

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
            <Route path="newsletters" element={<NewsletterManagement />} />
            <Route path="users/edit/:userId" element={<EditUser />} />
            <Route path="user-activity" element={<UserActivity />} />
            <Route path="reports" element={<ReportsManager />} />
            <Route path="banned-users" element={<BannedUsers />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="logs" element={<Logs />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="legal-pages" element={<LegalPagesManagement />} />
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
      </React.Suspense>
      <GlobalFooter />
      <GlobalAudioPlayer />
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
            <AudioProvider>
              <Toaster />
              <Sonner />
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </AudioProvider>
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
