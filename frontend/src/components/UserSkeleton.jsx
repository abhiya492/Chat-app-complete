const UserSkeleton = () => {
  return (
    <div className="space-y-2 p-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-base-300 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-base-300 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-base-300 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserSkeleton;
