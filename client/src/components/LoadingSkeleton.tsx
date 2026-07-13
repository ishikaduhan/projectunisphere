const LoadingSkeleton = () => (
  <div className="skeleton-grid">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="skeleton-card" />
    ))}
  </div>
);

export default LoadingSkeleton;
