import React from "react";
import { useTranslation } from "../../contexts/LanguageContext";

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  discount: {
    type: "percentage" | "amount";
    value: number;
  };
  salePrice?: number;
  originalTotal: number;
  customQuantity?: number;
  originalPrice: number;
  unit?: string;
  unitSize?: string;
  costPrice?: number;
}

interface CartProps {
  cartItems: CartItem[];
  selectedCartItemIndex: number;
  paymentMode: "cash" | "card" | "credit" | "wholesale";
  products: Array<{
    id: string;
    discountedPrice?: number;
  }>;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  selectedCartItemIndex,
  paymentMode,
  products,
  onRemoveFromCart,
  onClearCart,
  onUpdateQuantity
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      {/* Left Section - Cart Items */}
      <div className="flex-1 lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
        <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">{t("Cart Items")}</h2>
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {cartItems.length} {cartItems.length === 1 ? t("item") : t("items")}
            </span>
          </div>
        </div>

        <div className="flex-1 p-3 sm:p-4 overflow-y-auto min-h-10">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-4xl mb-2">🛒</div>
              <p className="text-sm">{t("Cart is empty")}</p>
              <p className="text-xs text-gray-400 mt-1">{t("Add items to start shopping")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl p-3 border shadow-sm hover:shadow-md transition-shadow ${
                    index === selectedCartItemIndex
                      ? "border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm leading-tight">
                        {item.name}
                      </h4>
                      <div className="text-xs text-gray-500 mt-1">
                        {(() => {
                          const originalProduct = products.find((p) => p.id === item.id);
                          const originalUnitPrice = item.originalPrice ?? item.price;
                          const discountApplied = item.price < originalUnitPrice;

                          if (discountApplied) {
                            return (
                              <>
                                <span className="line-through text-gray-400 mr-2">
                                  Rs {originalUnitPrice.toFixed(2)}
                                </span>
                                <span>
                                  Rs {item.price.toFixed(2)} × {item.quantity}
                                </span>
                              </>
                            );
                          }

                          const saleDisabledForCredit =
                            paymentMode === "credit" &&
                            originalProduct?.discountedPrice &&
                            originalProduct.discountedPrice > 0;

                          if (saleDisabledForCredit) {
                            return (
                              <div className="space-y-1">
                                <span>
                                  Rs {originalUnitPrice.toFixed(2)} × {item.quantity}
                                </span>
                                <span className="text-orange-500">
                                  {/* Sale price not available for credit payment */}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <span>
                              Rs {item.price.toFixed(2)} × {item.quantity}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-sm">
                        Rs {(item.price * item.quantity).toFixed(2)}
                      </div>
                      {/* Show savings if using discounted price */}
                      {(() => {
                        const originalUnitPrice = item.originalPrice ?? item.price;
                        const discountApplied = item.price < originalUnitPrice;
                        if (discountApplied) {
                          const savingsPerItem = originalUnitPrice - item.price;
                          return (
                            <div className="text-xs text-orange-600">
                              {t("Save Rs {amount} per item", {
                                amount: savingsPerItem.toFixed(2)
                              })}
                            </div>
                          );
                        }
                        const originalProduct = products.find((p) => p.id === item.id);
                        if (
                          paymentMode === "credit" &&
                          originalProduct?.discountedPrice &&
                          originalProduct.discountedPrice > 0
                        ) {
                          return (
                            <div className="text-xs text-orange-500">
                              {t("Sale price not applied for credit payments")}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        {t("Qty")}: {item.quantity}
                      </span>
                      {(item.unit || item.unitSize) && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          {t("Unit")}: {item.unit || item.unitSize}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                      title="Remove one item"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs text-gray-600 mb-1">{t("Quantity")}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => {
                        const inputValue = e.target.value.trim();
                        const numericValue = parseFloat(inputValue);

                        let finalQuantity;
                        if (inputValue === "") {
                          finalQuantity = 0;
                        } else if (
                          !isNaN(numericValue) &&
                          numericValue >= 0 &&
                          isFinite(numericValue)
                        ) {
                          // Allow decimal values like 0.5, 1.5, etc.
                          finalQuantity = numericValue;
                        } else {
                          return;
                        }

                        onUpdateQuantity(item.id, finalQuantity);
                      }}
                      onWheel={(e) => {
                        // Prevent mouse wheel from changing the value
                        e.preventDefault();
                        e.currentTarget.blur();
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      placeholder={t("Enter quantity")}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear Cart Button */}
        {cartItems.length > 0 && (
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={onClearCart}
              className="w-full py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {t("Clear Cart")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
