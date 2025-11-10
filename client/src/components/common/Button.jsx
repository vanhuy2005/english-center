import React from "react";
import { clsx } from "clsx";

/**
 * Button Component
 * @param {object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button variant ('primary' | 'secondary' | 'danger' | 'outline' | 'ghost')
 * @param {string} props.size - Button size ('sm' | 'md' | 'lg')
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.icon - Icon element
 * @param {boolean} props.fullWidth - Full width button
 */
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  className,
  icon,
  fullWidth = false,
  type = "button",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-dark focus:ring-primary disabled:bg-gray-300",
    secondary:
      "bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary disabled:bg-gray-300",
    danger:
      "bg-danger text-white hover:bg-danger-dark focus:ring-danger disabled:bg-gray-300",
    outline:
      "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary disabled:border-gray-300 disabled:text-gray-300",
    ghost:
      "text-primary hover:bg-primary/10 focus:ring-primary disabled:text-gray-300",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        (disabled || loading) && "cursor-not-allowed opacity-60",
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
