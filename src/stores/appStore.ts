import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import Fuse from 'fuse.js';
import { AppData, AreaData, SearchFilters, SearchState } from '../types';

interface AppStore extends SearchState {
  appData: AppData | null;
  fuse: Fuse<AreaData> | null;
  
  // Performance optimization: Cache for domain lookups
  domainMap: Map<string, AreaData> | null;
  
  // Actions
  setAppData: (data: AppData) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  setSelectedDomain: (domain: string | null) => void;
  clearSearch: () => void;
  highlightDomain: (domain: string) => void;
  clearHighlights: () => void;
}

// Constants for better performance
const SEARCH_LIMIT = 1000;
const FUSE_THRESHOLD = 0.3;
const MIN_MATCH_CHAR_LENGTH = 2;

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
  // Initial state
  appData: null,
  fuse: null,
  domainMap: null,
  query: '',
  results: [],
  filters: {},
  selectedDomain: null,
  highlightedAreas: [],

  // Actions
  setAppData: (data: AppData) => {
    // Create optimized domain lookup map
    const domainMap = new Map<string, AreaData>();
    data.areas.forEach(area => {
      domainMap.set(area.domain, area);
    });

    // Create Fuse instance for fuzzy search with optimized configuration
    const fuse = new Fuse(data.areas, {
      keys: [
        { name: 'domain', weight: 0.7 },
        { name: 'title', weight: 0.3 }
      ],
      threshold: FUSE_THRESHOLD,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: MIN_MATCH_CHAR_LENGTH,
      shouldSort: true,
      findAllMatches: false,
      location: 0,
      distance: 100,
      // Performance optimization: limit search depth
      ignoreLocation: true,
      ignoreFieldNorm: false
    });

    set({ appData: data, fuse, domainMap });
  },

  setSearchQuery: (query: string) => {
    const state = get();
    const { fuse, filters, appData } = state;
    
    if (!fuse || !appData) {
      set({ query, results: [], highlightedAreas: [] });
      return;
    }

    let results: AreaData[] = [];
    const trimmedQuery = query.trim();

    if (trimmedQuery && trimmedQuery.length >= MIN_MATCH_CHAR_LENGTH) {
      // Perform fuzzy search with optimized limit for performance
      const searchResults = fuse.search(trimmedQuery, { limit: SEARCH_LIMIT });
      results = searchResults.map(result => result.item);
    } else if (trimmedQuery.length > 0 && trimmedQuery.length < MIN_MATCH_CHAR_LENGTH) {
      // For very short queries, do exact prefix matching for better performance
      results = appData.areas.filter(area =>
        area.domain.toLowerCase().startsWith(trimmedQuery.toLowerCase()) ||
        area.title.toLowerCase().startsWith(trimmedQuery.toLowerCase())
      ).slice(0, SEARCH_LIMIT);
    } else {
      // No query, show all areas from appData (but limit for performance)
      results = appData.areas.slice(0, SEARCH_LIMIT);
    }

    // Apply filters
    results = applyFilters(results, filters);

    // Extract domains for highlighting with Set for better performance
    const highlightedAreas = Array.from(new Set(results.map(area => area.domain)));

    set({
      query,
      results,
      highlightedAreas
    });
  },

  setFilters: (filters: SearchFilters) => {
    const state = get();
    const { query, fuse, appData } = state;
    
    if (!fuse || !appData) {
      set({ filters });
      return;
    }

    let results: AreaData[] = [];
    const trimmedQuery = query.trim();

    if (trimmedQuery && trimmedQuery.length >= MIN_MATCH_CHAR_LENGTH) {
      const searchResults = fuse.search(trimmedQuery, { limit: SEARCH_LIMIT });
      results = searchResults.map(result => result.item);
    } else if (trimmedQuery.length > 0 && trimmedQuery.length < MIN_MATCH_CHAR_LENGTH) {
      results = appData.areas.filter(area =>
        area.domain.toLowerCase().startsWith(trimmedQuery.toLowerCase()) ||
        area.title.toLowerCase().startsWith(trimmedQuery.toLowerCase())
      ).slice(0, SEARCH_LIMIT);
    } else {
      results = appData.areas.slice(0, SEARCH_LIMIT);
    }

    // Apply new filters
    results = applyFilters(results, filters);

    // Extract domains for highlighting with Set for better performance
    const highlightedAreas = Array.from(new Set(results.map(area => area.domain)));

    set({
      filters,
      results,
      highlightedAreas
    });
  },

  setSelectedDomain: (domain: string | null) => {
    set({ selectedDomain: domain });
  },

  clearSearch: () => {
    set({ 
      query: '', 
      results: [], 
      filters: {}, 
      selectedDomain: null,
      highlightedAreas: []
    });
  },

  highlightDomain: (domain: string) => {
    const { highlightedAreas } = get();
    if (!highlightedAreas.includes(domain)) {
      set({ highlightedAreas: [...highlightedAreas, domain] });
    }
  },

  clearHighlights: () => {
    set({ highlightedAreas: [] });
  }
  })
));

