import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

const LazyImage = ({ src, alt, className, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref} className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-base-300 animate-pulse rounded-md" />
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={() => setIsLoaded(true)}
          onClick={onClick}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;
