/**
 * Utility functions for the Million Dollar Homepage Analytics application
 */

import { AreaData, DomainAnalytics } from '../types';
import { VALIDATION_RULES, DNS_STATUS, HTTP_STATUS, WHOIS_STATUS } from '../constants';

// Domain and URL utilities
export const domainUtils = {
  /**
   * Parse domain from href with better error handling
   */
  parseDomain: (href: string): string => {
    if (!href || typeof href !== 'string') return '';
    
    try {
      const url = new URL(href);
      return url.hostname.replace(/^www\./, '');
    } catch {
      // If URL parsing fails, try to extract domain from href
      const match = href.match(/\/\/(?:www\.)?([^/]+)/);
      return match ? match[1] : href;
    }
  },

  /**
   * Validate domain name format
   */
  isValidDomain: (domain: string): boolean => {
    if (!domain || typeof domain !== 'string') return false;
    
    const length = domain.length;
    if (length < VALIDATION_RULES.DOMAIN_MIN_LENGTH || length > VALIDATION_RULES.DOMAIN_MAX_LENGTH) {
      return false;
    }
    
    // Basic domain validation regex
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
  },

  /**
   * Extract top-level domain
   */
  getTLD: (domain: string): string => {
    if (!domain) return '';
    const parts = domain.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  },

  /**
   * Check if domain is likely a subdomain
   */
  isSubdomain: (domain: string): boolean => {
    if (!domain) return false;
    const parts = domain.split('.');
    return parts.length > 2;
  }
};

// Coordinate and geometry utilities
export const coordinateUtils = {
  /**
   * Parse coordinates from HTML map area format (x1,y1,x2,y2) to rectangle format
   */
  parseMapCoordinates: (coords: string): { x: number; y: number; width: number; height: number } | null => {
    if (!coords || typeof coords !== 'string') return null;
    
    const coordArray = coords.split(',').map(Number);
    if (coordArray.length !== 4 || coordArray.some(isNaN)) return null;
    
    const [x1, y1, x2, y2] = coordArray;
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    
    return { x, y, width, height };
  },

  /**
   * Validate coordinates are within bounds
   */
  isValidCoordinate: (x: number, y: number, width: number, height: number, maxWidth = 1000, maxHeight = 1000): boolean => {
    return x >= VALIDATION_RULES.COORDINATE_MIN && 
           y >= VALIDATION_RULES.COORDINATE_MIN && 
           x + width <= maxWidth && 
           y + height <= maxHeight && 
           width > 0 && 
           height > 0;
  },

  /**
   * Calculate area of a rectangle
   */
  calculateArea: (width: number, height: number): number => {
    return Math.max(0, width * height);
  },

  /**
   * Check if two rectangles overlap
   */
  rectanglesOverlap: (
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean => {
    return !(rect1.x + rect1.width <= rect2.x || 
             rect2.x + rect2.width <= rect1.x || 
             rect1.y + rect1.height <= rect2.y || 
             rect2.y + rect2.height <= rect1.y);
  },

  /**
   * Calculate center point of a rectangle
   */
  getRectangleCenter: (rect: { x: number; y: number; width: number; height: number }): { x: number; y: number } => {
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
  }
};

// Date and time utilities
export const dateUtils = {
  /**
   * Format date string to localized format
   */
  formatDate: (dateString: string, locale = 'en-US'): string => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  },

  /**
   * Format date to relative time (e.g., "2 days ago")
   */
  formatRelativeTime: (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 30) return `${diffInDays} days ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      return `${Math.floor(diffInDays / 365)} years ago`;
    } catch {
      return 'Invalid date';
    }
  },

  /**
   * Check if date is valid
   */
  isValidDate: (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  },

  /**
   * Get time until expiry
   */
  getTimeUntilExpiry: (expiryDate: string): string => {
    if (!expiryDate) return 'N/A';
    
    try {
      const expiry = new Date(expiryDate);
      const now = new Date();
      const diffInMs = expiry.getTime() - now.getTime();
      
      if (diffInMs <= 0) return 'Expired';
      
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      if (diffInDays < 30) return `${diffInDays} days`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months`;
      return `${Math.floor(diffInDays / 365)} years`;
    } catch {
      return 'Invalid date';
    }
  }
};

