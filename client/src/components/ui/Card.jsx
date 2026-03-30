const Card = ({ children, className = "", hover = false, glow = false, ...props }) => {
  return (
    <div
      className={`
        bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl
        ${hover ? "card-glow cursor-pointer" : ""}
        ${glow ? "animate-pulse-glow" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
