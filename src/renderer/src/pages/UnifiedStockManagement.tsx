import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { formatToThreeDecimalPlaces } from "../lib/quantityValidation";
import { useTranslation } from "../contexts/LanguageContext";

// Interfaces
interface Product {
  id: string;
  name: string;
  englishName?: string;
  sku?: string;
  price: number;
  costPrice?: number;
  stockLevel: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
}

interface Inventory {
  id: string;
  productId: string;
  quantity: number;
  reorderLevel: number;
  batchNumber?: string;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
}

interface StockTransaction {
  id: string;
  productId: string;
  type: string;
  changeQty: number;
  reason: string;
  relatedInvoiceId?: string;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
  product?: {
    id: string;
    name: string;
    englishName?: string;
    sku?: string;
  };
}

interface StockSyncInfo {
  productId: string;
  productName: string;
  productStockLevel: number;
  inventoryTotal: number;
  isInSync: boolean;
}

// SearchableDropdown Component
interface SearchableDropdownProps {
  options: Product[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Search and select...",
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(
    (option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.englishName && option.englishName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (option.sku && option.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get selected option display text
  const selectedOption = options.find((option) => option.id === value);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset search term when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleOptionSelect = (optionId: string) => {
    setIsOpen(false); // Close dropdown immediately
    setSearchTerm("");
    onChange(optionId);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionSelect(filteredOptions[highlightedIndex].id);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={
            isOpen
              ? searchTerm
              : selectedOption
                ? `${selectedOption.name}${selectedOption.sku ? ` (${selectedOption.sku})` : ""}`
                : ""
          }
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:bg-slate-800 disabled:cursor-not-allowed"
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            type="button"
            onClick={() => {
              if (!disabled) {
                setIsOpen(!isOpen);
                if (!isOpen) {
                  inputRef.current?.focus();
                }
              }
            }}
            className="px-2 pointer-events-auto"
            disabled={disabled}
          >
            <svg
              className={`w-5 h-5 text-gray-400 transform transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 dark:text-slate-400 text-sm">
              {searchTerm ? "No products found" : "Start typing to search..."}
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleOptionSelect(option.id)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-900 focus:bg-gray-100 dark:bg-slate-800 focus:outline-none ${
                  index === highlightedIndex ? "bg-blue-50" : ""
                } ${option.id === value ? "bg-blue-100 font-medium" : ""}`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {option.name}
                  </span>
                  {option.sku && (
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      SKU: {option.sku}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const UnifiedStockManagement: React.FC = () => {
  const { t } = useTranslation();

  // Main tab state
  const [activeMainTab, setActiveMainTab] = useState<"overview" | "inventory" | "transactions">(
    "overview"
  );

  // Common states
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [inventoryPageItems, setInventoryPageItems] = useState<Inventory[]>([]);
  const [inventoryTotalItems, setInventoryTotalItems] = useState(0);
  const [transactionsPageItems, setTransactionsPageItems] = useState<StockTransaction[]>([]);
  const [transactionsTotalItems, setTransactionsTotalItems] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<number>(0);

  // Stock Sync states (from StockManagementHub)
  const [stockSyncData, setStockSyncData] = useState<StockSyncInfo[]>([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StockSyncInfo | null>(null);

  // Inventory Management states
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpiring, setShowExpiring] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    productId: "",
    quantity: 0,
    reorderLevel: 0,
    batchNumber: "",
    expiryDate: ""
  });

  // Transaction states
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    productId: "",
    type: "OUT",
    changeQty: 0,
    reason: "",
    customReason: ""
  });

  // Quick adjustment states
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    adjustmentType: "set", // "set" for setting exact quantity, "add" for adding, "subtract" for removing
    newQuantity: 0,
    changeAmount: 0,
    reason: "",
    customReason: "",
    notes: ""
  });
  const adjustmentSummary = useMemo(() => {
    if (!selectedItem) {
      return null;
    }

    let targetQuantity = selectedItem.quantity;

    if (adjustmentForm.adjustmentType === "set") {
      targetQuantity = adjustmentForm.newQuantity;
    } else if (adjustmentForm.adjustmentType === "add") {
      targetQuantity = selectedItem.quantity + adjustmentForm.changeAmount;
    } else {
      targetQuantity = Math.max(0, selectedItem.quantity - adjustmentForm.changeAmount);
    }

    const delta = targetQuantity - selectedItem.quantity;

    return {
      targetQuantity,
      delta,
      trend: delta === 0 ? "neutral" : delta > 0 ? "up" : "down",
      reasonLabel:
        adjustmentForm.reason === "other" ? adjustmentForm.customReason : adjustmentForm.reason
    };
  }, [selectedItem, adjustmentForm]);

  // Pagination states
  const [inventoryPage, setInventoryPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [inventoryItemsPerPage, setInventoryItemsPerPage] = useState(10);
  const [transactionsItemsPerPage, setTransactionsItemsPerPage] = useState(10);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const inventoryFilters = useMemo(() => {
    const filters: {
      searchTerm?: string;
      lowStock?: boolean;
      expiringSoon?: boolean;
    } = {};

    if (debouncedSearchTerm) {
      filters.searchTerm = debouncedSearchTerm;
    }

    if (showLowStock) {
      filters.lowStock = true;
    }

    if (showExpiring) {
      filters.expiringSoon = true;
    }

    return filters;
  }, [debouncedSearchTerm, showLowStock, showExpiring]);

  const transactionFilters = useMemo(() => {
    const filters: { searchTerm?: string } = {};

    if (debouncedSearchTerm) {
      filters.searchTerm = debouncedSearchTerm;
    }

    return filters;
  }, [debouncedSearchTerm]);

  const inventorySummary = useMemo(() => {
    const totalValue = inventory.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );
    const lowStockCount = inventory.filter((item) => item.quantity <= item.reorderLevel).length;
    const expiringItemsCount = inventory.filter((item) => {
      if (!item.expiryDate) {
        return false;
      }
      const daysToExpiry = Math.ceil(
        (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysToExpiry <= 30 && daysToExpiry >= 0;
    }).length;

    return {
      totalValue,
      lowStockCount,
      expiringItemsCount,
      visibleItems: inventoryPageItems.length,
      totalItems: inventoryTotalItems
    };
  }, [inventory, inventoryPageItems.length, inventoryTotalItems]);

  useEffect(() => {
    setInventoryPage(1);
  }, [inventoryFilters]);

  useEffect(() => {
    setTransactionsPage(1);
  }, [transactionFilters]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(inventoryTotalItems / inventoryItemsPerPage));
    if (inventoryPage > totalPages) {
      setInventoryPage(totalPages);
    }
  }, [inventoryTotalItems, inventoryItemsPerPage, inventoryPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(transactionsTotalItems / transactionsItemsPerPage));
    if (transactionsPage > totalPages) {
      setTransactionsPage(totalPages);
    }
  }, [transactionsTotalItems, transactionsItemsPerPage, transactionsPage]);

  const fetchProducts = useCallback(async (): Promise<void> => {
    const data = await window.api.products.findMany();
    setProducts(data);
  }, []);

  const fetchInventoryAll = useCallback(async (): Promise<void> => {
    const data = await window.api.inventory.findMany({});
    setInventory(data);
  }, []);

  const fetchInventoryPage = useCallback(async (): Promise<void> => {
    try {
      const pagination = {
        skip: (inventoryPage - 1) * inventoryItemsPerPage,
        take: inventoryItemsPerPage
      };
      const [data, total] = await Promise.all([
        window.api.inventory.findMany(inventoryFilters, { pagination }),
        window.api.inventory.count(inventoryFilters)
      ]);
      setInventoryPageItems(data);
      setInventoryTotalItems(total);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error(t("Failed to load inventory"));
    }
  }, [inventoryPage, inventoryItemsPerPage, inventoryFilters, t]);

  const fetchTransactionsPage = useCallback(async (): Promise<void> => {
    try {
      const pagination = {
        skip: (transactionsPage - 1) * transactionsItemsPerPage,
        take: transactionsItemsPerPage
      };
      const [data, total] = await Promise.all([
        window.api.stockTransactions.findMany(transactionFilters, { pagination }),
        window.api.stockTransactions.count(transactionFilters)
      ]);
      setTransactionsPageItems(data);
      setTransactionsTotalItems(total);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error(t("Failed to load transactions"));
    }
  }, [transactionsPage, transactionsItemsPerPage, transactionFilters, t]);

  const fetchRecentTransactions = useCallback(async (): Promise<void> => {
    try {
      const data = await window.api.stockTransactions.findMany({}, { pagination: { take: 5 } });
      setRecentTransactions(data);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
    }
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchInventoryAll(), fetchRecentTransactions()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(t("Failed to load data"));
    } finally {
      setLoading(false);
    }
    void fetchInventoryPage();
    void fetchTransactionsPage();
  }, [
    fetchProducts,
    fetchInventoryAll,
    fetchRecentTransactions,
    fetchInventoryPage,
    fetchTransactionsPage,
    t
  ]);

  // Auto-sync stock levels
  const autoSyncStock = useCallback(async () => {
    try {
      toast.loading(t("Synchronizing stock levels..."), { id: "sync-loading" });

      await window.api.stockSync.syncAllProductsStockFromInventory();
      await fetchAllData(); // Refresh data after sync

      toast.success(t("Stock levels synchronized successfully!"), { id: "sync-loading" });
    } catch (error) {
      console.error("Error during auto-sync:", error);
      toast.error(t("Failed to sync stock levels"), { id: "sync-loading" });
    }
  }, [fetchAllData, t]);

  useEffect(() => {
    void fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    void fetchInventoryPage();
  }, [fetchInventoryPage]);

  useEffect(() => {
    void fetchTransactionsPage();
  }, [fetchTransactionsPage]);

  // Scanner event listener with barcode validation
  useEffect(() => {
    if (!scannerEnabled) {
      console.log("Scanner disabled, removing listeners");
      window.api?.scanner?.removeAllListeners?.();
      return;
    }

    console.log("Setting up scanner event listeners");
    window.api?.scanner?.removeAllListeners?.();

    const handleScanData = (data: { data?: string }): void => {
      // Skip processing if user is actively typing in an input field
      if (isInputFocused) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastScanTime < 100) {
        return;
      }

      if (!data || !data.data) {
        console.warn("Invalid scan data received:", data);
        return;
      }

      const scannedCode = data.data.trim();

      // Barcode validation - skip obvious keyboard input patterns
      if (!scannedCode || scannedCode.length < 3) {
        return;
      }

      if (scannedCode.length === 1) {
        return;
      }

      if (/^\d+$/.test(scannedCode) && scannedCode.length < 6) {
        return;
      }

      if (/^[a-zA-Z]{3,}$/.test(scannedCode) && scannedCode.length < 8) {
        return;
      }

      if (/[\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>?/]/.test(scannedCode)) {
        return;
      }

      setLastScanTime(currentTime);

      // Search for product by SKU or barcode
      const foundProduct = products.find(
        (p) => p.sku === scannedCode || p.sku?.toLowerCase() === scannedCode.toLowerCase()
      );

      if (foundProduct) {
        setSearchTerm(foundProduct.name);
        toast.success(t("Product found: {name}", { name: foundProduct.name }));
      } else {
        setSearchTerm(scannedCode);
        toast.error(t("Product not found for code: {code}", { code: scannedCode }));
      }
    };

    if (window.api?.scanner) {
      window.api.scanner.onData(handleScanData);
    } else {
      console.error("Scanner API not available");
    }

    return () => {
      console.log("Cleaning up scanner listeners");
      window.api?.scanner?.removeAllListeners?.();
    };
  }, [scannerEnabled, products, isInputFocused, lastScanTime, t]);

  // Track input focus to prevent scanner interference
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent): void => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        console.log("Input field focused, disabling scanner temporarily");
        setIsInputFocused(true);
      }
    };

    const handleFocusOut = (e: FocusEvent): void => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        console.log("Input field unfocused, re-enabling scanner");
        setIsInputFocused(false);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, [isInputFocused]);

  // Calculate sync information whenever data changes
  useEffect(() => {
    calculateStockSync();
  }, [products, inventory]);

  const calculateStockSync = () => {
    const syncInfo: StockSyncInfo[] = products.map((product) => {
      const productInventory = inventory.filter((inv) => inv.productId === product.id);
      const inventoryTotal = productInventory.reduce((sum, inv) => sum + inv.quantity, 0);
      const isInSync = product.stockLevel === inventoryTotal;

      return {
        productId: product.id,
        productName: product.name,
        productStockLevel: product.stockLevel,
        inventoryTotal,
        isInSync
      };
    });

    setStockSyncData(syncInfo);
  };

  // Inventory Management Functions
  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inventoryForm.productId) {
      toast.error(t("Please select a product"));
      return;
    }

    try {
      const dataToSubmit = {
        productId: inventoryForm.productId,
        quantity: inventoryForm.quantity,
        reorderLevel: inventoryForm.reorderLevel,
        batchNumber: inventoryForm.batchNumber || undefined,
        expiryDate: inventoryForm.expiryDate ? new Date(inventoryForm.expiryDate) : undefined
      };

      const existingRecord = inventory.find((item) => item.productId === inventoryForm.productId);

      if (existingRecord) {
        await window.api.inventory.upsert(dataToSubmit);
        toast.success(t("Inventory updated successfully!"));
      } else {
        await window.api.inventory.create(dataToSubmit);
        toast.success(t("Inventory created successfully!"));
      }

      setInventoryForm({
        productId: "",
        quantity: 0,
        reorderLevel: 0,
        batchNumber: "",
        expiryDate: ""
      });
      setShowInventoryForm(false);
      await fetchAllData();
    } catch (error) {
      console.error("Error saving inventory:", error);
      toast.error(t("Failed to save inventory"));
    }
  };

  // Handle inventory product selection
  const handleInventoryProductChange = (productId: string): void => {
    const existingInventory = inventory.find((item) => item.productId === productId);

    if (existingInventory) {
      // Load existing inventory data
      setInventoryForm({
        productId: existingInventory.productId,
        quantity: existingInventory.quantity,
        reorderLevel: existingInventory.reorderLevel,
        batchNumber: existingInventory.batchNumber || "",
        expiryDate: existingInventory.expiryDate
          ? new Date(existingInventory.expiryDate).toISOString().split("T")[0]
          : ""
      });

      // Show alert that existing inventory was loaded
      toast.success(
        t(
          "Existing inventory data loaded for {productName}. You can now update the existing inventory record.",
          {
            productName: existingInventory.product?.name || "this product"
          }
        ),
        {
          duration: 4000
        }
      );
    } else {
      // Reset form for new inventory
      setInventoryForm({
        productId,
        quantity: 0,
        reorderLevel: 0,
        batchNumber: "",
        expiryDate: ""
      });
    }
  };

  // Transaction Management Functions
  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionForm.productId) {
      toast.error(t("Please select a product"));
      return;
    }

    try {
      // Calculate the correct change quantity based on type
      let actualChangeQty = Math.abs(transactionForm.changeQty);
      if (transactionForm.type === "OUT") {
        actualChangeQty = -actualChangeQty; // OUT transactions should be negative
      }
      // IN transactions stay positive

      // Use custom reason if "other" is selected
      const finalReason =
        transactionForm.reason === "other" ? transactionForm.customReason : transactionForm.reason;

      await window.api.stockTransactions.create({
        productId: transactionForm.productId,
        type: transactionForm.type,
        changeQty: actualChangeQty,
        reason: finalReason,
        relatedInvoiceId: undefined
      });

      toast.success(t("Stock transaction recorded successfully!"));

      setTransactionForm({
        productId: "",
        type: "OUT",
        changeQty: 0,
        reason: "",
        customReason: ""
      });
      setShowTransactionForm(false);
      await fetchAllData();
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error(t("Failed to record transaction"));
    }
  };

  // Stock Sync Functions
  const syncProductToInventory = async (productId: string) => {
    try {
      setLoading(true);
      const product = products.find((p) => p.id === productId);
      if (!product) {
        toast.error(t("Product not found"));
        return;
      }

      const productInventory = inventory.filter((inv) => inv.productId === productId);

      if (productInventory.length === 0) {
        // Create new inventory record with product stock level
        await window.api.inventory.create({
          productId,
          quantity: product.stockLevel,
          reorderLevel: Math.max(5, Math.floor(product.stockLevel * 0.2))
        });
        toast.success(
          t("Created inventory record for {productName} with quantity {quantity}", {
            productName: product.name,
            quantity: formatToThreeDecimalPlaces(product.stockLevel)
          })
        );
      } else {
        // Update existing inventory to match product stock level
        const inventoryItem = productInventory[0];
        await window.api.inventory.adjustStock(
          inventoryItem.id,
          product.stockLevel,
          "Synced from product stock level"
        );
        toast.success(
          t("Updated {productName} inventory to match product stock level ({quantity})", {
            productName: product.name,
            quantity: formatToThreeDecimalPlaces(product.stockLevel)
          })
        );
      }

      await fetchAllData();
    } catch (error) {
      console.error("Error syncing product to inventory:", error);
      toast.error(t("Failed to sync product to inventory"));
    } finally {
      setLoading(false);
    }
  };

  const syncInventoryToProduct = async (productId: string) => {
    try {
      setLoading(true);
      const product = products.find((p) => p.id === productId);
      const syncInfo = stockSyncData.find((s) => s.productId === productId);

      if (!product || !syncInfo) {
        toast.error(t("Product or sync info not found"));
        return;
      }

      // Use the dedicated API to sync product stock level from inventory total
      await window.api.stockSync.syncProductStockFromInventory(productId);
      toast.success(
        t("Updated {productName} stock level to match inventory total ({total})", {
          productName: product.name,
          total: syncInfo.inventoryTotal
        })
      );
      await fetchAllData();
    } catch (error) {
      console.error("Error syncing inventory to product:", error);
      toast.error(t("Failed to sync inventory to product"));
    } finally {
      setLoading(false);
    }
  };

  // Quick Adjustment Functions
  const handleQuickAdjustment = async () => {
    if (!selectedItem) return;

    try {
      let finalQuantity = selectedItem.quantity;
      const transactionReason =
        adjustmentForm.reason === "other" ? adjustmentForm.customReason : adjustmentForm.reason;

      // Calculate final quantity based on adjustment type
      if (adjustmentForm.adjustmentType === "set") {
        finalQuantity = adjustmentForm.newQuantity;
      } else if (adjustmentForm.adjustmentType === "add") {
        finalQuantity = selectedItem.quantity + adjustmentForm.changeAmount;
      } else if (adjustmentForm.adjustmentType === "subtract") {
        finalQuantity = Math.max(0, selectedItem.quantity - adjustmentForm.changeAmount);
      }

      // Update inventory (this will automatically create a stock transaction)
      await window.api.inventory.adjustStock(selectedItem.id, finalQuantity, transactionReason);

      toast.success(t("Stock adjusted successfully!"));
      setAdjustmentModalOpen(false);
      setSelectedItem(null);
      setAdjustmentForm({
        adjustmentType: "set",
        newQuantity: 0,
        changeAmount: 0,
        reason: "",
        customReason: "",
        notes: ""
      });
      await fetchAllData();
    } catch (error) {
      console.error("Error adjusting stock:", error);
      toast.error(t("Failed to adjust stock"));
    }
  };

  // Utility Functions
  const getStockStatus = (item: Inventory) => {
    if (item.quantity === 0) return "out-of-stock";
    if (item.quantity <= item.reorderLevel) return "low-stock";
    return "in-stock";
  };

  const getExpiryStatus = (item: Inventory) => {
    if (!item.expiryDate) return "no-expiry";

    const daysToExpiry = Math.ceil(
      (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysToExpiry < 0) return "expired";
    if (daysToExpiry <= 7) return "expiring-soon";
    if (daysToExpiry <= 30) return "expiring-month";
    return "fresh";
  };

  // Pagination calculations
  const totalInventoryPages = Math.ceil(inventoryTotalItems / inventoryItemsPerPage);
  const totalTransactionPages = Math.ceil(transactionsTotalItems / transactionsItemsPerPage);

  const inventoryStartIndex = (inventoryPage - 1) * inventoryItemsPerPage;
  const inventoryEndIndex = inventoryStartIndex + inventoryItemsPerPage;

  const transactionsStartIndex = (transactionsPage - 1) * transactionsItemsPerPage;
  const transactionsEndIndex = transactionsStartIndex + transactionsItemsPerPage;

  // Pagination handlers
  const handleInventoryPageChange = (page: number) => {
    setInventoryPage(page);
  };

  const handleInventoryItemsPerPageChange = (newItemsPerPage: number) => {
    setInventoryItemsPerPage(newItemsPerPage);
    setInventoryPage(1); // Reset to first page when changing items per page
  };

  const handleTransactionsPageChange = (page: number) => {
    setTransactionsPage(page);
  };

  const handleTransactionsItemsPerPageChange = (newItemsPerPage: number) => {
    setTransactionsItemsPerPage(newItemsPerPage);
    setTransactionsPage(1); // Reset to first page when changing items per page
  };

  // Invoice-style Pagination component
  const InvoicePagination = ({
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange
  }: {
    currentPage: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
  }) => {
    if (totalItems === 0) return null;

    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          {/* Items per page selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-slate-200">{t("Show:")}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700 dark:text-slate-200">{t("per page")}</span>
          </div>

          {/* Pagination info */}
          <div className="text-sm text-gray-700 dark:text-slate-200">
            {t("Showing {start} to {end} of {total} results", {
              start: startIndex + 1,
              end: Math.min(endIndex, totalItems),
              total: totalItems
            })}{" "}
          </div>

          {/* Page navigation */}
          <div className="flex items-center space-x-1">
            {/* Previous button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                currentPage === 1
                  ? "bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:bg-slate-700"
              }`}
            >
              {t("Previous")}
            </button>

            {/* Page numbers */}
            {(() => {
              const pages: number[] = [];
              const maxVisible = 5;
              let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
              const end = Math.min(totalPages, start + maxVisible - 1);

              if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1);
              }

              for (let i = start; i <= end; i++) {
                pages.push(i);
              }

              return pages.map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:bg-slate-700"
                  }`}
                >
                  {page}
                </button>
              ));
            })()}

            {/* Next button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                currentPage === totalPages
                  ? "bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:bg-slate-700"
              }`}
            >
              {t("Next")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const outOfSyncProducts = stockSyncData.filter((item) => !item.isInSync);

  return (
    <div className="p-4 lg:p-6 bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-2">
            {t("Stock Management")}
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            {t("Comprehensive stock tracking and inventory management")}
          </p>
        </div>

        {/* Main Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: t("Overview"), icon: "📊" },
                { id: "inventory", label: t("Inventory"), icon: "📦" },
                { id: "transactions", label: t("Transactions"), icon: "🔄" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id as any)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeMainTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700  hover:border-gray-300 dark:border-slate-700"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeMainTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                      {t("Total Products")}
                    </p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {products.length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-200 text-lg">📦</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 dark:text-green-300 text-sm font-medium">
                      {t("In Sync")}
                    </p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {stockSyncData.filter((item) => item.isInSync).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-200 text-lg">✅</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 dark:text-red-300 text-sm font-medium">
                      {t("Out of Sync")}
                    </p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {outOfSyncProducts.length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 dark:text-red-200 text-lg">⚠️</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 dark:text-yellow-300 text-sm font-medium">
                      {t("Low Stock Items")}
                    </p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {inventory.filter((item) => item.quantity <= item.reorderLevel).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 dark:text-yellow-200 text-lg">⚠️</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">{t("Recent Stock Transactions")}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                  <thead className="bg-gray-50 dark:bg-slate-950">
                    <tr>
                      <th className="px-6 py-3  text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                        {t("Date")}
                      </th>
                      <th className="px-6 py-3  text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                        {t("Transaction Product")}
                      </th>
                      <th className="px-6 py-3  text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                        {t("Quantity Change")}
                      </th>
                      <th className="px-6 py-3  text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                        {t("Transaction Reason")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                    {recentTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50  dark:hover:bg-slate-950 transition-colors"
                      >
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-slate-100">
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-slate-100">
                          {transaction.product?.name}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span
                            className={`${transaction.changeQty > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {transaction.changeQty > 0 ? "+" : ""}
                            {transaction.changeQty}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-slate-100">
                          {transaction.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Out of Sync Items */}
            {outOfSyncProducts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-semibold mb-2 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Stock Sync Issues Detected
                </h3>
                <p className="text-red-700 text-sm mb-3">
                  {outOfSyncProducts.length} product(s) have mismatched stock levels.
                </p>
                <div className="space-y-2">
                  {outOfSyncProducts.slice(0, 3).map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded border hover:bg-gray-50 dark:hover:bg-slate-900/60 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-slate-100">
                          {item.productName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          Product Stock: {formatToThreeDecimalPlaces(item.productStockLevel)} |
                          Inventory Total: {formatToThreeDecimalPlaces(item.inventoryTotal)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(item);
                            setShowSyncModal(true);
                          }}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => syncInventoryToProduct(item.productId)}
                          disabled={loading}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          Use Inventory
                        </button>
                        <button
                          onClick={() => syncProductToInventory(item.productId)}
                          disabled={loading}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          Use Product
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Inventory Management Tab */}
        {activeMainTab === "inventory" && (
          <div className="space-y-6">
            {/* Inventory Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  {t("Inventory Value")}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
                  Rs {inventorySummary.totalValue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {t("Updated from the latest sync")}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  {t("Total Items")}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
                  {inventorySummary.totalItems}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {t("Across all batches")}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  {t("Low Stock Items")}
                </p>
                <p className="text-2xl font-semibold text-amber-600 dark:text-amber-300">
                  {inventorySummary.lowStockCount}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {t("Items at or below reorder level")}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  {t("Expiring Soon")}
                </p>
                <p className="text-2xl font-semibold text-red-600 dark:text-red-300">
                  {inventorySummary.expiringItemsCount}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {t("Due within 30 days")}
                </p>
              </div>
              {(showLowStock || showExpiring) && (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                  <span className="font-semibold text-gray-600 dark:text-slate-300">
                    {t("Active Filters")}:
                  </span>
                  {showLowStock && (
                    <button
                      type="button"
                      onClick={() => setShowLowStock(false)}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800"
                    >
                      {t("Low Stock Only")}
                      <span aria-hidden="true">×</span>
                    </button>
                  )}
                  {showExpiring && (
                    <button
                      type="button"
                      onClick={() => setShowExpiring(false)}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800"
                    >
                      {t("Expiring Items")}
                      <span aria-hidden="true">×</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowLowStock(false);
                      setShowExpiring(false);
                    }}
                    className="px-3 py-1 rounded-full border border-gray-200 dark:border-slate-700 text-xs text-gray-600 dark:text-slate-300"
                  >
                    {t("Clear Filters")}
                  </button>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{t("Inventory")}</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {t("Showing {visible} of {total} items", {
                      visible: inventorySummary.visibleItems,
                      total: inventorySummary.totalItems
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={autoSyncStock}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                    disabled={loading}
                  >
                    🔄 {t("Auto-Fix Stock Issues")}
                  </button>
                  <button
                    onClick={() => setShowInventoryForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {t("Add New Inventory")}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("Search products, SKU, or scan QR...")}
                    className="w-full p-2 pr-10 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setScannerEnabled(!scannerEnabled)}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded ${
                      scannerEnabled
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:bg-slate-800"
                    }`}
                    title={scannerEnabled ? t("Scanner Enabled") : t("Scanner Disabled")}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showLowStock}
                      onChange={(e) => setShowLowStock(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-200">
                      {t("Low Stock Only")}
                    </span>
                  </label>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showExpiring}
                      onChange={(e) => setShowExpiring(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-200">
                      {t("Expiring Items")}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-slate-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {t("Inventory Items")}({inventoryTotalItems})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                  <thead className="bg-gray-50 dark:bg-slate-950">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("Product Name")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("Current Stock")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("Status")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("Total Value")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("Batch/Expiry")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("Actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                    {inventoryPageItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 text-center text-gray-500 dark:text-slate-400"
                        >
                          {t("No inventory items found")}
                        </td>
                      </tr>
                    ) : (
                      inventoryPageItems.map((item) => {
                        const stockStatus = getStockStatus(item);
                        const expiryStatus = getExpiryStatus(item);

                        return (
                          <tr key={item.id} className="hover:bg-gray-50  dark:hover:bg-slate-950">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                  {item.product?.name}
                                </div>
                                {item.product?.sku && (
                                  <div className="text-sm text-gray-500 dark:text-slate-400">
                                    SKU: {item.product.sku}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                {formatToThreeDecimalPlaces(item.quantity)}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-slate-400">
                                Reorder: {item.reorderLevel}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    stockStatus === "out-of-stock"
                                      ? "bg-red-100 text-red-800"
                                      : stockStatus === "low-stock"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {stockStatus === t("out-of-stock")
                                    ? t("Out of Stock")
                                    : stockStatus === t("low-stock")
                                      ? t("Low Stock")
                                      : t("In Stock")}
                                </span>
                                {expiryStatus !== "no-expiry" && (
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      expiryStatus === "expired"
                                        ? "bg-red-100 text-red-800"
                                        : expiryStatus === "expiring-soon"
                                          ? "bg-orange-100 text-orange-800"
                                          : expiryStatus === "expiring-month"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {expiryStatus === t("expired")
                                      ? t("Expired")
                                      : expiryStatus === t("expiring-soon")
                                        ? t("Expiring Soon")
                                        : expiryStatus === t("expiring-month")
                                          ? t("Expiring This Month")
                                          : t("Fresh")}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">
                              Rs {((item.product?.price || 0) * item.quantity).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">
                              <div>
                                {item.batchNumber && (
                                  <div className="text-xs text-gray-600 dark:text-slate-400">
                                    {t("Batch")}: {item.batchNumber}
                                  </div>
                                )}
                                {item.expiryDate && (
                                  <div className="text-xs text-gray-600 dark:text-slate-400">
                                    {t("Exp")}: {new Date(item.expiryDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setAdjustmentForm({
                                    adjustmentType: "set",
                                    newQuantity: item.quantity,
                                    changeAmount: 0,
                                    reason: "",
                                    customReason: "",
                                    notes: ""
                                  });
                                  setAdjustmentModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                {t("Adjust")}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <InvoicePagination
                currentPage={inventoryPage}
                totalPages={totalInventoryPages}
                startIndex={inventoryStartIndex}
                endIndex={inventoryEndIndex}
                totalItems={inventoryTotalItems}
                itemsPerPage={inventoryItemsPerPage}
                onPageChange={handleInventoryPageChange}
                onItemsPerPageChange={handleInventoryItemsPerPageChange}
              />
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeMainTab === "transactions" && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t("Stock Transactions")}</h3>
                <button
                  onClick={() => setShowTransactionForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {t("Add Transaction")}
                </button>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-slate-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {t("Transaction History")} ({transactionsTotalItems})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                  <thead className="bg-gray-50 dark:bg-slate-950">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("Date")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("Product")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("Type")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("Change")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("Reason")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("Invoice ID")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                    {transactionsPageItems.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50  dark:hover:bg-slate-950"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            {new Date(transaction.transactionDate).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {transaction.product?.name}
                            
                          </div>
                          {transaction.product?.sku && (
                            <div className="text-sm text-gray-500 dark:text-slate-400">
                              SKU: {transaction.product.sku}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.type === "IN"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-medium ${
                              transaction.changeQty > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.changeQty > 0 ? "+" : ""}
                            {transaction.changeQty}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100">
                          {transaction.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                          {transaction.relatedInvoiceId || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <InvoicePagination
                currentPage={transactionsPage}
                totalPages={totalTransactionPages}
                startIndex={transactionsStartIndex}
                endIndex={transactionsEndIndex}
                totalItems={transactionsTotalItems}
                itemsPerPage={transactionsItemsPerPage}
                onPageChange={handleTransactionsPageChange}
                onItemsPerPageChange={handleTransactionsItemsPerPageChange}
              />
            </div>
          </div>
        )}

        {/* Inventory Form Modal */}
        {showInventoryForm && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {inventoryForm.productId &&
                inventory.find((item) => item.productId === inventoryForm.productId)
                  ? t("Update Inventory")
                  : t("Add New Inventory")}
              </h3>
              <form onSubmit={handleInventorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                    {t("Product")}
                  </label>
                  <SearchableDropdown
                    options={products}
                    value={inventoryForm.productId}
                    onChange={handleInventoryProductChange}
                    placeholder={t("Search and select a product...")}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                    {t("Quantity")}
                  </label>
                  <input
                    type="number"
                    value={inventoryForm.quantity}
                    step="1"
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setInventoryForm({
                        ...inventoryForm,
                        quantity: Number.isNaN(value) ? 0 : Math.max(0, value)
                      });
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                    {t("Reorder Level")}
                  </label>
                  <input
                    type="number"
                    value={inventoryForm.reorderLevel}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      setInventoryForm({
                        ...inventoryForm,
                        reorderLevel: Number.isNaN(value) ? 0 : Math.max(0, value)
                      });
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                    {t("Batch Number")}
                  </label>
                  <input
                    type="text"
                    value={inventoryForm.batchNumber}
                    onChange={(e) =>
                      setInventoryForm({ ...inventoryForm, batchNumber: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                    {t("Expiry Date")}
                  </label>
                  <input
                    type="date"
                    value={inventoryForm.expiryDate}
                    onChange={(e) =>
                      setInventoryForm({ ...inventoryForm, expiryDate: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {inventoryForm.productId &&
                    inventory.find((item) => item.productId === inventoryForm.productId)
                      ? t("Update")
                      : t("Create")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInventoryForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-800 rounded-md hover:bg-gray-400 dark:hover:bg-slate-600 transition-colors disabled:bg-gray-200 dark:disabled:bg-slate-900"
                  >
                    {t("Cancel")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction Form Modal */}
        {showTransactionForm && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">{t("Add Stock Transaction")}</h3>
              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                    {t("Product")}
                  </label>
                  <SearchableDropdown
                    options={products}
                    value={transactionForm.productId}
                    onChange={(value) =>
                      setTransactionForm({ ...transactionForm, productId: value })
                    }
                    placeholder={t("Search and select a product...")}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                    {t("Transaction Type")}
                  </label>
                  <select
                    value={transactionForm.type}
                    onChange={(e) =>
                      setTransactionForm({ ...transactionForm, type: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="IN">{t("IN - Stock Increase")}</option>
                    <option value="OUT">{t("OUT - Stock Decrease")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                    {t("Quantity Amount")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={transactionForm.changeQty}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setTransactionForm({
                        ...transactionForm,
                        changeQty: Number.isNaN(value) ? 0 : Math.abs(value)
                      });
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder={t("Enter positive quantity amount")}
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                    {t("Reason")}
                  </label>
                  <select
                    value={transactionForm.reason}
                    onChange={(e) =>
                      setTransactionForm({ ...transactionForm, reason: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">{t("Select a reason")}</option>
                    <option value="Stock Count Correction">{t("Stock Count Correction")}</option>
                    <option value="Damaged Goods">{t("Damaged Goods")}</option>
                    <option value="Expired Items">{t("Expired Items")}</option>
                    <option value="Theft/Loss">{t("Theft/Loss")}</option>
                    <option value="Inventory Reconciliation">{t("Inventory Reconciliation")}</option>
                    <option value="Return to Supplier">{t("Return to Supplier")}</option>
                    <option value="New Stock Delivery">{t("New Stock Delivery")}</option>
                    <option value="Transfer Between Locations">
                      {t("Transfer Between Locations")}
                    </option>
                    <option value="Promotional Giveaway">{t("Promotional Giveaway")}</option>
                    <option value="Quality Control">{t("Quality Control")}</option>
                    <option value="other">{t("Other (specify)")}</option>
                  </select>
                </div>

                {/* Custom reason input - only shown when "other" is selected */}
                {transactionForm.reason === "other" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                      {t("Custom Reason")}
                    </label>
                    <input
                      type="text"
                      value={transactionForm.customReason}
                      onChange={(e) =>
                        setTransactionForm({ ...transactionForm, customReason: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder={t("Enter custom reason")}
                      required
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {t("Create Transaction")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTransactionForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-800 rounded-md hover:bg-gray-400 dark:hover:bg-slate-600 transition-colors disabled:bg-gray-200 dark:disabled:bg-slate-900"
                  >
                    {t("Cancel")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Quick Adjustment Modal */}
        {adjustmentModalOpen && selectedItem && adjustmentSummary && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-3xl">
              <h3 className="text-lg font-semibold mb-4">
                {t("Adjust Stock: {productName}", {
                  productName: selectedItem.product?.name || "Unknown Product"
                })}
              </h3>
              <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                <div className="space-y-5">
                  {/* Current Stock Info */}
                  <div className="bg-gray-50 dark:bg-slate-950 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400">
                          {t("Current Stock Level")}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                          {selectedItem.quantity} {t("units")}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        {t("Reorder")}: {selectedItem.reorderLevel}
                      </span>
                    </div>
                  </div>

                  {/* Adjustment Type Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                      {t("Adjustment Type")}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "set", label: t("Set Exact"), icon: "🎯" },
                        { value: "add", label: t("Add Stock"), icon: "➕" },
                        { value: "subtract", label: t("Remove Stock"), icon: "➖" }
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setAdjustmentForm({ ...adjustmentForm, adjustmentType: type.value })
                          }
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            adjustmentForm.adjustmentType === type.value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 dark:border-slate-700 hover:border-gray-400"
                          }`}
                        >
                          <div className="text-lg">{type.icon}</div>
                          <div className="text-xs font-medium">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                      {adjustmentForm.adjustmentType === "set"
                        ? t("New Quantity")
                        : adjustmentForm.adjustmentType === "add"
                        ? t("Amount to Add")
                        : t("Amount to Remove")}
                    </label>
                    <input
                      type="number"
                      value={
                        adjustmentForm.adjustmentType === "set"
                          ? formatToThreeDecimalPlaces(adjustmentForm.newQuantity)
                          : adjustmentForm.changeAmount
                      }
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (adjustmentForm.adjustmentType === "set") {
                          setAdjustmentForm({
                            ...adjustmentForm,
                            newQuantity: Number.isNaN(value) ? 0 : Math.max(0, value)
                          });
                        } else {
                          setAdjustmentForm({
                            ...adjustmentForm,
                            changeAmount: Number.isNaN(value) ? 0 : Math.max(0, value)
                          });
                        }
                      }}
                      className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      placeholder={
                        adjustmentForm.adjustmentType === "set"
                          ? t("Enter exact quantity")
                          : adjustmentForm.adjustmentType === "add"
                          ? t("Enter amount to add")
                          : t("Enter amount to remove")
                      }
                    />
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {t("Change:")}{" "}
                      {(adjustmentSummary.delta >= 0 ? "+" : "") +
                        adjustmentSummary.delta.toFixed(2)}
                    </p>
                  </div>

                  {/* Reason Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                      {t("Reason")}
                    </label>
                    <select
                      value={adjustmentForm.reason}
                      onChange={(e) =>
                        setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">{t("Select a reason")}</option>
                      <option value="Stock Count Correction">
                        {t("Stock Count Correction")}
                      </option>
                      <option value="Damaged Goods">{t("Damaged Goods")}</option>
                      <option value="Expired Items">{t("Expired Items")}</option>
                      <option value="Theft/Loss">{t("Theft/Loss")}</option>
                      <option value="Inventory Reconciliation">{t("Inventory Reconciliation")}</option>
                      <option value="Return from Customer">{t("Return from Customer")}</option>
                      <option value="Supplier Return">{t("Supplier Return")}</option>
                      <option value="Manufacturing Adjustment">
                        {t("Manufacturing Adjustment")}
                      </option>
                      <option value="Transfer Adjustment">{t("Transfer Adjustment")}</option>
                      <option value="other">{t("Other (Custom)")}</option>
                    </select>
                  </div>

                  {/* Custom Reason Input */}
                  {adjustmentForm.reason === "other" && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                        {t("Custom Reason")}
                      </label>
                      <input
                        type="text"
                        value={adjustmentForm.customReason}
                        onChange={(e) =>
                          setAdjustmentForm({ ...adjustmentForm, customReason: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder={t("Enter custom reason")}
                        required
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                      {t("Notes (Optional)")}
                    </label>
                    <textarea
                      value={adjustmentForm.notes}
                      onChange={(e) =>
                        setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder={t("Additional notes about this adjustment")}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Adjustment Preview */}
                  <div className="rounded-2xl border border-transparent bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-5 shadow-lg">
                    <p className="text-xs uppercase tracking-widest text-blue-200">
                      {t("Adjustment Preview")}
                    </p>
                    <div className="flex items-end justify-between mt-3">
                      <p className="text-sm text-blue-100">{t("Projected Quantity")}</p>
                      <p className="text-2xl font-semibold">
                        {adjustmentSummary.targetQuantity.toFixed(2)} {t("units")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm">{t("Change")}</span>
                      <span
                        className={`text-sm font-semibold ${
                          adjustmentSummary.delta > 0
                            ? "text-emerald-200"
                            : adjustmentSummary.delta < 0
                            ? "text-rose-200"
                            : "text-blue-100"
                        }`}
                      >
                        {(adjustmentSummary.delta >= 0 ? "+" : "") +
                          adjustmentSummary.delta.toFixed(2)}{" "}
                        {t("units")}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-wide text-blue-100">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          adjustmentSummary.trend === "up"
                            ? "bg-emerald-200"
                            : adjustmentSummary.trend === "down"
                            ? "bg-rose-200"
                            : "bg-blue-200"
                        }`}
                      />
                      <span>
                        {adjustmentSummary.trend === "up"
                          ? t("Increasing stock")
                          : adjustmentSummary.trend === "down"
                          ? t("Reducing stock")
                          : t("No change")}
                      </span>
                    </div>
                  </div>

                  {/* Reason & Notes Summary */}
                  <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 space-y-2">
                    <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-slate-400">
                      {t("Reason Summary")}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-slate-100">
                      {adjustmentSummary.reasonLabel || t("Select a reason to proceed")}
                    </p>
                    {adjustmentForm.notes && (
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {adjustmentForm.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {/* Action Buttons */}
                <button
                  onClick={handleQuickAdjustment}
                  disabled={
                    !adjustmentForm.reason ||
                    (adjustmentForm.reason === "other" && !adjustmentForm.customReason) ||
                    (adjustmentForm.adjustmentType === "set" && adjustmentForm.newQuantity < 0) ||
                    (adjustmentForm.adjustmentType !== "set" && adjustmentForm.changeAmount <= 0)
                  }
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {t("Apply Adjustment")}
                </button>
                <button
                  onClick={() => {
                    setAdjustmentModalOpen(false);
                    setSelectedItem(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-800 rounded-md hover:bg-gray-400 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                  {t("Cancel")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sync Modal */}
        {showSyncModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                  {t("Stock Sync Details")}
                </h3>
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-slate-400"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Product Info */}
                <div className="bg-gray-50 dark:bg-slate-950 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">
                    {selectedProduct.productName}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-slate-400">
                        Product Stock Level:
                      </span>
                      <span className="ml-2 font-medium">
                        {formatToThreeDecimalPlaces(selectedProduct.productStockLevel)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-slate-400">Inventory Total:</span>
                      <span className="ml-2 font-medium">
                        {formatToThreeDecimalPlaces(selectedProduct.inventoryTotal)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600 dark:text-slate-400">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedProduct.isInSync
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedProduct.isInSync ? "In Sync" : "Out of Sync"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inventory Summary */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">
                    {t("Inventory Summary")}
                  </h4>
                  <div className="bg-gray-50 dark:bg-slate-950 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-slate-400">Total Inventory:</span>
                      <span className="text-lg font-semibold text-blue-600">
                        {selectedProduct.inventoryTotal} units
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sync Actions */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">
                    {t("Sync Actions")}
                  </h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        syncInventoryToProduct(selectedProduct.productId);
                        setShowSyncModal(false);
                      }}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-left"
                    >
                      <div>
                        <p className="font-medium">
                          {t("Update Product Stock to Match Inventory")}
                        </p>
                        <p className="text-sm text-blue-100">
                          {t("Set product stock level to {total}", {
                            total: selectedProduct.inventoryTotal
                          })}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        syncProductToInventory(selectedProduct.productId);
                        setShowSyncModal(false);
                      }}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 text-left"
                    >
                      <div>
                        <p className="font-medium">
                          {t("Update Inventory to Match Product Stock")}
                        </p>
                        <p className="text-sm text-green-100">
                          {t("Set inventory total to {stock}", {
                            stock: formatToThreeDecimalPlaces(selectedProduct.productStockLevel)
                          })}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedStockManagement;
