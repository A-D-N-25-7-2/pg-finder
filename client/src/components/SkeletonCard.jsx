const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl overflow-hidden">
      <div className="shimmer-bg h-48" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="shimmer-bg h-4 w-2/3 rounded-lg" />
          <div className="shimmer-bg h-4 w-16 rounded-lg" />
        </div>
        <div className="shimmer-bg h-3 w-1/2 rounded-lg" />
        <div className="shimmer-bg h-3 w-1/3 rounded-lg" />
        <div className="flex justify-between items-center pt-1">
          <div className="shimmer-bg h-5 w-24 rounded-lg" />
          <div className="shimmer-bg h-4 w-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}; 

export default SkeletonCard;
