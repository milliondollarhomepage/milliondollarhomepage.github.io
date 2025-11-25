import React, { useMemo, memo } from 'react';
import { CircleQuestionMark } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

export const TopBar: React.FC = memo(() => {
  const { appData } = useAppStore();

  // Calculate statistics from the data
  const stats = useMemo(() => {
    if (!appData) return null;

    const areas = appData.areas;
    const total = areas.length;
    
    // Count domains by registration status
    const registered = areas.filter(area => 
      area.analytics?.whois_status === 'registered'
    ).length;
    const available = total - registered;
    
    // Count DNS status
    const dnsResolved = areas.filter(area => 
      area.analytics?.dns_status === 'NOERROR'
    ).length;
    const dnsErrors = total - dnsResolved;
    
    // Count HTTP status
    const httpSuccess = areas.filter(area => 
      area.analytics?.http_status === 200
    ).length;
    const httpErrors = total - httpSuccess;
    
    // Calculate percentages
    const registeredPercent = ((registered / total) * 100).toFixed(1);
    const dnsResolvedPercent = ((dnsResolved / total) * 100).toFixed(1);
    const httpSuccessPercent = ((httpSuccess / total) * 100).toFixed(1);
    
    return {
      total,
      registered,
      available,
      dnsResolved,
      dnsErrors,
      httpSuccess,
      httpErrors,
      registeredPercent,
      dnsResolvedPercent,
      httpSuccessPercent
    };
  }, [appData]);

  if (!stats) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto" style={{ backgroundColor: '#646464' }}>
        <div className="px-4 py-1">
          <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
            {/* Left: Title and Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-slate-200 font-semibold text-sm font-mono">
                  Million Dollar Homepage Analytics
                </span>
              </div>

            </div>

            {/* Center: All Stats in One Line */}
            <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-center">
              {/* Domains */}
              <div className="relative group flex items-center gap-1">
                <span className="text-slate-200 font-semibold text-sm font-mono">
                  Domains
                </span>
                <span className="text-green-400 font-bold text-sm font-mono">
                  {stats.registered.toLocaleString()}
                </span>
                <span className="text-slate-200 font-semibold text-sm font-mono">
                  |
                </span>
                <span className="text-red-400 font-bold text-sm font-mono">
                  {stats.available.toLocaleString()}
                </span>
                
                {/* Tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-800 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  <div className="text-center">
                    <div className="font-semibold mb-1">Domains</div>
                    <div>Total: {stats.total.toLocaleString()}</div>
                    <div className="text-green-400">Registered: {stats.registered.toLocaleString()}</div>
                    <div className="text-red-400">Available: {stats.available.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* DNS */}
              <div className="relative group flex items-center gap-1">
                <span className="text-slate-200 font-semibold text-sm font-mono">
                  DNS
                </span>
                <span className="text-green-400 font-bold text-sm font-mono">
                  {stats.dnsResolved.toLocaleString()}
                </span>
                <span className="text-slate-200 font-semibold text-sm font-mono">
                  |
                </span>
                <span className="text-red-400 font-bold text-sm font-mono">
                  {stats.dnsErrors.toLocaleString()}
                </span>
                
                {/* Tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-800 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  <div className="text-center">
                    <div className="font-semibold mb-1">DNS Resolution</div>
                    <div className="text-green-400">Resolved: {stats.dnsResolved.toLocaleString()}</div>
                    <div className="text-red-400">Errors: {stats.dnsErrors.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* HTTP */}
              <div className="relative group flex items-center gap-1">
                <span className="text-slate-200 font-semibold text-sm font-mono">
                  HTTP
                </span>
                <span className="text-green-400 font-bold text-sm font-mono">
                  {stats.httpSuccess.toLocaleString()}
                </span>
                <span className="text-slate-200 font-semibold text-sm font-mono">
                  |
                </span>
                <span className="text-red-400 font-bold text-sm font-mono">
                  {stats.httpErrors.toLocaleString()}
                </span>
                
                {/* Tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-800 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  <div className="text-center">
                    <div className="font-semibold mb-1">HTTP Status</div>
                    <div className="text-green-400">Success: {stats.httpSuccess.toLocaleString()}</div>
                    <div className="text-red-400">Errors: {stats.httpErrors.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Help Icon with Tooltip */}
            <div className="flex items-center relative group">
              <div className="w-6 h-6 bg-grey-600 rounded-full flex items-center justify-center transition-colors hover:border-grey-400 cursor-help">
                <CircleQuestionMark className="w-4 h-4 text-slate-200" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 text-white text-xs p-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="text-center">
                  The Million Dollar Homepage © 2005 Alex Tew. All rights reserved. I am not responsible for the content of external sites. Images featured on homepage are © of their respective owners.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

TopBar.displayName = 'TopBar';