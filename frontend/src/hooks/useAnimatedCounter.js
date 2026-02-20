import { useState, useEffect, useRef } from 'react';

/**
 * Animates a counter from 0 to targetValue when `shouldStart` becomes true.
 * Uses requestAnimationFrame with ease-out cubic easing.
 */
export function useAnimatedCounter(targetValue, shouldStart = false, options = {}) {
  const { duration = 2000, suffix = '' } = options;
  const [count, setCount] = useState(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!shouldStart) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCount(targetValue);
      return;
    }

    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.floor(eased * targetValue));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [shouldStart, targetValue, duration]);

  return { displayValue: `${count}${suffix}` };
}
