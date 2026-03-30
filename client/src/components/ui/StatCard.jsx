const StatCard = ({ label, value, icon, trend, color = "blue" }) => {
  const colors = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
    green: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
    orange: "from-amber-500/20 to-amber-600/5 border-amber-500/20",
    pink: "from-pink-500/20 to-pink-600/5 border-pink-500/20",
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20",
  };

  return (
    <div
      className={`
        bg-gradient-to-br ${colors[color]}
        border rounded-2xl p-5 transition-all duration-300
        hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20
      `}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value ?? "—"}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
};

export default StatCard;
