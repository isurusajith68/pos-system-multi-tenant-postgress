import React, { useState } from "react";
import CategoryManagement from "../pages/CategoryManagement";
import ProductManagement from "../pages/ProductManagement";
import CustomerManagement from "../pages/CustomerManagement";
import SalesInvoices from "../pages/SalesInvoices";
import UnifiedStockManagement from "../pages/UnifiedStockManagement";
import PurchaseOrderManagement from "../pages/PurchaseOrderManagement";
import ReportsManagement from "../pages/ReportsManagement";
import SettingsManagement from "../pages/SettingsManagement";
import POSSystem2 from "@renderer/pages/POSSystem2";

const Navigation: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("pos");

  const renderPage = (): React.JSX.Element => {
    switch (currentPage) {
      case "pos":
        return <POSSystem2 />;
      case "categories":
        return <CategoryManagement />;
      case "products":
        return <ProductManagement />;
      case "customers":
        return <CustomerManagement />;
      case "settings":
        return <SettingsManagement />;
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
      default:
        return <POSSystem2 />;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-0"> Zentra</h1>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => setCurrentPage("pos")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                currentPage === "pos"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">🛒 </span>POS
            </button>
            <button
              onClick={() => setCurrentPage("categories")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                currentPage === "categories"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">📂 </span>Categories
            </button>
            <button
              onClick={() => setCurrentPage("products")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                currentPage === "products"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">📦 </span>Products
            </button>
            <button
              onClick={() => setCurrentPage("customers")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                currentPage === "customers"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">👥 </span>Customers
            </button>
            <button
              onClick={() => setCurrentPage("invoices")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                currentPage === "invoices"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">📄 </span>Invoices
            </button>
            <button
              onClick={() => setCurrentPage("purchase-orders")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                currentPage === "purchase-orders"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">📋 </span>Purchase Orders
            </button>
            <button
              onClick={() => setCurrentPage("inventory")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                currentPage === "inventory" ||
                currentPage === "stock-hub" ||
                currentPage === "stock-transactions"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">� </span>Stock Management
            </button>
            <button
              onClick={() => setCurrentPage("settings")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                currentPage === "settings"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">⚙️ </span>Settings
            </button>
            <button
              onClick={() => setCurrentPage("reports")}
              className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                currentPage === "reports"
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              <span className="hidden sm:inline">📊 </span>Reports
            </button>
          </div>

          <div className="text-xs sm:text-sm hidden lg:block">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden">{renderPage()}</main>
    </div>
  );
};

export default Navigation;
