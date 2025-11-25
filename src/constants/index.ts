/**
 * Application constants and configuration values
 */

// Image and coordinate constants - Million Dollar Homepage is exactly 1000x1000 pixels (1 million pixels)
export const IMAGE_CONSTANTS = {
  ORIGINAL_WIDTH: 1000,
  ORIGINAL_HEIGHT: 1000,
  MAX_SCALE: 5,
  MIN_SCALE: 0.1,
  PIXEL_RENDERING: 'pixelated' as const,
  // Ensure we display exactly 1 million pixels
  NATIVE_RESOLUTION: true,
} as const;

// Tooltip configuration
export const TOOLTIP_CONSTANTS = {
  OFFSET_X: 15,
  OFFSET_Y: -10,
  ANIMATION_DURATION: 150,
  MAX_WIDTH: 320,
} as const;

// Search and performance constants
export const SEARCH_CONSTANTS = {
  LIMIT: 1000,
  FUSE_THRESHOLD: 0.3,
  MIN_MATCH_CHAR_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
} as const;

// Network and loading constants
export const NETWORK_CONSTANTS = {
  TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000, // Base delay for exponential backoff
  PROGRESS_UPDATE_INTERVAL: 100,
} as const;

// Animation and transition constants
export const ANIMATION_CONSTANTS = {
  FAST: 0.1,
  NORMAL: 0.2,
  SLOW: 0.3,
  LOADING_SPINNER_DURATION: 1,
  HOVER_SCALE: 1.05,
  OPACITY_TRANSITION: 0.15,
} as const;

// Color constants
export const COLORS = {
  SELECTED: 'rgba(59, 130, 246, 0.6)', // Blue for selected
  HIGHLIGHTED: 'rgba(16, 185, 129, 0.4)', // Green for search results
  TRANSPARENT: 'transparent',
  STROKE_SELECTED: '#3B82F6',
  STROKE_HIGHLIGHTED: '#10B981',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  NO_RESPONSE: 0,
} as const;

// DNS status values
export const DNS_STATUS = {
  NO_ERROR: 'NOERROR',
  NX_DOMAIN: 'NXDOMAIN',
  SERV_FAIL: 'SERVFAIL',
  TIMEOUT: 'TIMEOUT',
  REFUSED: 'REFUSED',
} as const;

// WHOIS status values
export const WHOIS_STATUS = {
  REGISTERED: 'registered',
  AVAILABLE: 'available',
  UNKNOWN: 'unknown',
  ERROR: 'error',
} as const;

// Theme constants
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'mdh-theme',
  LAST_SEARCH: 'mdh-last-search',
  USER_PREFERENCES: 'mdh-preferences',
  CACHE_TIMESTAMP: 'mdh-cache-timestamp',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  APP_DATA: '/app-data.json',
  IMAGE_MAP: '/public/image-map.png',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error',
  TIMEOUT_ERROR: 'Request timed out',
  PARSE_ERROR: 'Data parsing error',
  NOT_FOUND: 'Data file not found',
  SERVER_ERROR: 'Server error',
  OFFLINE: 'No internet connection',
  INVALID_DATA: 'Invalid data format',
  GENERIC: 'An unexpected error occurred',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  DATA_LOADED: 'Data loaded successfully',
  SEARCH_COMPLETED: 'Search completed',
  EXPORT_COMPLETED: 'Export completed',
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  SEARCH_FOCUS: 'k',
  EXPORT: 'e',
  FILTERS: 'f',
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  SPACE: ' ',
} as const;

// Accessibility constants
export const A11Y_CONSTANTS = {
  ARIA_LIVE_POLITE: 'polite' as const,
  ARIA_LIVE_ASSERTIVE: 'assertive' as const,
  ROLE_BUTTON: 'button' as const,
  ROLE_LIST: 'list' as const,
  ROLE_LISTITEM: 'listitem' as const,
  ROLE_REGION: 'region' as const,
  ROLE_IMG: 'img' as const,
  ROLE_STATUS: 'status' as const,
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  SCALE_CHANGE_THRESHOLD: 0.001,
  RENDER_BATCH_SIZE: 100,
  VIRTUAL_SCROLL_BUFFER: 10,
  MEMORY_WARNING_MB: 100,
  FPS_TARGET: 60,
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_ENTRIES: 1000,
  CLEANUP_INTERVAL: 60 * 1000, // 1 minute
} as const;

// Validation rules
export const VALIDATION_RULES = {
  DOMAIN_MAX_LENGTH: 253,
  DOMAIN_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 500,
  SEARCH_QUERY_MAX_LENGTH: 100,
  COORDINATE_MIN: 0,
  COORDINATE_MAX: 1000,
} as const;

// Feature flags (for future use)
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: true,
  ENABLE_EXPORT: true,
  ENABLE_ADVANCED_SEARCH: true,
  ENABLE_KEYBOARD_SHORTCUTS: true,
  ENABLE_TOOLTIPS: true,
  ENABLE_ANIMATIONS: true,
  ENABLE_VIRTUAL_SCROLLING: false,
  ENABLE_SERVICE_WORKER: false,
} as const;

// Development constants
export const DEV_CONSTANTS = {
  LOG_LEVEL: 'info' as const,
  ENABLE_DEBUG: false, // Set to true for development builds
  MOCK_DELAY: 1000,
  ENABLE_PERFORMANCE_MONITORING: true,
} as const;

// Export all constants as a single object for convenience
export const CONSTANTS = {
  IMAGE: IMAGE_CONSTANTS,
  TOOLTIP: TOOLTIP_CONSTANTS,
  SEARCH: SEARCH_CONSTANTS,
  NETWORK: NETWORK_CONSTANTS,
  ANIMATION: ANIMATION_CONSTANTS,
  COLORS,
  HTTP_STATUS,
  DNS_STATUS,
  WHOIS_STATUS,
  THEME,
  STORAGE_KEYS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  KEYBOARD_SHORTCUTS,
  A11Y: A11Y_CONSTANTS,
  PERFORMANCE: PERFORMANCE_THRESHOLDS,
  CACHE: CACHE_CONFIG,
  VALIDATION: VALIDATION_RULES,
  FEATURES: FEATURE_FLAGS,
  DEV: DEV_CONSTANTS,
} as const;

// Type exports for better type safety
export type ImageConstants = typeof IMAGE_CONSTANTS;
export type TooltipConstants = typeof TOOLTIP_CONSTANTS;
export type SearchConstants = typeof SEARCH_CONSTANTS;
export type NetworkConstants = typeof NETWORK_CONSTANTS;
export type AnimationConstants = typeof ANIMATION_CONSTANTS;
export type Colors = typeof COLORS;
export type HTTPStatus = typeof HTTP_STATUS;
export type DNSStatus = typeof DNS_STATUS;
export type WHOISStatus = typeof WHOIS_STATUS;
export type Theme = typeof THEME;
export type StorageKeys = typeof STORAGE_KEYS;
export type APIEndpoints = typeof API_ENDPOINTS;
export type ErrorMessages = typeof ERROR_MESSAGES;
export type SuccessMessages = typeof SUCCESS_MESSAGES;
export type KeyboardShortcuts = typeof KEYBOARD_SHORTCUTS;
export type A11YConstants = typeof A11Y_CONSTANTS;
export type PerformanceThresholds = typeof PERFORMANCE_THRESHOLDS;
export type CacheConfig = typeof CACHE_CONFIG;
export type ValidationRules = typeof VALIDATION_RULES;
export type FeatureFlags = typeof FEATURE_FLAGS;
export type DevConstants = typeof DEV_CONSTANTS;