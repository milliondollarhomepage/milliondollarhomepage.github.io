/**
 * Accessibility utilities for better user experience
 */

/**
 * Generate unique IDs for accessibility attributes
 */
export const generateId = (() => {
  let counter = 0;
  return (prefix = 'mdh') => `${prefix}-${++counter}`;
})();

/**
 * Announce messages to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Focus management utilities
 */
export const focusUtils = {
  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'details summary',
      'audio[controls]',
      'video[controls]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  },

  /**
   * Trap focus within a container
   */
  trapFocus: (container: HTMLElement, event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const focusableElements = focusUtils.getFocusableElements(container);
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
  },

  /**
   * Focus the first focusable element in a container
   */
  focusFirst: (container: HTMLElement): boolean => {
    const focusableElements = focusUtils.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return true;
    }
    return false;
  },

  /**
   * Restore focus to a previously focused element
   */
  restoreFocus: (element: HTMLElement | null) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }
};

/**
 * ARIA utilities
 */
export const ariaUtils = {
  /**
   * Set ARIA attributes on an element
   */
  setAttributes: (element: HTMLElement, attributes: Record<string, string | boolean | null>) => {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value === null) {
        element.removeAttribute(key);
      } else {
        element.setAttribute(key, String(value));
      }
    });
  },

  /**
   * Toggle ARIA expanded state
   */
  toggleExpanded: (element: HTMLElement, expanded?: boolean) => {
    const currentState = element.getAttribute('aria-expanded') === 'true';
    const newState = expanded !== undefined ? expanded : !currentState;
    element.setAttribute('aria-expanded', String(newState));
    return newState;
  },

  /**
   * Set ARIA pressed state for toggle buttons
   */
  setPressed: (element: HTMLElement, pressed: boolean) => {
    element.setAttribute('aria-pressed', String(pressed));
  },

  /**
   * Set ARIA selected state
   */
  setSelected: (element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', String(selected));
  },

  /**
   * Set ARIA hidden state
   */
  setHidden: (element: HTMLElement, hidden: boolean) => {
    if (hidden) {
      element.setAttribute('aria-hidden', 'true');
    } else {
      element.removeAttribute('aria-hidden');
    }
  },

  /**
   * Create ARIA describedby relationship
   */
  createDescribedBy: (element: HTMLElement, descriptionId: string) => {
    const existingDescribedBy = element.getAttribute('aria-describedby');
    const describedByIds = existingDescribedBy 
      ? `${existingDescribedBy} ${descriptionId}`
      : descriptionId;
    element.setAttribute('aria-describedby', describedByIds);
  },

  /**
   * Create ARIA labelledby relationship
   */
  createLabelledBy: (element: HTMLElement, labelId: string) => {
    element.setAttribute('aria-labelledby', labelId);
  }
};

/**
 * Keyboard navigation utilities
 */
export const keyboardUtils = {
  /**
   * Handle arrow key navigation in a list
   */
  handleArrowNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    options: {
      loop?: boolean;
      orientation?: 'horizontal' | 'vertical' | 'both';
    } = {}
  ): number => {
    const { loop = true, orientation = 'vertical' } = options;
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (loop ? 0 : currentIndex);
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? items.length - 1 : currentIndex);
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (loop ? 0 : currentIndex);
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? items.length - 1 : currentIndex);
        }
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
    }

    if (newIndex !== currentIndex && items[newIndex]) {
      items[newIndex].focus();
    }

    return newIndex;
  },

  /**
   * Check if an element is focusable
   */
  isFocusable: (element: HTMLElement): boolean => {
    if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
      return false;
    }

    const tabIndex = element.getAttribute('tabindex');
    if (tabIndex === '-1') return false;

    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }

    return true;
  }
};

/**
 * Color contrast utilities
 */
export const contrastUtils = {
  /**
   * Calculate relative luminance of a color
   */
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1: [number, number, number], color2: [number, number, number]): number => {
    const lum1 = contrastUtils.getLuminance(...color1);
    const lum2 = contrastUtils.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if color combination meets WCAG contrast requirements
   */
  meetsContrastRequirement: (
    color1: [number, number, number],
    color2: [number, number, number],
    level: 'AA' | 'AAA' = 'AA',
    size: 'normal' | 'large' = 'normal'
  ): boolean => {
    const ratio = contrastUtils.getContrastRatio(color1, color2);
    
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    } else {
      return size === 'large' ? ratio >= 3 : ratio >= 4.5;
    }
  }
};

/**
 * Screen reader utilities
 */
export const screenReaderUtils = {
  /**
   * Create screen reader only text
   */
  createSROnlyText: (text: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.className = 'sr-only';
    span.textContent = text;
    return span;
  },

  /**
   * Add screen reader context to interactive elements
   */
  addContext: (element: HTMLElement, context: string) => {
    const contextId = generateId('context');
    const contextElement = screenReaderUtils.createSROnlyText(context);
    contextElement.id = contextId;
    
    element.parentNode?.insertBefore(contextElement, element);
    ariaUtils.createDescribedBy(element, contextId);
  },

  /**
   * Announce dynamic content changes
   */
  announceChange: (message: string, element?: HTMLElement) => {
    if (element) {
      const announcement = screenReaderUtils.createSROnlyText(message);
      announcement.setAttribute('aria-live', 'polite');
      element.appendChild(announcement);
      
      setTimeout(() => {
        element.removeChild(announcement);
      }, 1000);
    } else {
      announceToScreenReader(message);
    }
  }
};

/**
 * Reduced motion utilities
 */
export const motionUtils = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get animation duration based on user preference
   */
  getAnimationDuration: (normalDuration: number): number => {
    return motionUtils.prefersReducedMotion() ? 0 : normalDuration;
  },

  /**
   * Apply animation with respect to user preferences
   */
  safeAnimate: (
    element: HTMLElement,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions
  ): Animation | null => {
    if (motionUtils.prefersReducedMotion()) {
      // Apply final state immediately
      const finalKeyframe = keyframes[keyframes.length - 1];
      Object.assign(element.style, finalKeyframe);
      return null;
    }
    
    return element.animate(keyframes, options);
  }
};

/**
 * High contrast mode utilities
 */
export const highContrastUtils = {
  /**
   * Check if high contrast mode is enabled
   */
  isHighContrastMode: (): boolean => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  /**
   * Apply high contrast styles
   */
  applyHighContrastStyles: (element: HTMLElement) => {
    if (highContrastUtils.isHighContrastMode()) {
      element.classList.add('high-contrast');
    }
  }
};

/**
 * Export all accessibility utilities
 */
export const a11y = {
  generateId,
  announceToScreenReader,
  focus: focusUtils,
  aria: ariaUtils,
  keyboard: keyboardUtils,
  contrast: contrastUtils,
  screenReader: screenReaderUtils,
  motion: motionUtils,
  highContrast: highContrastUtils
};

export default a11y;