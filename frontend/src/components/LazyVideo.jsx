import { useInView } from 'react-intersection-observer';

const LazyVideo = ({ src, className }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref} className={className}>
      {inView ? (
        <video
          src={src}
          controls
          className={className}
          preload="metadata"
        />
      ) : (
        <div className={`${className} bg-base-300 animate-pulse rounded-md flex items-center justify-center`}>
          <span className="text-xs text-base-content/50">Loading video...</span>
        </div>
      )}
    </div>
  );
};

export default LazyVideo;
