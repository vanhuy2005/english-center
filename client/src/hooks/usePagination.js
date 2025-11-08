import { useState } from "react";

/**
 * Custom hook for pagination
 * @param {number} initialPage - Initial page number (default: 1)
 * @param {number} initialPageSize - Initial page size (default: 10)
 * @returns {object} Pagination state and handlers
 */
export const usePagination = (initialPage = 1, initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / pageSize);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const changePageSize = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const reset = () => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
    setTotal(0);
  };

  return {
    currentPage,
    pageSize,
    total,
    totalPages,
    setTotal,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    reset,
    // Helper values
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    startIndex: (currentPage - 1) * pageSize,
    endIndex: Math.min(currentPage * pageSize, total),
  };
};

export default usePagination;
