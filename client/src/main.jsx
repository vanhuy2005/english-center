import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Context Providers
import { AuthProvider } from "@contexts/AuthContext";
import { LanguageProvider } from "@contexts/LanguageContext";
import { ThemeProvider } from "@contexts/ThemeContext";

// Toast Notifications
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#fff",
                  color: "#132440",
                  boxShadow: "0 4px 12px rgba(19, 36, 64, 0.15)",
                },
                success: {
                  iconTheme: {
                    primary: "#3B9797",
                    secondary: "#fff",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#BF092F",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
