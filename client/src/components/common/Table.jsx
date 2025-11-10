import React from "react";
import { clsx } from "clsx";
import { Button } from "./Button";

/**
 * Table Component with built-in pagination and sorting
 * @param {object} props
 * @param {Array} props.columns - Table columns definition
 * @param {Array} props.data - Table data
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onSort - Sort handler
 * @param {string} props.sortBy - Current sort column
 * @param {string} props.sortOrder - Current sort order ('asc' | 'desc')
 * @param {object} props.pagination - Pagination config
 * @param {Function} props.onPageChange - Page change handler
 * @param {boolean} props.striped - Striped rows
 * @param {boolean} props.hover - Hover effect on rows
 */
export const Table = ({
  columns = [],
  data = [],
  loading = false,
  onSort,
  sortBy,
  sortOrder,
  pagination,
  onPageChange,
  striped = true,
  hover = true,
  className,
  onRowClick,
}) => {
  const handleSort = (column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  const renderSortIcon = (column) => {
    if (!column.sortable) return null;

    if (sortBy === column.key) {
      return sortOrder === "asc" ? " ↑" : " ↓";
    }
    return " ⇅";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className={clsx("w-full", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-primary">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column)}
                  className={clsx(
                    "px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider",
                    column.sortable && "cursor-pointer hover:bg-primary-dark"
                  )}
                  style={{ width: column.width }}
                >
                  {column.label}
                  {renderSortIcon(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={clsx(
                  striped && rowIndex % 2 === 0 && "bg-gray-50",
                  hover && "hover:bg-gray-100 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <span>
              Hiển thị {pagination.startIndex} - {pagination.endIndex} của{" "}
              {pagination.total} kết quả
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange(pagination.currentPage - 1)}
            >
              Trước
            </Button>
            <span className="text-sm text-gray-700">
              Trang {pagination.currentPage} / {pagination.totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => onPageChange(pagination.currentPage + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
