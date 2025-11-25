import { useEffect, useCallback, useRef } from 'react';

interface KeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  onSpace?: () => void;
  enabled?: boolean;
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions) => {
  const {
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    onSpace,
    enabled = true
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    switch (event.key) {
      case 'Escape':
        onEscape?.();
        break;
      case 'Enter':
        onEnter?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onArrowRight?.();
        break;
      case 'Tab':
        if (event.shiftKey) {
          onShiftTab?.();
        } else {
          onTab?.();
        }
        break;
      case ' ':
        event.preventDefault();
        onSpace?.();
        break;
    }
  }, [enabled, onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab, onShiftTab, onSpace]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
};

interface FocusManagementOptions {
  autoFocus?: boolean;
  restoreFocus?: boolean;
  trapFocus?: boolean;
}

export const useFocusManagement = (
  containerRef: React.RefObject<HTMLElement>,
  options: FocusManagementOptions = {}
) => {
  const { autoFocus = false, restoreFocus = false, trapFocus = false } = options;
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (autoFocus && containerRef.current) {
      previousActiveElement.current = document.activeElement;
      
      // Focus the first focusable element
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    return () => {
      if (restoreFocus && previousActiveElement.current) {
        (previousActiveElement.current as HTMLElement).focus?.();
      }
    };
  }, [autoFocus, restoreFocus, containerRef]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!trapFocus || !containerRef.current) return;

    if (event.key === 'Tab') {
      const focusableElements = getFocusableElements(containerRef.current);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }, [trapFocus, containerRef]);

  useEffect(() => {
    if (trapFocus) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, trapFocus]);
};

// Helper function to get all focusable elements
const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
};

// Hook for managing list navigation (like search results)
export const useListNavigation = (
  items: any[],
  onSelect: (index: number) => void,
  options: {
    loop?: boolean;
    initialIndex?: number;
  } = {}
) => {
  const { loop = true, initialIndex = -1 } = options;
  const currentIndex = useRef(initialIndex);

  const navigateUp = useCallback(() => {
    if (items.length === 0) return;
    
    currentIndex.current = currentIndex.current <= 0 
      ? (loop ? items.length - 1 : 0)
      : currentIndex.current - 1;
    
    onSelect(currentIndex.current);
  }, [items.length, loop, onSelect]);

  const navigateDown = useCallback(() => {
    if (items.length === 0) return;
    
    currentIndex.current = currentIndex.current >= items.length - 1
      ? (loop ? 0 : items.length - 1)
      : currentIndex.current + 1;
    
    onSelect(currentIndex.current);
  }, [items.length, loop, onSelect]);

  const selectCurrent = useCallback(() => {
    if (currentIndex.current >= 0 && currentIndex.current < items.length) {
      onSelect(currentIndex.current);
    }
  }, [items.length, onSelect]);

  const resetIndex = useCallback(() => {
    currentIndex.current = initialIndex;
  }, [initialIndex]);

  return {
    currentIndex: currentIndex.current,
    navigateUp,
    navigateDown,
    selectCurrent,
    resetIndex
  };
};

// Global keyboard shortcuts hook
export const useGlobalKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K for search focus
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }

      // Ctrl/Cmd + E for export
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        const exportButton = document.querySelector('[aria-label*="Export"]') as HTMLButtonElement;
        exportButton?.click();
      }

      // Escape to clear search/close modals
      if (event.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement?.tagName === 'INPUT') {
          activeElement.blur();
        }
        
        // Close any open dropdowns or modals
        const openDropdowns = document.querySelectorAll('[aria-expanded="true"]');
        openDropdowns.forEach(dropdown => {
          if (dropdown instanceof HTMLElement) {
            dropdown.click();
          }
        });
      }

      // F for filters toggle
      if (event.key === 'f' && !event.ctrlKey && !event.metaKey) {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          const filterButton = document.querySelector('[aria-controls*="filter"]') as HTMLButtonElement;
          filterButton?.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};