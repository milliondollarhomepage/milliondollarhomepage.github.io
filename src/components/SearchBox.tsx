import React, { useState, useMemo, useCallback, memo } from 'react';
import { Search, Filter, X, Calendar, Globe, Server, SortAsc, SortDesc } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { SearchFilters } from '../types';

type SortOption = 'domain' | 'title' | 'registered_date' | 'http_status' | 'dns_status';
type SortDirection = 'asc' | 'desc';

interface AdvancedFilters extends SearchFilters {
  sortBy?: SortOption;
  sortDirection?: SortDirection;
  dateRange?: {
    start?: string;
    end?: string;
  };
  domainLength?: {
    min?: number;
    max?: number;
  };
  hasNameservers?: boolean;
  searchInTitle?: boolean;
}

export const SearchBox: React.FC = memo(() => {
  const {
    query,
    results,
    filters,
    setSearchQuery,
    setFilters,
    clearSearch,
    setSelectedDomain
  } = useAppStore();

  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);
  const [sortBy, setSortBy] = useState<SortOption>('domain');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Memoize handlers to prevent unnecessary re-renders
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, [setSearchQuery]);

  const handleFilterChange = useCallback((key: keyof AdvancedFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  }, [localFilters, setFilters]);

  const handleSortChange = useCallback((newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
    handleFilterChange('sortBy', newSortBy);
    handleFilterChange('sortDirection', sortDirection === 'asc' ? 'desc' : 'asc');
  }, [sortBy, sortDirection, handleFilterChange]);

  const clearFilters = useCallback(() => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    setFilters(emptyFilters);
    setSortBy('domain');
    setSortDirection('asc');
  }, [setFilters]);

  const handleDomainSelect = useCallback((domain: string) => {
    setSelectedDomain(domain);
  }, [setSelectedDomain]);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  // Memoize computed values
  const totalResults = useMemo(() => results.length || 2794, [results.length]);
  const activeFiltersCount = useMemo(() => {
    const filterKeys = Object.keys(filters).filter(key =>
      !['sortBy', 'sortDirection'].includes(key) && filters[key as keyof SearchFilters] !== undefined
    );
    return filterKeys.length;
  }, [filters]);
  const hasActiveFilters = useMemo(() => activeFiltersCount > 0, [activeFiltersCount]);

  // Memoize sorted and filtered results
  const sortedResults = useMemo(() => {
    if (!results.length) return results;
    
    const sorted = [...results].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'domain':
          aValue = a.domain.toLowerCase();
          bValue = b.domain.toLowerCase();
          break;
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'registered_date':
          aValue = a.analytics?.registered_at ? new Date(a.analytics.registered_at).getTime() : 0;
          bValue = b.analytics?.registered_at ? new Date(b.analytics.registered_at).getTime() : 0;
          break;
        case 'http_status':
          aValue = a.analytics?.http_status || 0;
          bValue = b.analytics?.http_status || 0;
          break;
        case 'dns_status':
          aValue = a.analytics?.dns_status || '';
          bValue = b.analytics?.dns_status || '';
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [results, sortBy, sortDirection]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 h-full flex flex-col">
      {/* Search Header */}
      <div className="mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">Domain Search</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Search through {totalResults.toLocaleString()} domains
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-3 sm:mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search domains..."
          className="w-full pl-10 pr-10 py-2 sm:py-3 text-sm sm:text-base text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          aria-label="Search domains"
          aria-describedby="search-help"
        />
        <p id="search-help" className="sr-only">
          Enter domain name or keywords to search through the Million Dollar Homepage domains
        </p>
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFilters}
            className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors"
            aria-expanded={showFilters}
            aria-controls="filters-panel"
            aria-label={`${showFilters ? 'Hide' : 'Show'} filters`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            <span className="sm:hidden">Filter</span>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs" aria-label={`${activeFiltersCount} active filters`}>
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          {/* Sort Options */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleSortChange('domain')}
              className={`p-1 rounded transition-colors ${sortBy === 'domain' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Sort by domain"
              aria-label="Sort by domain name"
            >
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => handleSortChange('http_status')}
              className={`p-1 rounded transition-colors ${sortBy === 'http_status' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Sort by HTTP status"
              aria-label="Sort by HTTP status"
            >
              <Server className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => handleSortChange('registered_date')}
              className={`p-1 rounded transition-colors ${sortBy === 'registered_date' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Sort by registration date"
              aria-label="Sort by registration date"
            >
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors"
              title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              aria-label={`Change sort direction to ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortDirection === 'asc' ? <SortAsc className="w-3 h-3 sm:w-4 sm:h-4" /> : <SortDesc className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Clear all filters"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div
          id="filters-panel"
          className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 space-y-2 sm:space-y-3"
          role="region"
          aria-label="Search filters"
        >
          {/* DNS Status Filter */}
          <div>
            <label htmlFor="dns-status-filter" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              DNS Status
            </label>
            <select
              id="dns-status-filter"
              value={localFilters.dnsStatus || ''}
              onChange={(e) => handleFilterChange('dnsStatus', e.target.value || undefined)}
              className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="NOERROR">NOERROR</option>
              <option value="NXDOMAIN">NXDOMAIN</option>
              <option value="SERVFAIL">SERVFAIL</option>
            </select>
          </div>

          {/* HTTP Status Filter */}
          <div>
            <label htmlFor="http-status-filter" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              HTTP Status
            </label>
            <select
              id="http-status-filter"
              value={localFilters.httpStatus || ''}
              onChange={(e) => handleFilterChange('httpStatus', e.target.value || undefined)}
              className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="200">200 (OK)</option>
              <option value="404">404 (Not Found)</option>
              <option value="500">500 (Server Error)</option>
              <option value="0">0 (No Response)</option>
            </select>
          </div>

          {/* WHOIS Status Filter */}
          <div>
            <label htmlFor="whois-status-filter" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              WHOIS Status
            </label>
            <select
              id="whois-status-filter"
              value={localFilters.whoisStatus || ''}
              onChange={(e) => handleFilterChange('whoisStatus', e.target.value || undefined)}
              className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="registered">Registered</option>
              <option value="available">Available</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          {/* Analytics Availability */}
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm">
              <input
                type="checkbox"
                checked={localFilters.hasAnalytics === true}
                onChange={(e) => handleFilterChange('hasAnalytics', e.target.checked ? true : undefined)}
                className="rounded focus:ring-2 focus:ring-blue-500"
                aria-describedby="analytics-filter-help"
              />
              <span className="hidden sm:inline">Only domains with analytics data</span>
              <span className="sm:hidden">With analytics only</span>
            </label>
            <p id="analytics-filter-help" className="sr-only">
              Show only domains that have analytics data available
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-hidden">
        <div className="mb-2">
          <span className="text-xs sm:text-sm text-gray-600">
            {results.length} result{results.length !== 1 ? 's' : ''}
            {query && (
              <span className="block sm:inline">
                <span className="hidden sm:inline"> for </span>
                <span className="sm:hidden">:</span>
                "{query.length > 20 ? `${query.substring(0, 20)}...` : query}"
              </span>
            )}
          </span>
        </div>

        <div className="h-full overflow-y-auto space-y-1 sm:space-y-2" role="list" aria-label="Search results">
          {sortedResults.map((area) => (
            <div
              key={`${area.id}-${area.domain}`}
              onClick={() => handleDomainSelect(area.domain)}
              className="p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="listitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDomainSelect(area.domain);
                }
              }}
              aria-label={`Select domain ${area.domain}${area.title ? `, ${area.title}` : ''}`}
            >
              <div className="font-medium text-gray-800 truncate text-sm sm:text-base" title={area.domain}>
                {area.domain}
              </div>
              {area.title && (
                <div className="text-xs sm:text-sm text-gray-600 truncate mt-1" title={area.title}>
                  {area.title}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2 text-xs">
                {area.analytics && (
                  <>
                    <span className={`px-1 sm:px-2 py-1 rounded text-xs ${
                      area.analytics.dns_status === 'NOERROR'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <span className="hidden sm:inline">DNS: </span>{area.analytics.dns_status}
                    </span>
                    <span className={`px-1 sm:px-2 py-1 rounded text-xs ${
                      area.analytics.http_status === 200
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <span className="hidden sm:inline">HTTP: </span>{area.analytics.http_status}
                    </span>
                    <span className={`px-1 sm:px-2 py-1 rounded text-xs ${
                      area.analytics.whois_status === 'registered'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {area.analytics.whois_status}
                    </span>
                  </>
                )}
                {!area.hasAnalytics && (
                  <span className="px-1 sm:px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">
                    No analytics
                  </span>
                )}
              </div>
            </div>
          ))}

          {results.length === 0 && query && (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm sm:text-base">No domains found for "{query}"</p>
              <p className="text-xs sm:text-sm mt-1">Try a different search term or clear filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

SearchBox.displayName = 'SearchBox';