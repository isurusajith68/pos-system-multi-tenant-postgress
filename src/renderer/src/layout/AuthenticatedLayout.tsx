import React, { useState, useEffect } from "react";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import { useTranslation } from "../contexts/LanguageContext";
import LoginComponent from "../auth/Login";
import POSSystem from "../pages/POSSystem";
import POSSystem2 from "../pages/POSSystem2";
import CategoryManagement from "../pages/CategoryManagement";
import ProductManagement from "../pages/ProductManagement";
import CustomerManagement from "../pages/CustomerManagement";
import SalesInvoices from "../pages/SalesInvoices";
import UnifiedStockManagement from "../pages/UnifiedStockManagement";
import PurchaseOrderManagement from "../pages/PurchaseOrderManagement";
import ReportsManagement from "../pages/ReportsManagement";
import SettingsManagement from "../pages/SettingsManagement";
import logo from "../assets/logo.png";

interface AuthenticatedLayoutProps {
  children?: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading, currentUser: user, logout } = useCurrentUser();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState("pos");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t("Loading...")}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginComponent />;
  }
  console.log(user);
  const renderPage = () => {
    switch (currentPage) {
      case "xp":
        return <POSSystem />;
      case "pos":
        return <POSSystem2 />;
      case "categories":
        return <CategoryManagement />;
      case "products":
        return <ProductManagement />;
      case "customers":
        return <CustomerManagement />;
      case "invoices":
        return <SalesInvoices />;
      case "purchase-orders":
        return <PurchaseOrderManagement />;
      case "reports":
        return <ReportsManagement />;
      case "inventory":
      case "smart-inventory":
      case "stock-transactions":
      case "stock-hub":
        return <UnifiedStockManagement />;
      case "settings":
        return <SettingsManagement />;
      default:
        return <POSSystem />;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-[#2b83ff] text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            <img src={logo} alt="Zentra Logo" className="h-10 w-10 rounded-full bg-white" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Zentra</h1>
          </div>

          <div className="flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => setCurrentPage("pos")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-sm ${
                currentPage === "pos"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">🛒 </span>
              {"POS"}
            </button>
            <button
              onClick={() => setCurrentPage("categories")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-sm ${
                currentPage === "categories"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">📂 </span>
              {"Categories"}
            </button>
            <button
              onClick={() => setCurrentPage("products")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-sm ${
                currentPage === "products"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">📦 </span>
              {"Products"}
            </button>
            <button
              onClick={() => setCurrentPage("customers")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-sm ${
                currentPage === "customers"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">👥 </span>
              {"Customers"}
            </button>
            <button
              onClick={() => setCurrentPage("invoices")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-sm ${
                currentPage === "invoices"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">📄 </span>
              {"Invoices"}
            </button>
            <button
              onClick={() => setCurrentPage("purchase-orders")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-sm ${
                currentPage === "purchase-orders"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">📋 </span>
              {"PO"}
            </button>
            <button
              onClick={() => setCurrentPage("inventory")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-sm ${
                currentPage === "inventory" ||
                currentPage === "stock-hub" ||
                currentPage === "stock-transactions"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">📊 </span>
              {"Stock Management"}
            </button>
            <button
              onClick={() => setCurrentPage("reports")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-sm ${
                currentPage === "reports"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">📊 </span>
              {"Reports"}
            </button>
            <button
              onClick={() => setCurrentPage("settings")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-sm ${
                currentPage === "settings"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">⚙️ </span>
              {"Settings"}
            </button>
            <button
              onClick={() => setCurrentPage("xp")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-sm ${
                currentPage === "xp"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">🛒 </span>
              {"XP"}
            </button>
          </div>

          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <div className="text-xs text-white hidden lg:block">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 px-1 py-1 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 text-white"
              >
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center p-2">
                  <span className="text-sm">👤</span>
                </div>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 transform transition-all duration-200 ease-out">
                  {/* Header with close button */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                    <h3 className="text-sm font-semibold text-gray-800">Profile Menu</h3>
                    <button
                      onClick={() => setShowProfileDropdown(false)}
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Close profile menu"
                    >
                      <span className="text-gray-500 text-lg leading-none">×</span>
                    </button>
                  </div>

                  {/* User Info Section */}
                  <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-lg">👤</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-blue-500">{user?.companyName}</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {user?.role}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setCurrentPage("settings");
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 group"
                    >
                      <span className="mr-3 text-gray-400 group-hover:text-blue-500">⚙️</span>
                      <span className="font-medium">Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPage("settings"); // Assuming employee management is under settings
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 group"
                    >
                      <span className="mr-3 text-gray-400 group-hover:text-blue-500">👥</span>
                      <span className="font-medium">Manage Employees</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 pt-2 bg-gray-50 rounded-b-xl">
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 group"
                    >
                      <span className="mr-3 text-red-400 group-hover:text-red-500">🚪</span>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        {children || renderPage()}
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
