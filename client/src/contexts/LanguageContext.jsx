import React, { createContext, useContext, useState, useEffect } from "react";
import i18n from "../i18n/config";

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "vi";
  });

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "vi" ? "en" : "vi"));
  };

  const changeLanguage = (lang) => {
    if (lang === "vi" || lang === "en") {
      setLanguage(lang);
    }
  };

  const t = (key) => i18n.t(key);

  const value = {
    language,
    toggleLanguage,
    changeLanguage,
    t,
    isVietnamese: language === "vi",
    isEnglish: language === "en",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