// Analytics utilities
export const analyticsUtils = {
  /**
   * Get status color class based on status type and value
   */
  getStatusColor: (status: string | number, type: 'dns' | 'http' | 'whois'): string => {
    switch (type) {
      case 'dns':
        return status === DNS_STATUS.NO_ERROR ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
      case 'http':
        return status === HTTP_STATUS.OK ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
      case 'whois':
        return status === WHOIS_STATUS.REGISTERED ? 'text-blue-600 bg-blue-50' : 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  },

  /**
   * Check if domain analytics indicate a healthy domain
   */
  isDomainHealthy: (analytics: DomainAnalytics | null): boolean => {
    if (!analytics) return false;
    
    return analytics.dns_status === DNS_STATUS.NO_ERROR &&
           analytics.http_status === HTTP_STATUS.OK &&
           analytics.whois_status === WHOIS_STATUS.REGISTERED;
  },

  /**
   * Get domain health score (0-100)
   */
  getDomainHealthScore: (analytics: DomainAnalytics | null): number => {
    if (!analytics) return 0;
    
    let score = 0;
    
    // DNS status (40 points)
    if (analytics.dns_status === DNS_STATUS.NO_ERROR) score += 40;
    
    // HTTP status (30 points)
    if (analytics.http_status === HTTP_STATUS.OK) score += 30;
    else if (analytics.http_status >= 200 && analytics.http_status < 400) score += 20;
    
    // WHOIS status (20 points)
    if (analytics.whois_status === WHOIS_STATUS.REGISTERED) score += 20;
    
    // Nameservers (10 points)
    if (analytics.nameservers && analytics.nameservers.length > 0) score += 10;
    
    return Math.min(100, score);
  },

  /**
   * Categorize domains by health status
   */
  categorizeDomainsByHealth: (areas: readonly AreaData[]): {
    healthy: AreaData[];
    warning: AreaData[];
    critical: AreaData[];
    unknown: AreaData[];
  } => {
    const result = {
      healthy: [] as AreaData[],
      warning: [] as AreaData[],
      critical: [] as AreaData[],
      unknown: [] as AreaData[]
    };
    
    areas.forEach(area => {
      const score = analyticsUtils.getDomainHealthScore(area.analytics);
      
      if (!area.hasAnalytics) {
        result.unknown.push(area);
      } else if (score >= 80) {
        result.healthy.push(area);
      } else if (score >= 50) {
        result.warning.push(area);
      } else {
        result.critical.push(area);
      }
    });
    
    return result;
  }
};

// Search and filter utilities
export const searchUtils = {
  /**
   * Create a debounced search function
   */
  createDebouncedSearch: <T extends unknown[]>(
    searchFn: (...args: T) => void,
    delay: number
  ): ((...args: T) => void) => {
    let timeoutId: number;
    
    return (...args: T) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => searchFn(...args), delay);
    };
  },

  /**
   * Highlight search terms in text
   */
  highlightSearchTerms: (text: string, searchTerm: string): string => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },

  /**
   * Extract search suggestions from domains
   */
  getSearchSuggestions: (areas: readonly AreaData[], query: string, limit = 5): string[] => {
    if (!query || query.length < 2) return [];
    
    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();
    
    areas.forEach(area => {
      const domain = area.domain.toLowerCase();
      const title = area.title.toLowerCase();
      
      // Add domain if it starts with query
      if (domain.startsWith(lowerQuery)) {
        suggestions.add(area.domain);
      }
      
      // Add words from title that start with query
      title.split(/\s+/).forEach(word => {
        if (word.startsWith(lowerQuery) && word.length > query.length) {
          suggestions.add(word);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, limit);
  }
};

// Performance utilities
export const performanceUtils = {
  /**
   * Measure function execution time
   */
  measureTime: <T>(fn: () => T, label?: string): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (label) {
      console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  },

  /**
   * Create a throttled function
   */
  throttle: <T extends unknown[]>(
    fn: (...args: T) => void,
    delay: number
  ): ((...args: T) => void) => {
    let lastCall = 0;
    
    return (...args: T) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn(...args);
      }
    };
  },

  /**
   * Batch process array items
   */
  batchProcess: <T, R>(
    items: T[],
    processor: (item: T) => R,
    batchSize = 100
  ): R[] => {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      batch.forEach(item => {
        results.push(processor(item));
      });
      
      // Allow other tasks to run between batches
      if (i + batchSize < items.length) {
        // In a real implementation, you might use setTimeout or requestIdleCallback
      }
    }
    
    return results;
  }
};

// Export all utilities as a single object for convenience
export const utils = {
  domain: domainUtils,
  coordinate: coordinateUtils,
  date: dateUtils,
  analytics: analyticsUtils,
  search: searchUtils,
  performance: performanceUtils
};

export default utils;