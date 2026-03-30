import { forwardRef } from "react";

const Input = forwardRef(
  ({ label, error, icon: Icon, className = "", type = "text", ...props }, ref) => {
    const baseInputClasses = `
      w-full bg-white dark:bg-dark-elevated border border-gray-300 dark:border-dark-border rounded-xl px-4 py-3
      text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
      focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50
      transition-all duration-200
    `;

    const errorClasses = error ? "border-red-500/50 focus:ring-red-500/40" : "";

    if (type === "textarea") {
      return (
        <div className="w-full">
          {label && (
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
              {label}
            </label>
          )}
          <div className="relative">
            <textarea
              ref={ref}
              className={`${baseInputClasses} resize-none ${errorClasses} ${className}`}
              {...props}
            />
          </div>
          {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
        </div>
      );
    }

    if (type === "select") {
      return (
        <div className="w-full">
          {label && (
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
              {label}
            </label>
          )}
          <select
            ref={ref}
            className={`${baseInputClasses} appearance-none cursor-pointer ${errorClasses} ${className}`}
            {...props}
          />
          {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
        </div>
      );
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`
              ${baseInputClasses}
              ${Icon ? "pl-10" : "pl-4"} pr-4
              ${errorClasses}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
