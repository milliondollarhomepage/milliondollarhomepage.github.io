/**
 * Custom React hooks for the Million Dollar Homepage Analytics application
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { DomainAnalytics, LoadingState, AppError } from '../types';
import { SEARCH_CONSTANTS } from '../constants';

/**
 * Hook for managing async operations with loading states
 */
export function useAsyncOperation<T>() {
  const [state, setState] = useState<LoadingState & { data?: T }>({
    isLoading: false,
    progress: 0,
    data: undefined,
    error: undefined
  });

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options?: {
      onProgress?: (progress: number) => void;
      timeout?: number;
    }
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined, progress: 0 }));

    try {
      const controller = new AbortController();
      const timeoutId = options?.timeout 
        ? window.setTimeout(() => controller.abort(), options.timeout)
        : undefined;

      // Simulate progress updates
      const progressInterval = window.setInterval(() => {
        setState(prev => {
          const newProgress = Math.min(prev.progress + 10, 90);
          options?.onProgress?.(newProgress);
          return { ...prev, progress: newProgress };
        });
      }, 100);

      const result = await operation();

      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(progressInterval);

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        progress: 100, 
        data: result 
      }));

      // Clear progress after a delay
      setTimeout(() => {
        setState(prev => ({ ...prev, progress: 0 }));
      }, 500);

      return result;
    } catch (error) {
      const appError: AppError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        retryable: true
      };

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        progress: 0, 
        error: appError 
      }));

      throw appError;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      data: undefined,
      error: undefined
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

/**
 * Hook for debounced values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttled callbacks
 */
export function useThrottle<T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number
): (...args: T) => void {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<number>();

  return useCallback((...args: T) => {
    const now = Date.now();
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        lastCall.current = Date.now();
        callback(...args);
      }, delay - (now - lastCall.current));
    }
  }, [callback, delay]);
}

/**
 * Hook for managing local storage with type safety
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(defaultValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing online/offline status
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook for managing viewport dimensions
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

/**
 * Hook for managing previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

/**
 * Hook for managing intersection observer
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return { isIntersecting, entry };
}

/**
 * Hook for managing ResizeObserver
 */
export function useResizeObserver<T extends Element>(
  callback: (entry: ResizeObserverEntry) => void
) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      entries.forEach(callback);
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [callback]);

  return elementRef;
}

/**
 * Hook for managing search functionality
 */
export function useSearch<T>(
  items: readonly T[],
  searchFn: (items: readonly T[], query: string) => readonly T[],
  initialQuery = ''
) {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedQuery = useDebounce(query, SEARCH_CONSTANTS.DEBOUNCE_DELAY);
  
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return items;
    
    setIsSearching(true);
    const searchResults = searchFn(items, debouncedQuery);
    setIsSearching(false);
    
    return searchResults;
  }, [items, searchFn, debouncedQuery]);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    clearSearch,
    hasQuery: debouncedQuery.trim().length > 0
  };
}

/**
 * Hook for managing domain analytics
 */
export function useDomainAnalytics(domain: string | null) {
  const [analytics, setAnalytics] = useState<DomainAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (domainToFetch: string) => {
    if (!domainToFetch) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would be replaced with actual API call
      // For now, we'll simulate the fetch
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock analytics data
      const mockAnalytics: DomainAnalytics = {
        domain: domainToFetch,
        dns_status: 'NOERROR',
        http_status: 200,
        whois_status: 'registered',
        analyzed_at: new Date().toISOString(),
        registered_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        expiry_date: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        last_updated: new Date().toISOString(),
        nameservers: ['ns1.example.com', 'ns2.example.com']
      };

      setAnalytics(mockAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (domain) {
      fetchAnalytics(domain);
    } else {
      setAnalytics(null);
      setError(null);
    }
  }, [domain, fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: () => domain && fetchAnalytics(domain)
  };
}

/**
 * Hook for managing performance metrics
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0
  });

  const measureRender = useCallback((callback: () => void) => {
    const start = performance.now();
    callback();
    const end = performance.now();
    
    setMetrics(prev => ({
      ...prev,
      renderTime: end - start
    }));
  }, []);

  const measureLoad = useCallback((callback: () => Promise<void>) => {
    const start = performance.now();
    
    return callback().finally(() => {
      const end = performance.now();
      setMetrics(prev => ({
        ...prev,
        loadTime: end - start
      }));
    });
  }, []);

  useEffect(() => {
    // Measure memory usage if available
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memoryInfo.usedJSHeapSize / 1024 / 1024 // Convert to MB
      }));
    }
  }, []);

  return {
    metrics,
    measureRender,
    measureLoad
  };
}

// Export all hooks
export * from './useKeyboardNavigation';