// Optimized helper function to apply filters with better performance
function applyFilters(areas: AreaData[], filters: SearchFilters): AreaData[] {
  // Early return if no filters are applied
  const filterKeys = Object.keys(filters);
  const hasFilters = filterKeys.length > 0 &&
    Object.values(filters).some(value => value !== undefined && value !== null);
  
  if (!hasFilters) {
    return areas;
  }

  // Pre-compile filter conditions for better performance
  const filterConditions: Array<(area: AreaData) => boolean> = [];

  // Basic filters
  if (filters.dnsStatus !== undefined) {
    filterConditions.push(area => area.analytics?.dns_status === filters.dnsStatus);
  }

  if (filters.httpStatus !== undefined) {
    filterConditions.push(area => area.analytics?.http_status?.toString() === filters.httpStatus);
  }

  if (filters.whoisStatus !== undefined) {
    filterConditions.push(area => area.analytics?.whois_status === filters.whoisStatus);
  }

  if (filters.hasAnalytics !== undefined) {
    filterConditions.push(area => area.hasAnalytics === filters.hasAnalytics);
  }

  // Advanced filters (if they exist in the filters object)
  const advancedFilters = filters as any;

  // Domain length filter
  if (advancedFilters.domainLength) {
    const { min, max } = advancedFilters.domainLength;
    if (min !== undefined || max !== undefined) {
      filterConditions.push(area => {
        const domainLength = area.domain.length;
        return (min === undefined || domainLength >= min) &&
               (max === undefined || domainLength <= max);
      });
    }
  }

  // Date range filter
  if (advancedFilters.dateRange && (advancedFilters.dateRange.start || advancedFilters.dateRange.end)) {
    const startDate = advancedFilters.dateRange.start ? new Date(advancedFilters.dateRange.start) : null;
    const endDate = advancedFilters.dateRange.end ? new Date(advancedFilters.dateRange.end) : null;
    
    filterConditions.push(area => {
      if (!area.analytics?.registered_at) return false;
      const registrationDate = new Date(area.analytics.registered_at);
      return (!startDate || registrationDate >= startDate) &&
             (!endDate || registrationDate <= endDate);
    });
  }

  // Nameservers filter
  if (advancedFilters.hasNameservers !== undefined) {
    filterConditions.push(area => {
      const hasNameservers = Boolean(area.analytics?.nameservers && area.analytics.nameservers.length > 0);
      return advancedFilters.hasNameservers ? hasNameservers : !hasNameservers;
    });
  }

  // Apply all filter conditions efficiently
  return areas.filter(area => filterConditions.every(condition => condition(area)));
}

// Selector functions for better performance
export const selectAppData = (state: AppStore) => state.appData;
export const selectSearchResults = (state: AppStore) => state.results;
export const selectHighlightedAreas = (state: AppStore) => state.highlightedAreas;
export const selectSelectedDomain = (state: AppStore) => state.selectedDomain;
export const selectSearchQuery = (state: AppStore) => state.query;
export const selectFilters = (state: AppStore) => state.filters;

// Computed selectors
export const selectSearchStats = (state: AppStore) => ({
  totalAreas: state.appData?.areas.length || 0,
  filteredResults: state.results.length,
  highlightedCount: state.highlightedAreas.length,
  hasActiveSearch: state.query.trim().length > 0,
  hasActiveFilters: Object.keys(state.filters).length > 0
});