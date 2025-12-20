import React from "react";
import { useTranslation } from "../../../contexts/LanguageContext";

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface CustomerModalProps {
  isOpen: boolean;
  customerFormData: CustomerFormData;
  setCustomerFormData: React.Dispatch<React.SetStateAction<CustomerFormData>>;
  onClose: () => void;
  onAddCustomer: () => void;
  isAddingCustomer: boolean;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  customerFormData,
  setCustomerFormData,
  onClose,
  onAddCustomer,
  isAddingCustomer
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">{t("Add New Customer")}</h2>
            <button
              onClick={() => {
                onClose();
                setCustomerFormData({ name: "", phone: "", email: "", address: "" });
              }}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("Name *")}</label>
              <input
                type="text"
                value={customerFormData.name}
                onChange={(e) => setCustomerFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("Enter customer name")}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("Phone")}</label>
              <input
                type="tel"
                value={customerFormData.phone}
                onChange={(e) =>
                  setCustomerFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("Enter phone number")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("Email")}</label>
              <input
                type="email"
                value={customerFormData.email}
                onChange={(e) =>
                  setCustomerFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("Enter email address")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("Address")}</label>
              <textarea
                value={customerFormData.address}
                onChange={(e) =>
                  setCustomerFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("Enter address")}
                rows={3}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                onClose();
                setCustomerFormData({ name: "", phone: "", email: "", address: "" });
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              {t("Cancel")}
            </button>
            <button
              onClick={onAddCustomer}
              disabled={isAddingCustomer || !customerFormData.name.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingCustomer ? t("Adding...") : t("Add Customer")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;
