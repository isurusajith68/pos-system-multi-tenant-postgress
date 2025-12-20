import React from "react";
import { useTranslation } from "../../contexts/LanguageContext";

interface CheckoutPanelProps {
  paymentMode: "cash" | "card" | "credit" | "wholesale";
  setPaymentMode: (mode: "cash" | "card" | "credit" | "wholesale") => void;
  bulkDiscountType: "percentage" | "amount";
  setBulkDiscountType: (type: "percentage" | "amount") => void;
  bulkDiscountValue: number;
  setBulkDiscountValue: (value: number) => void;
  applyBulkDiscount: () => void;
  clearAllDiscounts: () => void;
  cartItems: Array<any>;
  currentTotal: number;
  originalSubtotal: number;
  totalDiscountAmount: number;
  customerSearchTerm: string;
  setCustomerSearchTerm: (term: string) => void;
  showCustomerDropdown: boolean;
  setShowCustomerDropdown: (show: boolean) => void;
  customers: Array<any>;
  selectedCustomer: string;
  setSelectedCustomer: (customer: string) => void;
  setShowCustomerModal: (show: boolean) => void;
  receivedAmount: string;
  setReceivedAmount: (amount: string) => void;
  isPartialPayment: boolean;
  setIsPartialPayment: (partial: boolean) => void;
  partialPaymentAmount: string;
  setPartialPaymentAmount: (amount: string) => void;
  processPayment: () => void;
}

