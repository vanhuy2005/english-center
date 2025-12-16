import React, { useEffect } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";

/**
 * Modal Component
 * @param {object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} props.footer - Modal footer
 * @param {string} props.size - Modal size ('sm' | 'md' | 'lg' | 'xl')
 * @param {boolean} props.closeOnOverlay - Close modal on overlay click
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
  className,
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4",
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleOverlayClick}
      style={{
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <div
        className={clsx(
          "bg-white rounded-lg shadow-2xl w-full",
          sizes[size],
          className
        )}
        style={{
          animation: "slideUp 0.3s ease-out",
        }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xl font-semibold text-[#132440]">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto bg-white text-gray-900">
          {children || <p className="text-gray-500">Không có nội dung</p>}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
