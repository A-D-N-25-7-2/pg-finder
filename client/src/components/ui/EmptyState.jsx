import Button from "./Button";

const EmptyState = ({
  icon = "📭",
  title = "Nothing here yet",
  description = "",
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="text-6xl mb-4 animate-float">{icon}</div>
      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-500 text-sm mb-6 max-w-md mx-auto">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;
