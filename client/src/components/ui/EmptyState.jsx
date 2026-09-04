import Button from "./Button";
import AppIcon from "./AppIcon";

const EmptyState = ({
  icon = "info",
  title = "Nothing here yet",
  description = "",
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="text-gray-950 dark:text-white mb-4 animate-float">
        <AppIcon name={icon} size={52} strokeWidth={1.7} className="mx-auto" />
      </div>
      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-500 text-sm mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;
