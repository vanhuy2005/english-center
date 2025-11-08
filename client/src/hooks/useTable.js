import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing table state (sorting, filtering, pagination)
 * @param {Array} initialData - Initial data array
 * @param {object} config - Configuration options
 * @returns {object} Table state and handlers
 */
export const useTable = (initialData = [], config = {}) => {
  const {
    initialPageSize = 10,
    initialSortBy = null,
    initialSortOrder = "asc",
    initialFilters = {},
    searchableFields = [], // configurable array of field names
  } = config;

  const [data, setData] = useState(initialData);
  const [filteredData, setFilteredData] = useState(initialData);
  const [paginatedData, setPaginatedData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [filters, setFilters] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState("");

  // Sanitize pageSize to be a positive integer (default to 1 if invalid)
  const safePageSize = Math.max(1, parseInt(pageSize, 10) || 1);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / safePageSize));
  const startIndex = (currentPage - 1) * safePageSize;
  const endIndex = startIndex + safePageSize;

  // Apply filters and search
  const applyFilters = useCallback(() => {
    let result = [...data];

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const fields =
        Array.isArray(searchableFields) && searchableFields.length > 0
          ? searchableFields
          : Object.keys(data[0] || {}); // fallback to all keys if not provided
      result = result.filter((item) => {
        for (const field of fields) {
          const value = item[field];
          if (value === null || value === undefined) continue;
          if (String(value).toLowerCase().includes(searchLower)) return true;
        }
        return false;
      });
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        result = result.filter((item) => {
          if (Array.isArray(value)) {
            return value.includes(item[key]);
          }
          return item[key] === value;
        });
      }
    });

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        // Handle null/undefined: treat as greater, so they sort last
        const aNull = aValue === null || aValue === undefined;
        const bNull = bValue === null || bValue === undefined;
        if (aNull && bNull) return 0;
        if (aNull) return 1;
        if (bNull) return -1;

        if (aValue === bValue) return 0;
        const comparison = aValue > bValue ? 1 : -1;
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    setFilteredData(result);
  }, [data, searchTerm, filters, sortBy, sortOrder]);

  // Apply pagination
  useEffect(() => {
    setPaginatedData(filteredData.slice(startIndex, endIndex));
  }, [filteredData, startIndex, endIndex]);

  // Reset pagination only for filter/search changes
  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
  }, [data, filters, searchTerm]);

  // Apply filters for sorting changes, but do not reset page
  useEffect(() => {
    applyFilters();
  }, [sortBy, sortOrder]);

  // Update data
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Handlers
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return {
    // Data
    data: paginatedData,
    allData: filteredData,
    total: filteredData.length,

    // Pagination
    currentPage,
    pageSize,
    totalPages,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, filteredData.length),
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,

    // Sorting
    sortBy,
    sortOrder,

    // Filtering
    filters,
    searchTerm,

    // Handlers
    handleSort,
    handleFilter,
    handleClearFilters,
    handlePageChange,
    handlePageSizeChange,
    setSearchTerm,
    setData,
  };
};

export default useTable;
