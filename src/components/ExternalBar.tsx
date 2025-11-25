import React, { useMemo, memo } from 'react';
import { useAppStore } from '../stores/appStore';

export const ExternalBar: React.FC = memo(() => {
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
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="flex flex-col gap-3 max-w-xs">
        {/* Header Card */}
        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-slate-200 font-semibold text-xs font-mono">
              Analytics Dashboard
            </span>
          </div>
          <div className="text-slate-400 text-xs font-mono">
            Million Dollar Homepage
          </div>
        </div>
        
        {/* Total Domains Card */}
        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-lg pointer-events-auto">
          <div className="text-center">
            <div className="text-slate-200 font-bold text-xl leading-none font-mono">
              {stats.total.toLocaleString()}
            </div>
            <div className="text-slate-400 text-xs mt-1">Total Domains</div>
          </div>
        </div>
        
        {/* Domain Registration Card */}
        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-lg pointer-events-auto">
          <div className="text-slate-300 text-xs font-semibold mb-2 font-mono">Domain Registration</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="text-emerald-400 font-bold text-sm leading-none font-mono">
                {stats.registered.toLocaleString()}
              </div>
              <div className="text-slate-400 text-xs mt-1">
                Registered
              </div>
            </div>
            <div className="text-center">
              <div className="text-red-400 font-bold text-sm leading-none font-mono">
                {stats.available.toLocaleString()}
              </div>
              <div className="text-slate-400 text-xs mt-1">Available</div>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Rate</span>
              <span>{stats.registeredPercent}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${stats.registeredPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* DNS Status Card */}
        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-lg pointer-events-auto">
          <div className="text-slate-300 text-xs font-semibold mb-2 font-mono">DNS Resolution</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="text-cyan-400 font-bold text-sm leading-none font-mono">
                {stats.dnsResolved.toLocaleString()}
              </div>
              <div className="text-slate-400 text-xs mt-1">
                Resolved
              </div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-bold text-sm leading-none font-mono">
                {stats.dnsErrors.toLocaleString()}
              </div>
              <div className="text-slate-400 text-xs mt-1">Errors</div>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Rate</span>
              <span>{stats.dnsResolvedPercent}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-all duration-300"
                style={{ width: `${stats.dnsResolvedPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* HTTP Status Card */}
        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-lg pointer-events-auto">
          <div className="text-slate-300 text-xs font-semibold mb-2 font-mono">HTTP Status</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="text-emerald-400 font-bold text-sm leading-none font-mono">
                {stats.httpSuccess.toLocaleString()}
              </div>
              <div className="text-slate-400 text-xs mt-1">
                Success (200)
              </div>
            </div>
            <div className="text-center">
              <div className="text-red-400 font-bold text-sm leading-none font-mono">
                {stats.httpErrors.toLocaleString()}
              </div>
              <div className="text-slate-400 text-xs mt-1">Errors</div>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Rate</span>
              <span>{stats.httpSuccessPercent}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${stats.httpSuccessPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ExternalBar.displayName = 'ExternalBar';