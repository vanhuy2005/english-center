import * as React from "react";
import { clsx } from "clsx";
import { cn } from "@lib/utils";

/**
 * Card Component - Unified shadcn/ui + custom implementation
 */
const Card = React.forwardRef(
  (
    {
      className,
      title,
      header,
      footer,
      hover = false,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    // If used with sub-components (shadcn style)
    if (!title && !header && !footer) {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-xl border bg-card text-card-foreground shadow-sm",
            hover &&
              "transition-shadow duration-300 hover:shadow-lg cursor-pointer",
            className
          )}
          onClick={onClick}
          {...props}
        >
          {children}
        </div>
      );
    }

    // Legacy custom card with title/header/footer props
    return (
      <div
        ref={ref}
        className={clsx(
          "bg-white rounded-lg shadow-card p-6",
          hover &&
            "transition-shadow duration-300 hover:shadow-card-hover cursor-pointer",
          className
        )}
        onClick={onClick}
        {...props}
      >
        {(title || header) && (
          <div className="mb-4 border-b border-gray-200 pb-3">
            {header || (
              <h3 className="text-lg font-semibold text-primary">{title}</h3>
            )}
          </div>
        )}
        <div className="card-content">{children}</div>
        {footer && (
          <div className="mt-4 border-t border-gray-200 pt-3">{footer}</div>
        )}
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
export default Card;
