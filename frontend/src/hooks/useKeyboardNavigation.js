import { useEffect } from 'react';

export const useKeyboardNavigation = (items, onSelect, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      const currentIndex = items.findIndex(item => item.selected);
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = Math.min(currentIndex + 1, items.length - 1);
          onSelect(items[nextIndex], nextIndex);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = Math.max(currentIndex - 1, 0);
          onSelect(items[prevIndex], prevIndex);
          break;
        case 'Enter':
          e.preventDefault();
          if (currentIndex >= 0) {
            items[currentIndex].onEnter?.();
          }
          break;
        case 'Escape':
          e.preventDefault();
          items[currentIndex]?.onEscape?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, onSelect, enabled]);
};
