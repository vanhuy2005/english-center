import React from "react";
import { clsx } from "clsx";

/**
 * Loading Component
 * @param {object} props
 * @param {string} props.size - Size ('sm' | 'md' | 'lg')
 * @param {string} props.text - Loading text
 * @param {boolean} props.fullScreen - Full screen overlay
 */
export const Loading = ({
  size = "md",
  text,
  fullScreen = false,
  className,
}) => {
  const sizes = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={clsx(
          "animate-spin rounded-full border-gray-200 border-t-primary",
          sizes[size],
          className
        )}
      />
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-8">{spinner}</div>;
};

/**
 * Skeleton Loading Component
 */
export const Skeleton = ({ width, height, className, circle = false }) => {
  return (
    <div
      className={clsx(
        "animate-pulse bg-gray-200",
        circle ? "rounded-full" : "rounded",
        className
      )}
      style={{ width, height }}
    />
  );
};

export default Loading;
