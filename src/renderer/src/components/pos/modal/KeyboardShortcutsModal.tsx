import React from "react";
import { useTranslation } from "../../../contexts/LanguageContext";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="mr-2">⌨️</span>
              {t("Keyboard Shortcuts")}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Navigation Shortcuts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <span className="mr-2">🧭</span>
                {t("Navigation")}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                  <span className="text-gray-600">← → ↑ ↓</span>
                  <span className="text-sm text-gray-500">{t("Navigate products")}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Enter</span>
                  <span className="text-sm text-gray-500">{t("Add to cart")}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Backspace</span>
                  <span className="text-sm text-gray-500">{t("Remove from cart")}</span>
                </div>
              </div>
            </div>

            {/* Input Focus Shortcuts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <span className="mr-2">🎯</span>
                {t("Focus Inputs")}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded">
                  <span className="text-blue-600 font-medium">S</span>
                  <span className="text-sm text-gray-500">{t("Search products")}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded">
                  <span className="text-green-600 font-medium">C</span>
                  <span className="text-sm text-gray-500">{t("Customer paid")}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-orange-50 rounded">
                  <span className="text-orange-600 font-medium">D</span>
                  <span className="text-sm text-gray-500">{t("Discount input")}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded">
                  <span className="text-red-600 font-medium">A</span>
                  <span className="text-sm text-gray-500">{t("Apply discount")}</span>
                </div>
              </div>
            </div>

            {/* Action Shortcuts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <span className="mr-2">⚡</span>
                {t("Actions")}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 px-3 bg-purple-50 rounded">
                  <span className="text-purple-600 font-medium">P / Space</span>
                  <span className="text-sm text-gray-500">{t("Process payment")}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded">
                  <span className="text-red-600 font-medium">Esc</span>
                  <span className="text-sm text-gray-500">{t("Clear cart")}</span>
                </div>
              </div>
            </div>

            {/* Help Shortcuts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <span className="mr-2">❓</span>
                {t("Help")}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 px-3 bg-yellow-50 rounded">
                  <span className="text-yellow-600 font-medium">F1 / ?</span>
                  <span className="text-sm text-gray-500">Show this help</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">{t("💡 Tips:")}</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t("Shortcuts only work when not typing in input fields")}</li>
              <li>• {t("Yellow highlighting shows the currently selected item")}</li>
              <li>• {t("Use arrow keys to navigate through products and cart items")}</li>
              <li>• {t("Press Enter to quickly add selected products to cart")}</li>
              <li>• {t("Press Backspace to remove selected cart items")}</li>
              <li>• {t("Click the 🗑️ button on cart items to remove them individually")}</li>
              <li>• {t("Press A to apply discounts after entering discount values")}</li>
            </ul>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("Got it!")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
