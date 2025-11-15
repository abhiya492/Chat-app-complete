const LoadingSpinner = ({ size = "md", text = "" }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={`${sizes[size]} border-4 border-primary/30 border-t-primary rounded-full animate-spin`}></div>
      {text && <p className="text-sm text-base-content/70">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
