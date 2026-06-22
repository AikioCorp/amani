import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Menu,
  X,
  User,
  LogIn,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getRoleDisplayName } from "../lib/demoAccounts";

const navigationItems = [
  { name: "Accueil", href: "/" },
  { name: "Marché", href: "/marche" },
  { name: "Économie", href: "/economie" },
  { name: "Industrie", href: "/industrie" },
  { name: "Investissement", href: "/investissement" },
  { name: "Insights", href: "/insights" },
  { name: "Tech", href: "/tech" },
  { name: "Podcast", href: "/podcast" },
  { name: "Contact", href: "/contact" },
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="bg-[#373B3A] border-b border-[#373B3A]/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fa7441c9084eb43e6855cf7e960c5c609%2F6ebebc1a91e8447db48a68aa5b391a28?format=webp&width=800"
                alt="Amani - African Market & News Insights"
                className="h-12 lg:h-16 w-auto group-hover:opacity-90 transition-opacity brightness-0 invert"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-center space-x-1 xl:space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 xl:px-4 py-2 text-sm xl:text-base font-medium transition-all duration-300 rounded-lg relative overflow-hidden group ${
                    isActive(item.href)
                      ? "text-white bg-white/20"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  {isActive(item.href) && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></div>
                  )}
                </Link>
              ))}

              {/* User Dropdown */}
              <div className="ml-6 relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200"
                >
                  <User className="w-4 h-4" />
                  {isAuthenticated ? (
                    <span className="hidden lg:block">{user?.firstName}</span>
                  ) : (
                    <span className="hidden lg:block">Compte</span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-200">
                          <div className="font-medium text-amani-primary">
                            {user?.firstName} {user?.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {user?.email}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {getRoleDisplayName(user?.role || "")}
                          </div>
                        </div>
                        <Link
                          to="/dashboard"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Tableau de bord
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Se déconnecter
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LogIn className="w-4 h-4" />
                          Connexion
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          S'inscrire
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">
                {isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              </span>
              <div className="relative w-6 h-6">
                <Menu
                  className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isMobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"}`}
                  aria-hidden="true"
                />
                <X
                  className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isMobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}`}
                  aria-hidden="true"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-4 pb-6 space-y-2 bg-gradient-to-b from-amani-primary to-amani-primary/90 border-t border-white/20">
          {navigationItems.map((item, index) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 transform ${
                isActive(item.href)
                  ? "text-white bg-white/20 shadow-sm scale-105"
                  : "text-white/80 hover:text-white hover:bg-white/10 hover:scale-105"
              }`}
              style={{
                animationDelay: isMobileMenuOpen ? `${index * 50}ms` : "0ms",
              }}
            >
              {item.name}
            </Link>
          ))}

          {/* Mobile Login Buttons */}
          <div className="pt-4 space-y-2 border-t border-white/20 mt-4">
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-base font-medium text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              <LogIn className="w-4 h-4" />
              Connexion
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-base font-medium text-amani-primary bg-white rounded-xl hover:bg-white/90 transition-all duration-200"
            >
              <User className="w-4 h-4" />
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
