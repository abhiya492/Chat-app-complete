const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        <span className="size-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="size-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="size-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
      <span className="text-sm text-base-content/60">typing...</span>
    </div>
  );
};

export default TypingIndicator;
