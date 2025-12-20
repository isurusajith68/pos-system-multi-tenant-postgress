import React from "react";
import { useTranslation } from "../../contexts/LanguageContext";

interface ProductSearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ProductSearchAndFilter: React.FC<ProductSearchAndFilterProps> = ({
  searchTerm,
  setSearchTerm
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 mt-5">
      <input
        type="text"
        placeholder={t("Search products...")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
      />
    </div>
  );
};

export default ProductSearchAndFilter;
