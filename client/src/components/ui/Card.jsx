const Card = ({ children, className = "", hover = false, glow = false, ...props }) => {
  return (
    <div
      className={`
        bg-dark-card border border-dark-border rounded-2xl
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
