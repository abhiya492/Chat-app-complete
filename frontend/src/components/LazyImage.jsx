import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import ImageLightbox from './ImageLightbox';

const LazyImage = ({ src, alt, className, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      setShowLightbox(true);
    }
  };

  return (
    <>
      <div ref={ref} className={`relative ${className}`}>
        {!isLoaded && (
          <div className="absolute inset-0 bg-base-300 animate-pulse rounded-md" />
        )}
        {inView && (
          <img
            src={src}
            alt={alt}
            className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 cursor-pointer hover:opacity-90`}
            onLoad={() => setIsLoaded(true)}
            onClick={handleClick}
            loading="lazy"
          />
        )}
      </div>
      {showLightbox && <ImageLightbox src={src} alt={alt} onClose={() => setShowLightbox(false)} />}
    </>
  );
};

export default LazyImage;
