const badgeStyles = {
  Pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Rejected: "bg-red-500/15 text-red-400 border-red-500/20",
  Inactive: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  Cancelled: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  user: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  owner: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  admin: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

const Badge = ({ status, className = "" }) => {
  const style = badgeStyles[status] || "bg-gray-500/15 text-gray-400 border-gray-500/20";
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        border capitalize ${style} ${className}
      `}
    >
      {status}
    </span>
  );
};

export default Badge;