const CheckoutPanel: React.FC<CheckoutPanelProps> = ({
  paymentMode,
  setPaymentMode,
  bulkDiscountType,
  setBulkDiscountType,
  bulkDiscountValue,
  setBulkDiscountValue,
  applyBulkDiscount,
  clearAllDiscounts,
  cartItems,
  currentTotal,
  originalSubtotal,
  totalDiscountAmount,
  customerSearchTerm,
  setCustomerSearchTerm,
  showCustomerDropdown,
  setShowCustomerDropdown,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  setShowCustomerModal,
  receivedAmount,
  setReceivedAmount,
  isPartialPayment,
  setIsPartialPayment,
  partialPaymentAmount,
  setPartialPaymentAmount,
  processPayment
}) => {
  const { t } = useTranslation();

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(customerSearchTerm))
  );

  return (
    <div className="flex-1 lg:w-1/2 flex flex-col">
      <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">{t("Checkout")}</h2>
      </div>

      <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4">
        {/* Payment Mode Selection */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">{t("Payment Method")}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setPaymentMode("cash")}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                paymentMode === "cash"
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {t("💵 Cash")}
            </button>
            <button
              onClick={() => setPaymentMode("card")}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                paymentMode === "card"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {t("💳 Card")}
            </button>

            <button
              onClick={() => setPaymentMode("credit")}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                paymentMode === "credit"
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {t("💳 Credit")}
            </button>
            <button
              onClick={() => setPaymentMode("wholesale")}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                paymentMode === "wholesale"
                  ? "bg-purple-500 text-white border-purple-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {t("🏪 Wholesale")}
            </button>
          </div>
        </div>
        {/* Bulk Discount Section */}
        {cartItems.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-xl border border-yellow-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">{t("Total Discount")}</h4>
                  <p className="text-xs text-gray-600">{t("Apply to total amount")}</p>
                </div>
              </div>
              <button
                onClick={clearAllDiscounts}
                className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full hover:bg-red-200 transition-colors"
                title="Clear All Discounts"
              >
                {t("Clear All")}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={bulkDiscountType}
                onChange={(e) => setBulkDiscountType(e.target.value as "percentage" | "amount")}
                className="text-xs border border-gray-300 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">%</option>
                <option value="amount">Rs</option>
              </select>
              <div className="flex-1 relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={bulkDiscountType === "percentage" ? "100" : originalSubtotal}
                  value={bulkDiscountValue}
                  onChange={(e) => {
                    const inputValue = e.target.value.trim();
                    const numericValue = parseFloat(inputValue);
                    if (!isNaN(numericValue) && numericValue >= 0 && isFinite(numericValue)) {
                      setBulkDiscountValue(numericValue);
                    } else if (inputValue === "") {
                      setBulkDiscountValue(0);
                    }
                  }}
                  onWheel={(e) => {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }}
                  className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  placeholder={bulkDiscountType === "percentage" ? "0" : "0.00"}
                />
              </div>
              <button
                onClick={applyBulkDiscount}
                disabled={bulkDiscountValue <= 0}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-lg text-xs font-medium hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all"
              >
                {t("Apply")}
              </button>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            {t("Order Summary")}
          </h4>
          <div className="space-y-2">
            {originalSubtotal > currentTotal && (
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-600">{t("Original Subtotal:")}</span>
                <span className="text-sm font-medium text-gray-400 line-through">
                  Rs {originalSubtotal.toFixed(2)}
                </span>
              </div>
            )}
            {totalDiscountAmount > 0 && (
              <div className="flex justify-between items-center py-1 bg-green-50 -mx-2 px-2 rounded">
                <span className="text-sm text-green-700 font-medium flex items-center">
                  {t("Total Savings")}
                </span>
                <span className="text-sm font-bold text-green-700">
                  -Rs {totalDiscountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-1 border-t border-gray-100 pt-2">
              <span className="text-sm font-medium text-gray-700">{t("receipt.subtotal")}:</span>
              <span className="text-sm font-semibold text-gray-900">
                Rs {currentTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 bg-gradient-to-r from-blue-50 to-green-50 -mx-2 px-2 rounded-lg border border-blue-200 mt-3">
              <span className="text-base font-bold text-gray-800 flex items-center">
                {t("Final Total:")}
              </span>
              <span className="text-lg font-bold text-green-600">Rs {currentTotal.toFixed(2)}</span>
            </div>
            {totalDiscountAmount > 0 && (
              <div className="text-center mt-2">
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                  {t("saved Rs {amount} on this order!", {
                    amount: totalDiscountAmount.toFixed(2)
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-800">{t("Customer")}</h4>
            <button
              onClick={() => setShowCustomerModal(true)}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
            >
              {t("Add New Customer")}
            </button>
          </div>

          {/* Searchable Customer Dropdown */}
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                placeholder={
                  paymentMode === "credit"
                    ? t("Search and select customer (Required)")
                    : t("Search customers...")
                }
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                onFocus={() => setShowCustomerDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowCustomerDropdown(false), 200);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm pr-8 ${
                  paymentMode === "credit" && !selectedCustomer
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
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
              </div>
            </div>

            {/* Dropdown Results */}
            {showCustomerDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    {customerSearchTerm
                      ? t("No customers found")
                      : t("Start typing to search customers")}
                  </div>
                ) : (
                  <>
                    {/* {t("Walk-in Customer")} Option */}
                    {paymentMode !== "credit" && (
                      <button
                        onClick={() => {
                          setSelectedCustomer("");
                          setCustomerSearchTerm("");
                          setShowCustomerDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 text-sm"
                      >
                        <div className="font-medium text-gray-700">Walk-in Customer</div>
                        <div className="text-xs text-gray-500">{t("No customer selected")}</div>
                      </button>
                    )}

                    {/* Customer List */}
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer.id);
                          setCustomerSearchTerm(customer.name);
                          setShowCustomerDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                          selectedCustomer === customer.id ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-500 flex items-center space-x-4">
                          {customer.phone && <span>📞 {customer.phone}</span>}
                          {customer.email && <span>✉️ {customer.email}</span>}
                        </div>
                        {customer.address && (
                          <div className="text-xs text-gray-400 mt-1 truncate">
                            {customer.address}
                          </div>
                        )}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Selected Customer Display */}
            {selectedCustomer && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-900">
                      {customers.find((c) => c.id === selectedCustomer)?.name}
                    </span>
                    {customers.find((c) => c.id === selectedCustomer)?.phone && (
                      <span className="text-xs text-blue-700">
                        ({customers.find((c) => c.id === selectedCustomer)?.phone})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCustomer("");
                      setCustomerSearchTerm("");
                    }}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {paymentMode === "credit" && !selectedCustomer && (
            <p className="text-xs text-red-600 mt-2">
              {t("Customer selection is required for credit sales")}
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            {paymentMode === "cash"
              ? t("💵 Cash Payment")
              : paymentMode === "card"
                ? t("💳 Card Payment")
                : paymentMode === "wholesale"
                  ? t("🏪 Wholesale Payment")
                  : t("Credit Sale")}
          </h4>
          <div className="space-y-3">
            {paymentMode === "cash" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Amount Received:")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 text-sm">Rs</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={receivedAmount}
                      onChange={(e) => {
                        const inputValue = e.target.value.trim();
                        const numericValue = parseFloat(inputValue);
                        if (!isNaN(numericValue) && numericValue >= 0 && isFinite(numericValue)) {
                          setReceivedAmount(inputValue);
                        } else if (inputValue === "") {
                          setReceivedAmount("");
                        }
                      }}
                      onWheel={(e) => {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    />
                  </div>
                </div>
                <div className="p-2 bg-gray-50 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t("Change")}:</span>
                    <span
                      className={`text-sm font-bold ${
                        receivedAmount && parseFloat(receivedAmount) >= currentTotal
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      Rs{" "}
                      {receivedAmount
                        ? Math.max(0, parseFloat(receivedAmount) - currentTotal).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                </div>
              </>
            ) : paymentMode === "wholesale" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("Amount Received:")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 text-sm">Rs</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={receivedAmount}
                      onChange={(e) => {
                        const inputValue = e.target.value.trim();
                        const numericValue = parseFloat(inputValue);
                        if (!isNaN(numericValue) && numericValue >= 0 && isFinite(numericValue)) {
                          setReceivedAmount(inputValue);
                        } else if (inputValue === "") {
                          setReceivedAmount("");
                        }
                      }}
                      onWheel={(e) => {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    />
                  </div>
                </div>
                <div className="p-2 bg-purple-50 rounded border border-purple-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700">{t("Change")}:</span>
                    <span
                      className={`text-sm font-bold ${
                        receivedAmount && parseFloat(receivedAmount) >= currentTotal
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      Rs{" "}
                      {receivedAmount
                        ? Math.max(0, parseFloat(receivedAmount) - currentTotal).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                </div>
              </>
            ) : paymentMode === "credit" ? (
              <div className="space-y-4">
                {/* Partial Payment Toggle */}
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-amber-800">
                      {t("Partial Payment")}
                    </label>
                    <p className="text-xs text-amber-600">
                      {t("Allow customer to pay part now, balance later")}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPartialPayment}
                      onChange={(e) => {
                        setIsPartialPayment(e.target.checked);
                        if (!e.target.checked) {
                          setPartialPaymentAmount("");
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {isPartialPayment ? (
                  /* Partial Payment Input */
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("Payment Amount (Rs)")}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500 text-sm">Rs</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={currentTotal}
                        placeholder={`0.00 (max: ${currentTotal.toFixed(2)})`}
                        value={partialPaymentAmount}
                        onChange={(e) => {
                          const inputValue = e.target.value.trim();
                          const numericValue = parseFloat(inputValue);
                          if (
                            !isNaN(numericValue) &&
                            numericValue >= 0 &&
                            numericValue <= currentTotal &&
                            isFinite(numericValue)
                          ) {
                            setPartialPaymentAmount(inputValue);
                          } else if (inputValue === "") {
                            setPartialPaymentAmount("");
                          }
                        }}
                        onWheel={(e) => {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      />
                    </div>
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-700">{t("Outstanding Balance:")}</span>
                        <span className="font-medium text-amber-800">
                          Rs {(currentTotal - (parseFloat(partialPaymentAmount) || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Full Credit Payment */
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-2">CR</div>
                    {selectedCustomer ? (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-800">
                          {t("Customer:")} {customers.find((c) => c.id === selectedCustomer)?.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {t("Full credit sale - customer pays Rs {amount} later", {
                            amount: currentTotal.toFixed(2)
                          })}
                        </p>
                      </div>
                    ) : (
                      <div className="mb-2">
                        <p className="text-sm text-red-600 font-medium">
                          ⚠️ {t("No customer selected")}
                        </p>
                        <p className="text-xs text-gray-600">
                          {t("Please select a customer above to proceed with credit sale.")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">{paymentMode === "card" ? "💳" : "📱"}</div>
                <p className="text-sm text-gray-600 mb-2">
                  {paymentMode === "card"
                    ? t("Process card payment of Rs {amount}", {
                        amount: currentTotal.toFixed(2)
                      })
                    : t("Process mobile payment of Rs {amount}", {
                        amount: currentTotal.toFixed(2)
                      })}
                </p>
                <div className="text-xs text-gray-500">
                  {paymentMode === "card"
                    ? t("Insert card and follow prompts on the card reader")
                    : t("Customer can pay via mobile app or QR code")}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={processPayment}
          disabled={cartItems.length === 0}
          className={`w-full py-3 px-4 font-bold rounded-xl text-base transition-all duration-200 shadow-lg ${
            cartItems.length === 0
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transform hover:scale-105 active:scale-95"
          }`}
        >
          <span className="flex items-center justify-center space-x-2">
            <span>{t("Process Payment")}</span>
            <span className="text-sm opacity-80">(Rs {currentTotal.toFixed(2)})</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default CheckoutPanel;
