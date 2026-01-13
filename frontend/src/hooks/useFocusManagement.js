import { useEffect, useRef, useCallback } from 'react';
import { trapFocus } from '../utils/a11yUtils';

/**
 * Hook for managing focus within a container
 * Useful for modals, dialogs, and dropdown menus
 */
export function useFocusTrap(isActive = true) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement;

    // Focus the first focusable element in the container
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Set up focus trap
    const cleanup = trapFocus(containerRef.current);

    return () => {
      cleanup();
      // Restore focus to the previously focused element
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for managing focus on route changes
 */
export function useFocusOnMount() {
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.focus();
    }
  }, []);

  return elementRef;
}

/**
 * Hook for managing focus when an element becomes visible
 */
export function useFocusWhenVisible(isVisible) {
  const elementRef = useRef(null);

  useEffect(() => {
    if (isVisible && elementRef.current) {
      elementRef.current.focus();
    }
  }, [isVisible]);

  return elementRef;
}

/**
 * Hook for arrow key navigation within a list
 */
export function useArrowNavigation(items, options = {}) {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const activeIndexRef = useRef(0);

  const handleKeyDown = useCallback(
    (e) => {
      const isVertical = orientation === 'vertical';
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';

      if (e.key === prevKey) {
        e.preventDefault();
        if (activeIndexRef.current > 0) {
          activeIndexRef.current--;
        } else if (loop) {
          activeIndexRef.current = items.length - 1;
        }
        items[activeIndexRef.current]?.focus();
      } else if (e.key === nextKey) {
        e.preventDefault();
        if (activeIndexRef.current < items.length - 1) {
          activeIndexRef.current++;
        } else if (loop) {
          activeIndexRef.current = 0;
        }
        items[activeIndexRef.current]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        activeIndexRef.current = 0;
        items[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        activeIndexRef.current = items.length - 1;
        items[items.length - 1]?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect?.(activeIndexRef.current);
      }
    },
    [items, orientation, loop, onSelect]
  );

  return { handleKeyDown, activeIndexRef };
}

/**
 * Hook for managing roving tabindex
 */
export function useRovingTabIndex(itemCount, initialIndex = 0) {
  const activeIndexRef = useRef(initialIndex);

  const getTabIndex = useCallback(
    (index) => {
      return index === activeIndexRef.current ? 0 : -1;
    },
    []
  );

  const setActiveIndex = useCallback((index) => {
    activeIndexRef.current = index;
  }, []);

  return { getTabIndex, setActiveIndex, activeIndex: activeIndexRef.current };
}

export default useFocusTrap;
