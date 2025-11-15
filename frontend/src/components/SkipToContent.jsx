const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded-lg focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;
