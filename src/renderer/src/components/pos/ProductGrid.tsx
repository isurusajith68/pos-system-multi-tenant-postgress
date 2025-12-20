import React from "react";
import toast from "react-hot-toast";
import { useTranslation } from "../../contexts/LanguageContext";
import { formatToThreeDecimalPlaces } from "../../lib/quantityValidation";

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

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  selectedCategory: string;
  searchTerm: string;
  paymentMode: "cash" | "card" | "credit" | "wholesale";
  cartItems: Array<{ id: string }>;
  selectedProductIndex: number;
  onAddToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  selectedCategory,
  searchTerm,
  paymentMode,
  cartItems,
  selectedProductIndex,
  onAddToCart
}) => {
  const { t } = useTranslation();

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === "all" || product.categoryId === selectedCategory) &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.englishName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
      {loading && (
        <p className="text-gray-500 col-span-full text-center py-4 text-sm sm:text-base">
          {t("Loading products...")}
        </p>
      )}
      {filteredProducts.map((product, index) => (
        <div
          key={product.id}
          className={`bg-white rounded-lg shadow-md p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${
            index === selectedProductIndex
              ? "border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200"
              : cartItems.find((item) => item.id === product.id)
                ? "border-blue-400 bg-blue-50"
                : product.stockLevel <= 0
                  ? "border-red-200 bg-red-50 opacity-60"
                  : "border-transparent hover:border-blue-200"
          }`}
          onClick={() => {
            if (product.stockLevel <= 0) {
              toast.error(t("pos.toast.outOfStock", { name: product.name }), {
                duration: 3000,
                position: "top-center"
              });
              return;
            }
            onAddToCart(product);
          }}
        >
          <div className="space-y-1 sm:space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-800 text-xs sm:text-sm leading-tight flex-1 pr-2">
                {product.name}
              </h3>
              {/* {cartItems.find((item) => item.id === product.id) && (
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartItems.find((item) => item.id === product.id)?.quantity}
                </span>
              )} */}
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm sm:text-lg font-bold text-green-600">
                {paymentMode === "wholesale" && product.wholesale && product.wholesale > 0 ? (
                  <div>
                    <span className="line-through text-gray-400 mr-2">
                      Rs {product.price.toFixed(2)}
                    </span>
                    <br />
                    <span>Rs {product.wholesale.toFixed(2)}</span>
                  </div>
                ) : paymentMode === "wholesale" &&
                  product.discountedPrice &&
                  product.discountedPrice > 0 ? (
                  <div>
                    <span className="line-through text-gray-400 mr-2">
                      Rs {product.price.toFixed(2)}
                    </span>
                    <br />
                    <span>Rs {product.discountedPrice.toFixed(2)}</span>
                  </div>
                ) : product.discountedPrice && product.discountedPrice > 0 ? (
                  <div>
                    <span className="line-through text-gray-400 mr-2">
                      Rs {product.price.toFixed(2)}
                    </span>
                    <br />
                    <span>Rs {product.discountedPrice.toFixed(2)}</span>
                  </div>
                ) : (
                  `Rs ${product.price.toFixed(2)}`
                )}
              </p>
              {paymentMode === "wholesale" && product.wholesale && product.wholesale > 0 && (
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                  {t("Wholesale!")}
                </span>
              )}
              {paymentMode === "wholesale" &&
                !product.wholesale &&
                product.discountedPrice &&
                product.discountedPrice > 0 && (
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                    {t("Sale!")}
                  </span>
                )}
              {paymentMode !== "wholesale" &&
                product.discountedPrice &&
                product.discountedPrice > 0 && (
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                    {t("Sale!")}
                  </span>
                )}
            </div>

            {product.brand && (
              <p className="text-xs text-gray-500 font-medium">
                <span className="font-semibold text-gray-700">{t("Brand")}:</span> {product.brand}
              </p>
            )}

            {(product.unit || product.unitSize) && (
              <p className="text-xs text-blue-600 font-medium">
                <span className="font-semibold text-gray-700">{t("Unit")}:</span>{" "}
                {product.unit || product.unitSize}
              </p>
            )}

            {/* Stock Information */}
            <div className="flex justify-between items-center">
              <p
                className={`text-xs font-medium ${
                  product.stockLevel <= 0
                    ? "text-red-600"
                    : product.stockLevel <= 5
                      ? "text-orange-600"
                      : "text-green-600"
                }`}
              >
                <span className="font-semibold text-gray-700">{t("Stock")}:</span>{" "}
                {product.stockLevel <= 0
                  ? t("Out of Stock")
                  : `${formatToThreeDecimalPlaces(product.stockLevel)} available`}
              </p>
              {product.stockLevel <= 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                  ❌ {t("Unavailable")}
                </span>
              )}
              {product.stockLevel > 0 && product.stockLevel <= 5 && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                  ⚠️ {t("Low Stock")}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      {!loading && filteredProducts.length === 0 && (
        <p className="text-gray-500 col-span-full text-center py-8 text-sm sm:text-base">
          {t("No products found")}
        </p>
      )}
    </div>
  );
};

export default ProductGrid;
