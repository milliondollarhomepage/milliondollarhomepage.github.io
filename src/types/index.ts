// Enhanced type definitions with better type safety and documentation

/** DNS status types for better type safety */
export type DNSStatus = 'NOERROR' | 'NXDOMAIN' | 'SERVFAIL' | 'TIMEOUT' | 'REFUSED';

/** HTTP status codes commonly encountered */
export type HTTPStatus = 200 | 301 | 302 | 404 | 500 | 503 | 0;

/** WHOIS status types */
export type WHOISStatus = 'registered' | 'available' | 'unknown' | 'error';

/** Domain analytics data structure */
export interface DomainAnalytics {
  readonly domain: string;
  readonly dns_status: DNSStatus;
  readonly http_status: HTTPStatus;
  readonly whois_status: WHOISStatus;
  readonly analyzed_at: string; // ISO 8601 date string
  readonly registered_at: string; // ISO 8601 date string
  readonly expiry_date: string; // ISO 8601 date string
  readonly last_updated: string; // ISO 8601 date string
  readonly nameservers: readonly string[];
}

/** Coordinate system for pixel areas */
export interface AreaCoordinates {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Individual pixel area data */
export interface AreaData {
  readonly id: number;
  readonly domain: string;
  readonly title: string;
  readonly href: string;
  readonly coordinates: AreaCoordinates;
  readonly rawCoords: readonly number[];
  readonly analytics: DomainAnalytics | null;
  readonly hasAnalytics: boolean;
}

/** Coordinate range boundaries */
export interface CoordinateRange {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

/** Analytics metadata summary */
export interface AnalyticsMetadata {
  readonly generated_at: string; // ISO 8601 date string
  readonly total_domains: number;
  readonly summary: {
    readonly dns_status: Readonly<Record<DNSStatus, number>>;
    readonly http_status: Readonly<Record<string, number>>;
    readonly whois_status: Readonly<Record<WHOISStatus, number>>;
  };
}

/** Application metadata */
export interface AppMetadata {
  readonly totalAreas: number;
  readonly areasWithAnalytics: number;
  readonly areasWithoutAnalytics: number;
  readonly matchRate: string;
  readonly coordinateRange: CoordinateRange;
  readonly analyticsMetadata: AnalyticsMetadata;
}

/** Main application data structure */
export interface AppData {
  readonly metadata: AppMetadata;
  readonly areas: readonly AreaData[];
}

/** Advanced search filters with extended options */
export interface SearchFilters {
  readonly dnsStatus?: DNSStatus;
  readonly httpStatus?: string;
  readonly whoisStatus?: WHOISStatus;
  readonly hasAnalytics?: boolean;
  // Advanced filters
  readonly domainLength?: {
    readonly min?: number;
    readonly max?: number;
  };
  readonly dateRange?: {
    readonly start?: string; // ISO 8601 date string
    readonly end?: string; // ISO 8601 date string
  };
  readonly hasNameservers?: boolean;
  readonly searchInTitle?: boolean;
}

/** Search state management */
export interface SearchState {
  readonly query: string;
  readonly results: readonly AreaData[];
  readonly filters: SearchFilters;
  readonly selectedDomain: string | null;
  readonly highlightedAreas: readonly string[];
}

/** Tooltip positioning and data */
export interface TooltipData {
  readonly domain: string;
  readonly title: string;
  readonly analytics: DomainAnalytics | null;
  readonly position: { readonly x: number; readonly y: number };
  readonly visible: boolean;
}

/** Error types for better error handling */
export interface AppError {
  readonly message: string;
  readonly code?: string;
  readonly details?: string;
  readonly timestamp: string;
  readonly retryable: boolean;
}

/** Loading state with progress tracking */
export interface LoadingState {
  readonly isLoading: boolean;
  readonly progress: number; // 0-100
  readonly stage?: string;
  readonly error?: AppError;
}

/** Theme configuration */
export type Theme = 'light' | 'dark' | 'system';

/** Component props type helpers */
export interface BaseComponentProps {
  readonly className?: string;
  readonly 'data-testid'?: string;
}

/** Event handler types */
export type DomainSelectHandler = (domain: string) => void;
export type SearchQueryHandler = (query: string) => void;
export type FilterChangeHandler = (filters: SearchFilters) => void;

/** Utility types for better type inference */
export type NonNullable<T> = T extends null | undefined ? never : T;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/** API response types */
export interface APIResponse<T = unknown> {
  readonly data?: T;
  readonly error?: AppError;
  readonly success: boolean;
  readonly timestamp: string;
}

/** Performance monitoring types */
export interface PerformanceMetrics {
  readonly loadTime: number;
  readonly renderTime: number;
  readonly memoryUsage?: number;
  readonly componentCount?: number;
}