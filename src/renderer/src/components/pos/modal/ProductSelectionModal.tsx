import React from "react";
import { useTranslation } from "../../../contexts/LanguageContext";
import { formatToThreeDecimalPlaces } from "../../../lib/quantityValidation";
import toast from "react-hot-toast";

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
}

interface ProductSelectionModalProps {
  isOpen: boolean;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onClose: () => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  products,
  onSelectProduct,
  onClose
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">{t("Select Product")}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            {t(
              "Multiple products found with this barcode. Please select the product you want to add:"
            )}
          </p>

          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => {
                  // Check stock availability
                  if (product.stockLevel <= 0) {
                    toast.error(t("pos.toast.outOfStock", { name: product.name }), {
                      duration: 3000,
                      position: "top-center"
                    });
                    return;
                  }

                  onSelectProduct(product);
                  onClose();
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    {product.englishName && (
                      <p className="text-sm text-gray-600">{product.englishName}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>{t("SKU: {sku}", { sku: product.sku || "N/A" })}</span>
                      <span>{t("Price: Rs {price}", { price: product.price.toFixed(2) })}</span>
                      <span>
                        {t("Stock: {stock}", {
                          stock: formatToThreeDecimalPlaces(product.stockLevel)
                        })}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                    )}
                  </div>
                  <div className="ml-4">
                    {product.stockLevel <= 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {t("Out of Stock")}
                      </span>
                    ) : product.stockLevel <= 5 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {t("Low Stock")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t("In Stock")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              {t("Cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;
