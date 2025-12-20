import React from "react";
import { useTranslation } from "../../contexts/LanguageContext";

interface ScannerStatusProps {
  scannerEnabled: boolean;
  scannerStatus: "idle" | "scanning" | "connected";
  scanHistory: string[];
  printerSettings: {
    selectedPrinter: string;
  };
  onShowShortcuts: () => void;
}

const ScannerStatus: React.FC<ScannerStatusProps> = ({
  scannerEnabled,
  scannerStatus,
  scanHistory,
  printerSettings,
  onShowShortcuts
}) => {
  const { t } = useTranslation();

  return (
    <div className="top-0 z-20 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
      {/* Scanner Status */}
      <div className="flex items-center space-x-3">
        <div
          className={`w-3 h-3 rounded-full ${
            !scannerEnabled
              ? "bg-red-500"
              : scannerStatus === "connected"
                ? "bg-green-500"
                : scannerStatus === "scanning"
                  ? "bg-blue-500 animate-pulse"
                  : "bg-gray-400"
          }`}
        />
        <div>
          <div className="text-sm font-medium text-gray-700">
            {t("Scanner")}:{" "}
            <span
              className={`${
                !scannerEnabled
                  ? "text-red-600"
                  : scannerStatus === "connected"
                    ? "text-green-600"
                    : scannerStatus === "scanning"
                      ? "text-blue-600"
                      : "text-gray-600"
              }`}
            >
              {!scannerEnabled
                ? t("Disabled")
                : scannerStatus === "connected"
                  ? t("Connected")
                  : scannerStatus === "scanning"
                    ? t("Scanning")
                    : t("Disconnected")}
            </span>
          </div>
          {scanHistory.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {t("Last scan")}: {scanHistory[0]}
            </div>
          )}
        </div>
      </div>

      {/* Printer Status */}
      <div className="flex items-center space-x-2">
        <div
          className={`w-3 h-3 rounded-full ${printerSettings.selectedPrinter ? "bg-green-500" : "bg-gray-400"}`}
        />
        <span className="text-sm font-medium text-gray-700">{t("Printer")}:</span>
        <span
          className={`text-sm ml-1 ${printerSettings.selectedPrinter ? "text-green-600" : "text-gray-600"}`}
        >
          {printerSettings.selectedPrinter || t("Not selected")}
        </span>
      </div>

      {/* Help Button */}
      <div className="flex items-center">
        <button
          onClick={onShowShortcuts}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          title={`${t("Keyboard Shortcuts")} (F1)`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{t("Help")}</span>
        </button>
      </div>
    </div>
  );
};

export default ScannerStatus;
