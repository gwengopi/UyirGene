import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook for scroll-triggered animations using Intersection Observer.
 * Uses a callback ref so it works with conditionally rendered elements.
 * Returns a ref to attach to the element and a boolean `isVisible`.
 */
export function useScrollAnimation(options = {}) {
  const { threshold = 0.15, rootMargin = '0px', triggerOnce = true } = options;
  const [node, setNode] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const ref = useCallback((el) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (!node) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(node);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}
