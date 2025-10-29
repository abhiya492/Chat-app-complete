const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-fade-in">
      <div className="flex gap-1.5 bg-base-200/80 px-4 py-2.5 rounded-2xl shadow-md">
        <span className="size-2.5 bg-gradient-to-r from-primary to-primary/70 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0ms' }}></span>
        <span className="size-2.5 bg-gradient-to-r from-primary to-primary/70 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '150ms' }}></span>
        <span className="size-2.5 bg-gradient-to-r from-primary to-primary/70 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '300ms' }}></span>
      </div>
      <span className="text-sm text-base-content/60 font-medium italic">typing...</span>
    </div>
  );
};

export default TypingIndicator;