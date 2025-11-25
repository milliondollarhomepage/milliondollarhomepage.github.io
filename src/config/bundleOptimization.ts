/**
 * Bundle optimization configuration and utilities
 */

// Dynamic import utilities for code splitting
export const dynamicImports = {
  /**
   * Lazy load heavy visualization components
   */
  loadDataVisualization: () => import('../components/DataVisualization'),
  
  /**
   * Lazy load export functionality
   */
  loadExportData: () => import('../components/ExportData'),
  
  /**
   * Lazy load advanced search features
   */
  loadAdvancedSearch: () => import('../components/SearchBox'),
  
  /**
   * Lazy load analytics utilities
   */
  loadAnalyticsUtils: () => import('../utils/index'),
  
  /**
   * Lazy load accessibility utilities when needed
   */
  loadA11yUtils: () => import('../utils/accessibility')
};

// Preload strategies
export const preloadStrategies = {
  /**
   * Preload critical components on idle
   */
  preloadCritical: () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        dynamicImports.loadDataVisualization();
      });
    } else {
      setTimeout(() => {
        dynamicImports.loadDataVisualization();
      }, 2000);
    }
  },

  /**
   * Preload components on user interaction
   */
  preloadOnInteraction: () => {
    const preloadOnFirstInteraction = () => {
      dynamicImports.loadExportData();
      dynamicImports.loadAdvancedSearch();
      
      // Remove listeners after first interaction
      document.removeEventListener('mousedown', preloadOnFirstInteraction);
      document.removeEventListener('touchstart', preloadOnFirstInteraction);
      document.removeEventListener('keydown', preloadOnFirstInteraction);
    };

    document.addEventListener('mousedown', preloadOnFirstInteraction, { passive: true });
    document.addEventListener('touchstart', preloadOnFirstInteraction, { passive: true });
    document.addEventListener('keydown', preloadOnFirstInteraction, { passive: true });
  },

  /**
   * Preload based on viewport visibility
   */
  preloadOnVisible: (element: HTMLElement, callback: () => void) => {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            callback();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      observer.observe(element);
    } else {
      // Fallback for older browsers
      callback();
    }
  }
};

// Resource optimization
export const resourceOptimization = {
  /**
   * Optimize images with lazy loading and responsive sizes
   */
  optimizeImages: () => {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback: load all images immediately
      images.forEach(img => {
        const image = img as HTMLImageElement;
        image.src = image.dataset.src || '';
        image.classList.remove('lazy');
      });
    }
  },

  /**
   * Optimize fonts loading
   */
  optimizeFonts: () => {
    // Use font-display: swap for better performance
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
        src: url('/fonts/inter.woff2') format('woff2');
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * Optimize CSS delivery
   */
  optimizeCSS: () => {
    // Load non-critical CSS asynchronously
    const loadCSS = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
      };
      document.head.appendChild(link);
    };

    // Load non-critical stylesheets
    if (document.readyState === 'complete') {
      loadCSS('/css/non-critical.css');
    } else {
      window.addEventListener('load', () => {
        loadCSS('/css/non-critical.css');
      });
    }
  }
};

// Performance monitoring
export const performanceMonitoring = {
  /**
   * Measure and report Core Web Vitals
   */
  measureCoreWebVitals: () => {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fidEntry = entry as any; // Type assertion for FID-specific properties
          console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        console.log('CLS:', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  },

  /**
   * Monitor bundle size and loading performance
   */
  monitorBundlePerformance: () => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        
        resources.forEach(resource => {
          if (resource.name.includes('.js') || resource.name.includes('.css')) {
            console.log(`${resource.name}: ${resource.transferSize} bytes, ${resource.duration}ms`);
          }
        });
      });
    }
  },

  /**
   * Monitor memory usage
   */
  monitorMemoryUsage: () => {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      console.log('Memory usage:', {
        used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) + ' MB',
        total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024) + ' MB',
        limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024) + ' MB'
      });
    }
  }
};

// Service Worker utilities
export const serviceWorkerUtils = {
  /**
   * Register service worker for caching
   */
  registerServiceWorker: async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Update service worker
   */
  updateServiceWorker: async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.update();
      }
    }
  },

  /**
   * Handle service worker updates
   */
  handleServiceWorkerUpdate: (callback: () => void) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', callback);
    }
  }
};

// Bundle analysis utilities
export const bundleAnalysis = {
  /**
   * Analyze bundle composition
   */
  analyzeBundleComposition: () => {
    const scripts = document.querySelectorAll('script[src]');
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    
    console.log('Bundle Analysis:', {
      scripts: scripts.length,
      styles: styles.length,
      totalResources: scripts.length + styles.length
    });
  },

  /**
   * Check for unused code
   */
  checkUnusedCode: () => {
    if ('coverage' in console) {
      console.log('Use Chrome DevTools Coverage tab to analyze unused code');
    }
  },

  /**
   * Analyze third-party dependencies
   */
  analyzeThirdPartyDependencies: () => {
    const thirdPartyDomains = new Set<string>();
    
    performance.getEntriesByType('resource').forEach(resource => {
      const url = new URL(resource.name);
      if (url.origin !== window.location.origin) {
        thirdPartyDomains.add(url.origin);
      }
    });
    
    console.log('Third-party domains:', Array.from(thirdPartyDomains));
  }
};

// Initialize bundle optimization
export const initializeBundleOptimization = () => {
  // Start preloading strategies
  preloadStrategies.preloadCritical();
  preloadStrategies.preloadOnInteraction();
  
  // Optimize resources
  resourceOptimization.optimizeImages();
  resourceOptimization.optimizeFonts();
  resourceOptimization.optimizeCSS();
  
  // Start performance monitoring
  performanceMonitoring.measureCoreWebVitals();
  performanceMonitoring.monitorBundlePerformance();
  
  // Register service worker if enabled (production check)
  const isProduction = !window.location.hostname.includes('localhost') &&
                      !window.location.hostname.includes('127.0.0.1');
  
  if (isProduction) {
    serviceWorkerUtils.registerServiceWorker();
  }
  
  // Development-only analysis
  if (!isProduction) {
    setTimeout(() => {
      bundleAnalysis.analyzeBundleComposition();
      bundleAnalysis.analyzeThirdPartyDependencies();
    }, 3000);
  }
};

export default {
  dynamicImports,
  preloadStrategies,
  resourceOptimization,
  performanceMonitoring,
  serviceWorkerUtils,
  bundleAnalysis,
  initializeBundleOptimization
};