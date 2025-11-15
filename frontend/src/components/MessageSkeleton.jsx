const MessageSkeleton = () => {
  return (
    <div className="space-y-4 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
          <div className="w-10 h-10 rounded-full bg-base-300 animate-pulse flex-shrink-0" />
          <div className="flex flex-col gap-2 max-w-[70%]">
            <div className={`h-4 bg-base-300 rounded animate-pulse ${i % 3 === 0 ? 'w-32' : i % 3 === 1 ? 'w-48' : 'w-40'}`} />
            <div className={`h-16 bg-base-300 rounded-lg animate-pulse ${i % 2 === 0 ? 'w-64' : 'w-56'}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
