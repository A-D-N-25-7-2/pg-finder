import AppIcon from "./AppIcon";

const StatCard = ({ label, value, icon, trend, color = "blue" }) => {
  const colors = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
    green: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
    orange: "from-amber-500/20 to-amber-600/5 border-amber-500/20",
    pink: "from-pink-500/20 to-pink-600/5 border-pink-500/20",
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20",
  };
  const iconColors = {
    blue: "text-blue-800 dark:text-blue-700",
    purple: "text-purple-800 dark:text-purple-700",
    green: "text-emerald-800 dark:text-emerald-700",
    orange: "text-amber-800 dark:text-amber-700",
    pink: "text-pink-800 dark:text-pink-700",
    cyan: "text-cyan-800 dark:text-cyan-700",
  };

  return (
    <div
      className={`
        bg-gradient-to-br ${colors[color]}
        stat-card border rounded-2xl p-5
      `}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {value ?? "—"}
          </p>
          {trend && (
            <p
              className={`text-xs mt-1 ${trend > 0 ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
            >
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <span className={iconColors[color] || iconColors.blue}>
          <AppIcon name={icon} size={30} />
        </span>
      </div>
    </div>
  );
};

export default StatCard;
