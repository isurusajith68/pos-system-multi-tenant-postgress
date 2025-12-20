import React, { useState, useEffect } from "react";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import { useTranslation } from "../contexts/LanguageContext";
import LoginComponent from "../auth/Login";
import LicenseActivationDialog from "../auth/LicenseActivationDialog";
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
  const [isLicenseActivated, setIsLicenseActivated] = useState<boolean | null>(null);
  const [isCheckingLicense, setIsCheckingLicense] = useState(true);

  // Check license activation on component mount
  useEffect(() => {
    checkLicenseActivation();
  }, []);

  const checkLicenseActivation = async () => {
    try {
      const activated = await window.api.license.isActivated();
      setIsLicenseActivated(activated);
    } catch (error) {
      console.error("Error checking license activation:", error);
      setIsLicenseActivated(false);
    } finally {
      setIsCheckingLicense(false);
    }
  };

  const handleLicenseActivated = () => {
    setIsLicenseActivated(true);
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isLoading || isCheckingLicense) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t("Loading...")}</p>
        </div>
      </div>
    );
  }

  if (isLicenseActivated === false) {
    return <LicenseActivationDialog onLicenseActivated={handleLicenseActivated} />;
  }

  if (!isAuthenticated) {
    return <LoginComponent />;
  }

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
              {t("POS")}
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
              {t("Categories")}
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
              {t("Products")}
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
              {t("Customers")}
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
              {t("Invoices")}
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
              {t("PO")}
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
              {t("Stock Management")}
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
              {t("Reports")}
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
              {t("Settings")}
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
              {t("XP")}
            </button>
          </div>

          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <div className="text-xs text-white hidden lg:block">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="relative">
              <button
                onMouseEnter={() => setShowProfileDropdown(true)}
                onMouseLeave={() => setShowProfileDropdown(false)}
                className="flex items-center space-x-2 px-1 py-1 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 text-white"
              >
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-sm">👤</span>
                </div>
              </button>

              {showProfileDropdown && (
                <div
                  onMouseEnter={() => setShowProfileDropdown(true)}
                  onMouseLeave={() => setShowProfileDropdown(false)}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <span className="inline-block px-2 py-1 mt-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => setCurrentPage("settings")}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span className="mr-3">⚙️</span>
                      {t("Settings")}
                    </button>
                    <button
                      onClick={() => setCurrentPage("settings")}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span className="mr-3">👥</span>
                      {t("Manage Employees")}
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={logout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="mr-3">🚪</span>
                      {t("Logout")}
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
