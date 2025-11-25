import React, { useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Globe, Server, Clock, ExternalLink, Flag, ShoppingCart } from 'lucide-react';
import { TooltipData } from '../types';

interface DomainTooltipProps {
  tooltip: TooltipData;
}

export const DomainTooltip: React.FC<DomainTooltipProps> = memo(({ tooltip }) => {
  if (!tooltip.visible) return null;

  // Memoize date formatting function
  const formatDate = useMemo(() => (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  }, []);

  // Memoize status color function
  const getStatusColor = useMemo(() => (status: string | number, type: 'dns' | 'http' | 'whois') => {
    switch (type) {
      case 'dns':
        return status === 'NOERROR' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
      case 'http':
        return status === 200 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
      case 'whois':
        return status === 'registered' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }, []);

  // Memoize formatted dates
  const formattedDates = useMemo(() => {
    if (!tooltip.analytics) return {};
    return {
      registered: tooltip.analytics.registered_at ? formatDate(tooltip.analytics.registered_at) : 'unavailable',
      expiry: tooltip.analytics.expiry_date ? formatDate(tooltip.analytics.expiry_date) : 'unavailable',
      analyzed: tooltip.analytics.analyzed_at ? formatDate(tooltip.analytics.analyzed_at) : 'unavailable'
    };
  }, [tooltip.analytics, formatDate]);

  // Memoize nameservers display - show all nameservers
  const nameserversDisplay = useMemo(() => {
    if (!tooltip.analytics?.nameservers?.length) return null;
    return tooltip.analytics.nameservers;
  }, [tooltip.analytics?.nameservers]);

  // Calculate optimal tooltip positioning to prevent cutoff
  const getTooltipPosition = useMemo(() => {
    const tooltipWidth = 320; // maxWidth from className
    const tooltipHeight = 300; // Approximate height including content
    const padding = 20; // Minimum distance from viewport edges
    
    let left = tooltip.position.x + 5;
    let top = tooltip.position.y + 5;
    
    // Horizontal boundary detection
    if (left + tooltipWidth > window.innerWidth - padding) {
      // Position to the left of cursor if it would overflow right
      left = tooltip.position.x - tooltipWidth - 5;
    }
    
    // Ensure tooltip doesn't go off the left edge
    if (left < padding) {
      left = padding;
    }
    
    // Vertical boundary detection
    if (top + tooltipHeight > window.innerHeight - padding) {
      // Position above cursor if it would overflow bottom
      top = tooltip.position.y - tooltipHeight  + 100;
    }
    
    // Ensure tooltip doesn't go off the top edge
    if (top < padding) {
      top = padding;
    }
    
    return { left, top };
  }, [tooltip.position.x, tooltip.position.y]);
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 pointer-events-none"
        style={{
          left: getTooltipPosition.left,
          top: getTooltipPosition.top,
          maxWidth: '320px'
        }}
      >
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate flex items-center gap-2">
                <Globe className="w-4 h-4 flex-shrink-0" />
                {tooltip.domain}
              </h3>
              {tooltip.title && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {tooltip.title}
                </p>
              )}
            </div>
            <a
              href={`http://${tooltip.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 p-1 text-gray-400 hover:text-blue-600 pointer-events-auto transition-colors"
              title={`Visit ${tooltip.domain}`}
              aria-label={`Visit ${tooltip.domain} in new tab`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {tooltip.analytics ? (
            <div className="space-y-3">
              {/* Status Indicators */}
              <div className="flex flex-wrap gap-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(tooltip.analytics.dns_status, 'dns')}`}>
                  <Globe className="w-3 h-3" />
                  {tooltip.analytics.dns_status}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(tooltip.analytics.http_status, 'http')}`}>
                  <Flag className="w-3 h-3" />
                  {tooltip.analytics.http_status}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(tooltip.analytics.whois_status, 'whois')}`}>
                  <ShoppingCart className="w-3 h-3" />
                  {tooltip.analytics.whois_status}
                </div>
              </div>

              {/* Registration Info */}
              {tooltip.analytics.whois_status === 'registered' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Registered:</span>
                    <span className="font-medium">
                      {formattedDates.registered}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-medium">
                      {formattedDates.expiry}
                    </span>
                  </div>

                  {nameserversDisplay && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Server className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Nameservers:</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {nameserversDisplay.map((ns, index) => (
                          <div key={index} className="text-xs text-gray-700 font-mono">
                            {ns}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Analysis Timestamp */}
              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Analyzed: {formattedDates.analyzed}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-3 sm:py-4">
              <div className="text-gray-400 mb-2">
                <Globe className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
              </div>
              <p className="text-xs sm:text-sm text-gray-600">No analytics data available</p>
              <p className="text-xs text-gray-500 mt-1">
                This domain was not included in the analysis
              </p>
            </div>
          )}
        </div>

      </motion.div>
    </AnimatePresence>
  );
});

DomainTooltip.displayName = 'DomainTooltip';