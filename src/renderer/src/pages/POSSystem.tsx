import React, { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import { useTranslation } from "../contexts/LanguageContext";
import { formatToThreeDecimalPlaces } from "../lib/quantityValidation";
import ScannerStatus from "../components/pos/ScannerStatus";
import ProductSearchAndFilter from "../components/pos/ProductSearchAndFilter";
import CategoryFilter from "../components/pos/CategoryFilter";
import ProductGrid from "../components/pos/ProductGrid";
import Cart from "../components/pos/Cart";
import CheckoutPanel from "../components/pos/CheckoutPanel";
import KeyboardShortcutsModal from "../components/pos/modal/KeyboardShortcutsModal";
import ProductSelectionModal from "../components/pos/modal/ProductSelectionModal";
import CustomerModal from "../components/pos/modal/CustomerModal";

interface Product {
  id: string;
  sku?: string;
  barcode?: string;
  name: string;
  englishName?: string;
  description?: string;
  brand?: string;
  categoryId: string;
  price: number;
  discountedPrice?: number;
  wholesale?: number;
  costPrice?: number;
  taxInclusivePrice?: number;
  taxRate?: number;
  unitSize?: string;
  unit?: string;
  stockLevel: number;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  category?: Category;
  images?: unknown[];
  productTags?: unknown[];
}

interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CartItem extends Product {
  quantity: number;
  total: number;
  discount: {
    type: "percentage" | "amount";
    value: number;
  };
  salePrice?: number;
  originalTotal: number;
  // Simplified quantity handling
  customQuantity?: number;
  originalPrice: number;
}

const POSSystem: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser: user } = useCurrentUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentTotal, setCurrentTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [bulkDiscountType, setBulkDiscountType] = useState<"percentage" | "amount">("percentage");
  const [bulkDiscountValue, setBulkDiscountValue] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [totalDiscountAmount, setTotalDiscountAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<"cash" | "card" | "credit" | "wholesale">("cash");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1);
  const [selectedCartItemIndex] = useState(-1);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showProductSelectionModal, setShowProductSelectionModal] = useState(false);
  const [productSelectionOptions, setProductSelectionOptions] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState({
    name: "Zentra",
    address: "123 Main Street, City, Country",
    phone: "+1-234-567-8900",
    email: "info@zentra.com"
  });

  const [printerSettings, setPrinterSettings] = useState({
    selectedPrinter: "",
    printCopies: 1,
    silentPrint: true, // Enable auto-printing by default
    printPreview: false // Disable print preview by default
  });

  // Customer management state
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  // Partial payment state
  const [partialPaymentAmount, setPartialPaymentAmount] = useState("");
  const [isPartialPayment, setIsPartialPayment] = useState(false);

  // Enhanced scanner state
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [scannerStatus, setScannerStatus] = useState<"idle" | "scanning" | "connected">("idle");
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const loadPrinterSettings = useCallback(async (): Promise<void> => {
    try {
      const dbSettings = await window.api.settings.findMany();
      const printerSettingsObj: Record<string, string | number | boolean> = { ...printerSettings };

      dbSettings.forEach((setting) => {
        if (setting.category === "printer") {
          if (setting.type === "boolean") {
            printerSettingsObj[setting.key] = setting.value === "true";
          } else if (setting.type === "number") {
            printerSettingsObj[setting.key] = parseInt(setting.value);
          } else {
            printerSettingsObj[setting.key] = setting.value;
          }
        }
      });

      setPrinterSettings(printerSettingsObj as typeof printerSettings);
    } catch (error) {
      console.error("Error loading printer settings:", error);
    }
  }, [printerSettings]);

  const loadStoreInfo = useCallback(async (): Promise<void> => {
    try {
      const dbSettings = await window.api.settings.findMany();
      const storeInfoObj = { ...storeInfo };

      dbSettings.forEach((setting) => {
        if (setting.category === "general") {
          switch (setting.key) {
            case "companyName":
              storeInfoObj.name = setting.value || storeInfoObj.name;
              break;
            case "companyAddress":
              storeInfoObj.address = setting.value || storeInfoObj.address;
              break;
            case "companyPhone":
              storeInfoObj.phone = setting.value || storeInfoObj.phone;
              break;
            case "companyEmail":
              storeInfoObj.email = setting.value || storeInfoObj.email;
              break;
          }
        }
      });

      setStoreInfo(storeInfoObj);
    } catch (error) {
      console.error("Error loading store info:", error);
    }
  }, [storeInfo]);

  const loadScannerDevices = useCallback(async (): Promise<void> => {
    try {
      const devices = await window.api.scanner.getDevices();

      if (devices.length > 0) {
        setScannerStatus("connected");
        toast.success(t("pos.toast.scannerFound", { count: devices.length }));
      } else {
        setScannerStatus("idle");
      }
    } catch (error) {
      console.error("Error loading scanner devices:", error);
      setScannerStatus("idle");
      toast.error(t("pos.toast.scannerLoadError"));
    }
  }, [t]);

  const loadScannerSettings = useCallback(async (): Promise<void> => {
    try {
      const dbSettings = await window.api.settings.findMany();
      let enabled = true; // Default to enabled

      dbSettings.forEach((setting) => {
        if (setting.category === "scanner") {
          if (setting.key === "scannerEnabled") {
            enabled = setting.value === "true";
          }
        }
      });

      setScannerEnabled(enabled);

      if (enabled) {
        await loadScannerDevices();
      }
    } catch (error) {
      console.error("Error loading scanner settings:", error);
      // If there's an error loading settings, enable scanner by default
      setScannerEnabled(true);
      await loadScannerDevices();
    }
  }, [loadScannerDevices]);

  const handleScannedData = useCallback(
    (data: { data?: string }) => {
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

      // More aggressive validation - skip obvious keyboard input patterns
      if (!scannedCode || scannedCode.length < 3) {
        return;
      }

      // Skip single characters
      if (scannedCode.length === 1) {
        return;
      }

      // Skip if it contains only numbers and is very short (likely typing numbers)
      if (/^\d+$/.test(scannedCode) && scannedCode.length < 6) {
        return;
      }

      // Skip if it looks like random keyboard input (contains common typing patterns)
      if (/^[a-zA-Z]{3,}$/.test(scannedCode) && scannedCode.length < 8) {
        return;
      }

      // Skip if it contains spaces or special characters that are common in typing but rare in barcodes
      if (/[\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>?/]/.test(scannedCode)) {
        return;
      }

      setLastScanTime(currentTime);
      setScanHistory((prev) => [scannedCode, ...prev.slice(0, 9)]);

      // Find all products with matching barcode or SKU
      const foundProducts = products.filter(
        (product) => product.barcode === scannedCode || product.sku === scannedCode
      );

      if (foundProducts.length > 0) {
        if (foundProducts.length > 1) {
          setProductSelectionOptions(foundProducts);
          setShowProductSelectionModal(true);
          return;
        }

        const foundProduct = foundProducts[0];

        if (foundProduct.stockLevel <= 0) {
          toast.error(t("pos.toast.outOfStock", { name: foundProduct.name }), {
            duration: 3000,
            position: "top-center"
          });
          return;
        }

        // Check if product is already in cart
        const existingItem = cartItems.find((item) => item.id === foundProduct.id);
        const isUpdatingQuantity = !!existingItem;

        // For existing items, check if adding one more would exceed stock
        if (isUpdatingQuantity) {
          const newQuantity = existingItem.quantity + 1;
          if (newQuantity > foundProduct.stockLevel) {
            toast.error(
              t("pos.toast.insufficientStock", {
                name: foundProduct.name,
                available: formatToThreeDecimalPlaces(foundProduct.stockLevel)
              }),
              {
                duration: 3000,
                position: "top-center"
              }
            );
            return;
          }
        }

        addToCartRef.current(foundProduct);

        if (isUpdatingQuantity) {
          const newQuantity = existingItem.quantity + 1;
          toast.success(
            t("pos.toast.updatedQuantity", { name: foundProduct.name, quantity: newQuantity }),
            {
              duration: 2000,
              position: "top-center"
            }
          );
        } else {
          toast.success(t("pos.toast.addedToCart", { name: foundProduct.name }), {
            duration: 2000,
            position: "top-center"
          });
        }
      } else {
        // Try fallback search by name
        const fallbackProducts = products.filter((product) =>
          product.name.toLowerCase().includes(scannedCode.toLowerCase())
        );

        if (fallbackProducts.length > 0) {
          if (fallbackProducts.length > 1) {
            setProductSelectionOptions(fallbackProducts);
            setShowProductSelectionModal(true);
            return;
          }

          // Single fallback product found
          const foundProduct = fallbackProducts[0];

          if (foundProduct.stockLevel <= 0) {
            toast.error(t("pos.toast.outOfStock", { name: foundProduct.name }), {
              duration: 3000,
              position: "top-center"
            });
            return;
          }

          addToCartRef.current(foundProduct);
          toast.success(t("pos.toast.addedToCart", { name: foundProduct.name }), {
            duration: 2000,
            position: "top-center"
          });
        } else {
          console.log("Product not found for code:", scannedCode);
          toast.error(t("pos.toast.productNotFound", { code: scannedCode }), {
            duration: 3000,
            position: "top-center"
          });

          // Try to search for similar products
          const similarProducts = products.filter(
            (product) =>
              product.name.toLowerCase().includes(scannedCode.toLowerCase()) ||
              product.description?.toLowerCase().includes(scannedCode.toLowerCase()) ||
              product.brand?.toLowerCase().includes(scannedCode.toLowerCase())
          );

          if (similarProducts.length > 0) {
            toast.success(t("pos.toast.similarProducts", { count: similarProducts.length }));
            // Only set search term if user hasn't typed anything recently
            if (!searchTerm.trim()) {
              setSearchTerm(scannedCode);
            }
          }
        }
      }
    },
    [products, cartItems, searchTerm, isInputFocused, lastScanTime, t]
  );

  const applyBulkDiscount = useCallback((): void => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discountAmount = 0;

    if (bulkDiscountType === "percentage") {
      discountAmount = (subtotal * bulkDiscountValue) / 100;
    } else {
      discountAmount = bulkDiscountValue;
    }

    setTotalDiscountAmount(Math.min(discountAmount, subtotal));
    setBulkDiscountValue(0);
  }, [bulkDiscountType, bulkDiscountValue, cartItems]);

  const clearAllDiscounts = (): void => {
    setTotalDiscountAmount(0);
  };

  // Customer management functions
  const handleAddCustomer = async (): Promise<void> => {
    if (!customerFormData.name.trim()) {
      toast.error(t("pos.toast.customerNameRequired"));
      return;
    }

    setIsAddingCustomer(true);
    try {
      const newCustomer = await window.api.customers.create(customerFormData);
      setCustomers((prev) => [...prev, newCustomer]);
      setSelectedCustomer(newCustomer.id);
      setShowCustomerModal(false);
      setCustomerFormData({ name: "", phone: "", email: "", address: "" });
      toast.success(t("pos.toast.customerAdded"));
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error(t("pos.toast.customerAddFailed"));
    } finally {
      setIsAddingCustomer(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCustomers();
    loadPrinterSettings();
    loadStoreInfo();
    loadScannerSettings();
  }, []); // Intentionally empty dependency array to run only on mount

  // Enhanced scanner event listeners
  useEffect(() => {
    if (!scannerEnabled) {
      console.log("Scanner disabled, removing listeners");
      window.api?.scanner?.removeAllListeners?.();
      return;
    }

    console.log("Setting up scanner event listeners");

    // Remove existing listeners first
    window.api?.scanner?.removeAllListeners?.();

    // Scanner data handler
    const handleData = (data: { data?: string }): void => {
      console.log("Scanner data event:", data);
      handleScannedData(data);
    };

    // Set up listeners
    if (window.api?.scanner) {
      window.api.scanner.onData(handleData);
    } else {
      console.error("Scanner API not available");
    }

    return () => {
      console.log("Cleaning up scanner listeners");
      window.api?.scanner?.removeAllListeners?.();
    };
  }, [scannerEnabled, handleScannedData]);

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

    // Also prevent scanner from processing keyboard events when input is focused
    const handleKeyDown = (): void => {
      if (isInputFocused) {
        // Don't prevent the key event, just log that we're ignoring scanner input
        console.log("Keyboard input detected while input focused - scanner should ignore");
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isInputFocused]);

  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const finalTotal = subtotal - totalDiscountAmount;
    setCurrentTotal(Math.max(0, finalTotal));
  }, [cartItems, totalDiscountAmount]);

  useEffect(() => {
    setCartItems((prevItems) => {
      let hasChanges = false;

      const updatedItems = prevItems.map((item) => {
        const salePrice =
          item.salePrice ??
          (item.discountedPrice && item.discountedPrice > 0 ? item.discountedPrice : undefined);
        const originalUnitPrice = item.originalPrice ?? item.price;
        const effectivePrice =
          paymentMode === "credit" || !salePrice ? originalUnitPrice : salePrice;

        if (item.price === effectivePrice) {
          return item;
        }

        hasChanges = true;
        const quantity = item.customQuantity ?? item.quantity;
        const updatedTotal = quantity * effectivePrice;

        return {
          ...item,
          price: effectivePrice,
          total: updatedTotal,
          originalTotal: updatedTotal
        };
      });

      return hasChanges ? updatedItems : prevItems;
    });

    if (paymentMode !== "cash") {
      setReceivedAmount("");
    }
  }, [paymentMode]);

  // Calculate original subtotal for display
  const originalSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await window.api.products.findMany();
      setProducts(data);
      // Removed success toast as requested
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(t("pos.toast.productsLoadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (): Promise<void> => {
    try {
      const data = await window.api.categories.findMany();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(t("pos.toast.categoriesLoadFailed"));
    }
  };

  const fetchCustomers = async (): Promise<void> => {
    try {
      const data = await window.api.customers.findMany();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      // Don't show error toast for customers as it's optional
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === "all" || product.categoryId === selectedCategory) &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.englishName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = useCallback(
    (product: Product): void => {
      const existingItem = cartItems.find((item) => item.id === product.id);
      const currentCartQuantity = existingItem ? existingItem.quantity : 0;
      const requestedQuantity = currentCartQuantity + 1;

      if (product.stockLevel <= 0) {
        toast.error(t("pos.toast.outOfStock", { name: product.name }), {
          duration: 3000,
          position: "top-center"
        });
        return;
      }

      if (requestedQuantity > product.stockLevel) {
        toast.error(
          t("pos.toast.insufficientStock", {
            name: product.name,
            available: formatToThreeDecimalPlaces(product.stockLevel)
          }),
          {
            duration: 3000,
            position: "top-center"
          }
        );
        return;
      }

      // Determine which unit price to apply based on payment mode
      let derivedSalePrice: number | undefined;

      if (paymentMode === "wholesale") {
        // Wholesale mode: Use wholesale price -> discount price -> regular price
        if (product.wholesale && product.wholesale > 0) {
          derivedSalePrice = product.wholesale;
        } else if (product.discountedPrice && product.discountedPrice > 0) {
          derivedSalePrice = product.discountedPrice;
        } else {
          derivedSalePrice = undefined; // Will use regular price
        }
      } else {
        // Regular mode: Use discount price if available
        derivedSalePrice =
          product.discountedPrice && product.discountedPrice > 0
            ? product.discountedPrice
            : undefined;
      }

      const preservedSalePrice = existingItem?.salePrice ?? derivedSalePrice;

      const effectivePrice =
        paymentMode === "credit" || !preservedSalePrice ? product.price : preservedSalePrice;

      const originalPrice = product.price;

      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        setCartItems(
          cartItems.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: newQuantity,
                  price: effectivePrice,
                  salePrice: preservedSalePrice,
                  costPrice: item.costPrice ?? product.costPrice ?? 0,
                  total: newQuantity * effectivePrice,
                  originalTotal: newQuantity * effectivePrice,
                  originalPrice: originalPrice,
                  customQuantity: newQuantity
                }
              : item
          )
        );
      } else {
        const total = effectivePrice;
        setCartItems([
          ...cartItems,
          {
            ...product,
            quantity: 1,
            total: total,
            discount: { type: "amount", value: 0 },
            originalTotal: total,
            price: effectivePrice, // Override price with effective price for cart calculations
            salePrice: preservedSalePrice,
            costPrice: product.costPrice ?? 0,
            originalPrice: originalPrice,
            customQuantity: 1
          }
        ]);
      }
    },
    [cartItems, paymentMode, t]
  );

  const removeFromCart = useCallback(
    (productId: string): void => {
      const item = cartItems.find((item) => item.id === productId);
      if (item) {
        // Remove the entire item from cart regardless of quantity
        setCartItems(cartItems.filter((item) => item.id !== productId));
        toast.success(t("pos.toast.itemRemoved", { name: item.name }));
      }
    },
    [cartItems, t]
  );

  const clearCart = useCallback((): void => {
    if (cartItems.length > 0) {
      setCartItems([]);
      toast.success(t("pos.toast.cartCleared"));
    }
  }, [cartItems, t]);

  const printReceipt = useCallback(
    async (receivedAmount: number, invoiceNumber?: string): Promise<void> => {
      try {
        const receiptData = {
          header: storeInfo.name,
          storeName: storeInfo.name,
          storeAddress: storeInfo.address,
          storePhone: storeInfo.phone,
          invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          items: cartItems.map((item) => ({
            name: item.name.length > 20 ? item.name.substring(0, 17) + "..." : item.name,
            quantity: item.customQuantity || item.quantity,
            unit: item.unit || item.unitSize || "pc",
            price: item.price,
            total: item.price * (item.customQuantity || item.quantity),
            originalPrice: item.originalPrice
          })),
          subtotal: originalSubtotal,
          tax: 0,
          discount: totalDiscountAmount,
          total: currentTotal,
          paymentMethod: paymentMode.charAt(0).toUpperCase() + paymentMode.slice(1),
          change: paymentMode === "cash" ? receivedAmount - currentTotal : undefined,
          amountReceived: paymentMode === "cash" ? receivedAmount : undefined,
          footer: `${user?.name || "N/A"}`
        };

        // Print configuration from settings
        const printConfig = {
          width: 300,
          height: 600,
          margin: "0 0 0 0",
          copies: printerSettings.printCopies,
          preview: printerSettings.printPreview,
          silent: printerSettings.silentPrint
        };

        // Print the receipt using the advanced printer service with settings
        const result = await window.api.printer.printReceipt(
          receiptData,
          printerSettings.selectedPrinter || undefined,
          printConfig
        );

        if (result.success) {
          toast.success(t("pos.toast.receiptPrinted"));
        } else {
          toast.error(t("pos.toast.printFailed", { error: result.error || t("Unknown error") }));
        }
      } catch (error) {
        console.error("Error printing receipt:", error);
        toast.error(t("pos.toast.printError"));
      }
    },
    [
      storeInfo,
      cartItems,
      originalSubtotal,
      totalDiscountAmount,
      currentTotal,
      paymentMode,
      user,
      printerSettings,
      t
    ]
  );
  const processPayment = useCallback(async (): Promise<void> => {
    if (cartItems.length === 0) {
      toast.error(t("pos.toast.cartEmpty"));
      return;
    }

    const totalAmount = currentTotal;
    let received: number;

    if (paymentMode === "cash") {
      received = parseFloat(receivedAmount);

      if (!receivedAmount || isNaN(received)) {
        toast.error(t("pos.toast.enterAmountReceived"));
        return;
      }

      if (received < totalAmount) {
        toast.error(
          t("pos.toast.insufficientPayment", { amount: (totalAmount - received).toFixed(2) })
        );
        return;
      }
    } else if (paymentMode === "credit") {
      // Credit payments require a customer to be selected
      if (!selectedCustomer) {
        toast.error(t("pos.toast.selectCustomer"));
        return;
      }

      // For partial payments, validate the amount
      if (isPartialPayment) {
        const partialAmount = parseFloat(partialPaymentAmount);
        if (!partialPaymentAmount || isNaN(partialAmount) || partialAmount <= 0) {
          toast.error(t("pos.toast.invalidPartialAmount"));
          return;
        }
        if (partialAmount >= totalAmount) {
          toast.error(t("pos.toast.partialLessThanTotal"));
          return;
        }
        received = partialAmount;
      } else {
        received = 0; // Full credit payment will be handled later
      }
    } else {
      received = totalAmount;
    }

    // Ensure we have a logged-in user for the sale
    if (!user?.id) {
      toast.error(t("pos.toast.noEmployee"));
      return;
    }

    try {
      // Create sales invoice data
      const salesInvoiceData = {
        customerId: selectedCustomer || undefined,
        employeeId: user.id,
        subTotal: originalSubtotal,
        totalAmount: totalAmount,
        paymentMode: paymentMode,
        taxAmount: 0,
        discountAmount: totalDiscountAmount,
        amountReceived: 0, // All payments now go to payments table
        outstandingBalance:
          paymentMode === "credit" && isPartialPayment
            ? totalAmount - received
            : paymentMode === "credit"
              ? totalAmount
              : 0,
        paymentStatus:
          paymentMode === "credit" && isPartialPayment
            ? "partial"
            : paymentMode === "credit"
              ? "unpaid"
              : "paid",
        salesDetails: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.customQuantity || item.quantity,
          unitPrice: item.price,
          unit: item.unit || item.unitSize || "pc",
          taxRate: 0,
          originalPrice: item.originalPrice
        }))
      };
      console.log(salesInvoiceData);
      // Create the sales invoice and get the result (should include invoiceNumber/billNumber)
      const invoiceResult = await window.api.salesInvoices.create(salesInvoiceData);
      console.log("Invoice creation result:", invoiceResult); // Debug log

      // Use the invoice ID directly since it's now in INV-XXXX format
      const invoiceNumber = invoiceResult?.id || `INV-${Date.now()}`;

      console.log("Using invoice number:", invoiceNumber);

      // Create payment record for all payments (cash or credit)
      if (received > 0) {
        const paymentNotes =
          paymentMode === "cash"
            ? "Full payment at time of sale"
            : isPartialPayment
              ? "Partial payment at time of sale"
              : "Full payment at time of sale";

        await window.api.payments.create({
          invoiceId: invoiceResult.id,
          amount: received,
          paymentMode: paymentMode === "cash" ? "cash" : "cash", // All initial payments are in cash
          employeeId: user.id,
          notes: paymentNotes
        });
      }

      const change = paymentMode === "cash" ? received - totalAmount : 0;
      const successMessageKey = ((): string => {
        if (paymentMode === "cash") {
          return change > 0 ? "pos.toast.paymentCashChange" : "pos.toast.paymentCashExact";
        }
        if (paymentMode === "credit") {
          return isPartialPayment ? "pos.toast.paymentPartialCredit" : "pos.toast.paymentCredit";
        }
        return "pos.toast.paymentSuccess";
      })();

      toast.success(
        t(successMessageKey, {
          change: change.toFixed(2),
          outstanding: (totalAmount - received).toFixed(2)
        })
      );

      // Print receipt with correct invoice number
      await printReceipt(received, invoiceNumber);

      // Clear cart and reset form
      clearCart();
      setReceivedAmount("");
      setTotalDiscountAmount(0);
      setSelectedCustomer("");
      setIsPartialPayment(false);
      setPartialPaymentAmount("");
      toast.success(t("pos.toast.saleCompleted", { total: totalAmount.toFixed(2) }));
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(t("pos.toast.paymentFailed"));
    }
  }, [
    cartItems,
    currentTotal,
    receivedAmount,
    paymentMode,
    selectedCustomer,
    user,
    originalSubtotal,
    totalDiscountAmount,
    isPartialPayment,
    partialPaymentAmount,
    clearCart,
    printReceipt,
    t
  ]);

  // Refs to store latest function references
  const addToCartRef = useRef(addToCart);
  const removeFromCartRef = useRef(removeFromCart);
  const clearCartRef = useRef(clearCart);
  const processPaymentRef = useRef(processPayment);
  const applyBulkDiscountRef = useRef(applyBulkDiscount);

  // Update refs when functions change
  useEffect(() => {
    addToCartRef.current = addToCart;
    removeFromCartRef.current = removeFromCart;
    clearCartRef.current = clearCart;
    processPaymentRef.current = processPayment;
    applyBulkDiscountRef.current = applyBulkDiscount;
  }, [addToCart, removeFromCart, clearCart, processPayment, applyBulkDiscount]);

  // Keyboard shortcuts handler

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Don't handle shortcuts if user is typing in an input field
      if (isInputFocused) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          // Select previous product
          if (selectedProductIndex > 0) {
            setSelectedProductIndex(selectedProductIndex - 1);
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          // Select next product
          if (selectedProductIndex < filteredProducts.length - 1) {
            setSelectedProductIndex(selectedProductIndex + 1);
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          // Select product above (assuming 4-5 columns)
          {
            const cols = 4; // Adjust based on grid layout
            if (selectedProductIndex >= cols) {
              setSelectedProductIndex(selectedProductIndex - cols);
            }
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          // Select product below (assuming 4-5 columns)
          {
            const colsDown = 4; // Adjust based on grid layout
            if (selectedProductIndex < filteredProducts.length - colsDown) {
              setSelectedProductIndex(selectedProductIndex + colsDown);
            }
          }
          break;
        case "s":
        case "S":
          e.preventDefault();
          // Focus search input
          {
            const searchInput = document.querySelector(
              'input[placeholder="Search products..."]'
            ) as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
              searchInput.select();
            }
          }
          break;
        case "c":
        case "C":
          e.preventDefault();
          // Focus customer paid input
          {
            const amountInput = document.querySelector(
              'input[placeholder="0.00"]'
            ) as HTMLInputElement;
            if (amountInput) {
              amountInput.focus();
              amountInput.select();
            }
          }
          break;
        case "d":
        case "D":
          e.preventDefault();
          // Focus discount input
          {
            const discountInput = document.querySelector(
              'input[placeholder="0"]'
            ) as HTMLInputElement;
            if (discountInput) {
              discountInput.focus();
              discountInput.select();
            }
          }
          break;
        case "a":
        case "A":
          e.preventDefault();
          // Apply discount
          if (cartItems.length > 0 && bulkDiscountValue > 0) {
            applyBulkDiscountRef.current();
          }
          break;
        case "p":
        case "P":
          e.preventDefault();
          // Print bill / Process payment
          if (cartItems.length > 0) {
            processPaymentRef.current();
          }
          break;
        case "Escape":
          e.preventDefault();
          // Clear cart
          clearCartRef.current();
          break;
        case " ":
          e.preventDefault();
          // Print bill confirm (same as P)
          if (cartItems.length > 0) {
            processPaymentRef.current();
          }
          break;
        case "Enter":
          e.preventDefault();
          // Add selected item to cart
          if (selectedProductIndex >= 0 && selectedProductIndex < filteredProducts.length) {
            addToCartRef.current(filteredProducts[selectedProductIndex]);
          }
          break;
        case "Backspace":
          e.preventDefault();
          // Remove selected item from cart
          if (selectedCartItemIndex >= 0 && selectedCartItemIndex < cartItems.length) {
            removeFromCartRef.current(cartItems[selectedCartItemIndex].id);
          }
          break;
        case "F1":
        case "?":
          e.preventDefault();
          // Show shortcuts help
          setShowShortcutsHelp(true);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isInputFocused,
    selectedProductIndex,
    selectedCartItemIndex,
    filteredProducts,
    cartItems,
    bulkDiscountValue
  ]);

  return (
    <div className="flex flex-col lg:flex-row h-[92vh] bg-gray-100">
      <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto">
        <div className="mb-4 lg:mb-6">
          <ScannerStatus
            scannerEnabled={scannerEnabled}
            scannerStatus={scannerStatus}
            scanHistory={scanHistory}
            printerSettings={printerSettings}
            onShowShortcuts={() => setShowShortcutsHelp(true)}
          />
          <ProductSearchAndFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <CategoryFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
          />
        </div>

        {/* Products Grid */}
        <ProductGrid
          products={filteredProducts}
          loading={loading}
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          paymentMode={paymentMode}
          cartItems={cartItems}
          selectedProductIndex={selectedProductIndex}
          onAddToCart={addToCart}
        />
      </div>

      {/* Right Panel - Cart & Checkout */}
      <div className="w-full lg:w-[28rem] xl:w-[32rem] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col h-[50vh] lg:h-auto">
        {/* Cart Section */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Left Section - Cart Items */}
          <Cart
            cartItems={cartItems}
            selectedCartItemIndex={selectedCartItemIndex}
            paymentMode={paymentMode}
            products={products}
            onRemoveFromCart={removeFromCart}
            onClearCart={clearCart}
            onUpdateQuantity={(itemId, quantity) => {
              const inputValue = quantity.toString().trim();
              const numericValue = parseFloat(inputValue);

              let finalQuantity;
              if (inputValue === "") {
                finalQuantity = 0;
              } else if (!isNaN(numericValue) && numericValue >= 0 && isFinite(numericValue)) {
                // Allow decimal values like 0.5, 1.5, etc.
                finalQuantity = numericValue;
              } else {
                return;
              }

              const originalProduct = products.find((p) => p.id === itemId);
              if (originalProduct && finalQuantity > originalProduct.stockLevel) {
                toast.error(
                  t("pos.toast.insufficientStock", {
                    name: originalProduct.name,
                    available: formatToThreeDecimalPlaces(originalProduct.stockLevel)
                  }),
                  {
                    duration: 3000,
                    position: "top-center"
                  }
                );
                return;
              }

              const newTotal =
                finalQuantity * (cartItems.find((item) => item.id === itemId)?.price || 0);
              setCartItems(
                cartItems.map((cartItem) =>
                  cartItem.id === itemId
                    ? {
                        ...cartItem,
                        quantity: finalQuantity,
                        total: newTotal,
                        originalTotal: newTotal,
                        customQuantity: finalQuantity
                      }
                    : cartItem
                )
              );
            }}
          />

          <CheckoutPanel
            paymentMode={paymentMode}
            setPaymentMode={setPaymentMode}
            bulkDiscountType={bulkDiscountType}
            setBulkDiscountType={setBulkDiscountType}
            bulkDiscountValue={bulkDiscountValue}
            setBulkDiscountValue={setBulkDiscountValue}
            applyBulkDiscount={applyBulkDiscount}
            clearAllDiscounts={clearAllDiscounts}
            cartItems={cartItems}
            currentTotal={currentTotal}
            originalSubtotal={originalSubtotal}
            totalDiscountAmount={totalDiscountAmount}
            customerSearchTerm={customerSearchTerm}
            setCustomerSearchTerm={setCustomerSearchTerm}
            showCustomerDropdown={showCustomerDropdown}
            setShowCustomerDropdown={setShowCustomerDropdown}
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            setShowCustomerModal={setShowCustomerModal}
            receivedAmount={receivedAmount}
            setReceivedAmount={setReceivedAmount}
            isPartialPayment={isPartialPayment}
            setIsPartialPayment={setIsPartialPayment}
            partialPaymentAmount={partialPaymentAmount}
            setPartialPaymentAmount={setPartialPaymentAmount}
            processPayment={processPayment}
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />

      {/* Product Selection Modal */}
      <ProductSelectionModal
        isOpen={showProductSelectionModal}
        products={productSelectionOptions}
        onSelectProduct={(product) => {
          // Check stock availability
          if (product.stockLevel <= 0) {
            toast.error(t("pos.toast.outOfStock", { name: product.name }), {
              duration: 3000,
              position: "top-center"
            });
            return;
          }

          // Check if product is already in cart
          const existingItem = cartItems.find((item) => item.id === product.id);
          const isUpdatingQuantity = !!existingItem;

          // For existing items, check if adding one more would exceed stock
          if (isUpdatingQuantity) {
            const newQuantity = existingItem.quantity + 1;
            if (newQuantity > product.stockLevel) {
              toast.error(
                t("pos.toast.insufficientStock", {
                  name: product.name,
                  available: formatToThreeDecimalPlaces(product.stockLevel)
                }),
                {
                  duration: 3000,
                  position: "top-center"
                }
              );
              return;
            }
          }

          // Add to cart
          addToCart(product);

          // Close modal
          setShowProductSelectionModal(false);
          setProductSelectionOptions([]);

          // Show success message
          if (isUpdatingQuantity) {
            const newQuantity = existingItem.quantity + 1;
            toast.success(
              t("pos.toast.updatedQuantity", {
                name: product.name,
                quantity: newQuantity
              }),
              {
                duration: 2000,
                position: "top-center"
              }
            );
          } else {
            toast.success(t("pos.toast.addedToCart", { name: product.name }), {
              duration: 2000,
              position: "top-center"
            });
          }
        }}
        onClose={() => {
          setShowProductSelectionModal(false);
          setProductSelectionOptions([]);
        }}
      />

      {/* Customer Add Modal */}
      <CustomerModal
        isOpen={showCustomerModal}
        customerFormData={customerFormData}
        setCustomerFormData={setCustomerFormData}
        onClose={() => {
          setShowCustomerModal(false);
          setCustomerFormData({ name: "", phone: "", email: "", address: "" });
        }}
        onAddCustomer={handleAddCustomer}
        isAddingCustomer={isAddingCustomer}
      />
    </div>
  );
};

export default POSSystem;
