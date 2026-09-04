const badgeStyles = {
  Pending:
    "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/20",
  Approved:
    "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20",
  Active:
    "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20",
  Rejected:
    "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/20",
  Inactive:
    "bg-gray-100 dark:bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-500/20",
  Cancelled:
    "bg-gray-100 dark:bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-500/20",
  user: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/20",
  owner:
    "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/20",
  admin:
    "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/20",
  PG: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/20",
  Hostel:
    "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/20",
};

const Badge = ({ status, className = "", overlay = false }) => {
  const style =
    badgeStyles[status] ||
    "bg-gray-100 dark:bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-500/20";
  const overlayStyles = {
    Active: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Approved: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Pending: "bg-amber-100 text-amber-800 border-amber-300",
    Rejected: "bg-red-100 text-red-800 border-red-300",
    Inactive: "bg-gray-100 text-gray-800 border-gray-300",
    Cancelled: "bg-gray-100 text-gray-800 border-gray-300",
    PG: "bg-blue-100 text-blue-800 border-blue-300",
    Hostel: "bg-purple-100 text-purple-800 border-purple-300",
  };
  const appliedStyle = overlay
    ? overlayStyles[status] || overlayStyles.Inactive
    : style;
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        border capitalize ${appliedStyle} ${className}
      `}
    >
      {status}
    </span>
  );
};

export default Badge;
