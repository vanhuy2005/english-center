// Export all hooks
export { usePagination } from "./usePagination";
export { useFetch } from "./useFetch";
export { useDebounce } from "./useDebounce";
export { useLocalStorage } from "./useLocalStorage";
export { useTable } from "./useTable";

// Re-export contexts as hooks
export { useAuth } from "../contexts/AuthContext";
export { useLanguage } from "../contexts/LanguageContext";
export { useTheme } from "../contexts/ThemeContext";
