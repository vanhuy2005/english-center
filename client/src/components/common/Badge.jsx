import React from "react";
import { clsx } from "clsx";

/**
 * Badge Component
 * @param {object} props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.variant - Badge variant ('primary' | 'success' | 'warning' | 'danger' | 'info')
 * @param {string} props.size - Badge size ('sm' | 'md' | 'lg')
 * @param {boolean} props.dot - Show as dot badge
 */
export const Badge = ({
  children,
  variant = "primary",
  size = "md",
  dot = false,
  className,
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-full";

  const variants = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-danger/10 text-danger",
    info: "bg-blue-100 text-blue-800",
    secondary: "bg-secondary/10 text-secondary",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  };

  if (dot) {
    return (
      <span
        className={clsx("inline-block w-2 h-2 rounded-full", variants[variant])}
      />
    );
  }

  return (
    <span
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
    >
      {children}
    </span>
  );
};

export default Badge;
