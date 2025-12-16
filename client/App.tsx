import React from "react";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { supabaseHealthCheck, isSupabaseDebug } from "./lib/supabase";

// Context Providers
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import ScrollToTop from "./components/ScrollToTop";
import { Navigation } from "./components/Navigation";
import DashboardShell from "./components/DashboardShell";

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

  useEffect(() => {
    if (isSupabaseDebug) {
      supabaseHealthCheck("app-mount");
    }
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
          <Route path="users/edit/:userId" element={<EditUser />} />
          <Route path="user-activity" element={<UserActivity />} />
          <Route path="reports" element={<ReportsManager />} />
          <Route path="banned-users" element={<BannedUsers />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="logs" element={<Logs />} />
          <Route path="integrations" element={<Integrations />} />
        </Route>

        {/* 404 route */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  404
                </h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                  Page not found
                </p>
              </div>
            </div>
          }
        />
      </Routes>
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
            <AppContent />
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
