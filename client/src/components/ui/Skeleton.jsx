const Skeleton = ({ variant = "text", className = "", count = 1 }) => {
  const base = "shimmer-bg rounded";

  const variants = {
    text: `${base} h-4 w-full rounded-lg`,
    title: `${base} h-6 w-3/4 rounded-lg`,
    avatar: `${base} h-10 w-10 rounded-full`,
    card: "",
    "table-row": "",
    image: `${base} h-48 w-full rounded-xl`,
  };

  if (variant === "card") {
    return (
      <div className={`bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl overflow-hidden ${className}`}>
        <div className="shimmer-bg h-48" />
        <div className="p-4 space-y-3">
          <div className="shimmer-bg h-5 w-3/4 rounded-lg" />
          <div className="shimmer-bg h-4 w-1/2 rounded-lg" />
          <div className="shimmer-bg h-4 w-1/3 rounded-lg" />
          <div className="flex justify-between pt-2">
            <div className="shimmer-bg h-5 w-24 rounded-lg" />
            <div className="shimmer-bg h-4 w-12 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "table-row") {
    return (
      <div className={`flex gap-4 items-center py-3 px-4 ${className}`}>
        <div className="shimmer-bg h-4 w-1/4 rounded-lg" />
        <div className="shimmer-bg h-4 w-1/3 rounded-lg" />
        <div className="shimmer-bg h-4 w-1/6 rounded-lg" />
        <div className="shimmer-bg h-4 w-1/6 rounded-lg" />
      </div>
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${variants[variant]} ${className}`} />
      ))}
    </>
  );
};

export default Skeleton;
