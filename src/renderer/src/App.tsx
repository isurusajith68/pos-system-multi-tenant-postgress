import React from "react";
import { Toaster } from "react-hot-toast";
import { CurrentUserProvider } from "./contexts/CurrentUserContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import AuthenticatedLayout from "./layout/AuthenticatedLayout";
import "./assets/main.css";

function App(): React.JSX.Element {
  return (
    <CurrentUserProvider>
      <LanguageProvider>
        <AuthenticatedLayout />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff"
            },
            success: {
              duration: 3000,
              style: {
                background: "#10b981"
              }
            },
            error: {
              duration: 5000,
              style: {
                background: "#ef4444"
              }
            }
          }}
        />
      </LanguageProvider>
    </CurrentUserProvider>
  );
}

export default App;
