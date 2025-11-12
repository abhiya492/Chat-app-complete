const ChatSkeleton = () => {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-base-300 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-base-300"></div>
          <div className="flex-1">
            <div className="h-4 bg-base-300 rounded w-32 mb-2"></div>
            <div className="h-3 bg-base-300 rounded w-20"></div>
          </div>
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className="flex items-start gap-2 max-w-[70%]">
              {i % 2 === 0 && <div className="size-8 rounded-full bg-base-300 animate-pulse"></div>}
              <div className="space-y-2">
                <div className={`h-16 bg-base-300 rounded-lg animate-pulse ${i % 2 === 0 ? 'w-48' : 'w-64'}`}></div>
                <div className="h-3 bg-base-300 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Skeleton */}
      <div className="p-4 border-t border-base-300 animate-pulse">
        <div className="h-12 bg-base-300 rounded-lg"></div>
      </div>
    </div>
  );
};

export default ChatSkeleton;
