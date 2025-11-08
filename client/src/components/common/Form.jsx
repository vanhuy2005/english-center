import React from "react";
import { clsx } from "clsx";

/**
 * Select Component
 * @param {object} props
 * @param {string} props.label - Select label
 * @param {Array} props.options - Select options [{value, label}]
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 */
export const Select = React.forwardRef(
  (
    {
      label,
      options = [],
      placeholder = "Chọn...",
      error,
      required = false,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          disabled={disabled}
          className={clsx(
            "w-full px-4 py-2 border rounded-md transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            error ? "border-danger" : "border-gray-300",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

/**
 * Textarea Component
 */
export const Textarea = React.forwardRef(
  (
    {
      label,
      placeholder,
      error,
      required = false,
      disabled = false,
      rows = 4,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(
            "w-full px-4 py-2 border rounded-md transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "disabled:bg-gray-100 disabled:cursor-not-allowed resize-none",
            error ? "border-danger" : "border-gray-300",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

/**
 * Checkbox Component
 */
export const Checkbox = React.forwardRef(
  ({ label, error, disabled = false, className, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className={clsx(
            "w-4 h-4 text-primary border-gray-300 rounded",
            "focus:ring-2 focus:ring-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        {label && <label className="ml-2 text-sm text-gray-700">{label}</label>}
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default { Select, Textarea, Checkbox };
