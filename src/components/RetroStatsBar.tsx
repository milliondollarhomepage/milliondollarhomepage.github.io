import React, { useMemo, memo } from 'react';
import { useAppStore } from '../stores/appStore';

export const RetroStatsBar: React.FC = memo(() => {
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
    
    return {
      total,
      registered,
      available,
      dnsResolved,
      dnsErrors,
      httpSuccess,
      httpErrors
    };
  }, [appData]);

  if (!stats) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black console-border console-scanlines relative">
      <div className="px-4 py-1 relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs retro-console">
          {/* Title */}
          <div className="text-green-400 font-bold text-sm retro-title console-glow">
            &gt; MILLION DOLLAR HOMEPAGE - ANALYTICS TERMINAL
            <span className="blink text-green-300 ml-1">_</span>
          </div>
          
          {/* Separator */}
          <div className="hidden sm:block text-green-600">|</div>
          
          {/* Domain Statistics */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-green-400 font-bold console-glow">{stats.registered.toLocaleString()}</span>
              <span className="text-green-300">REG</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-red-400 font-bold console-glow">{stats.available.toLocaleString()}</span>
              <span className="text-red-300">AVAIL</span>
            </div>
          </div>
          
          {/* Separator */}
          <div className="hidden sm:block text-green-600">|</div>
          
          {/* DNS Statistics */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-cyan-400 font-bold console-glow">{stats.dnsResolved.toLocaleString()}</span>
              <span className="text-cyan-300">DNS_OK</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 font-bold console-glow">{stats.dnsErrors.toLocaleString()}</span>
              <span className="text-yellow-300">DNS_ERR</span>
            </div>
          </div>
          
          {/* Separator */}
          <div className="hidden sm:block text-green-600">|</div>
          
          {/* HTTP Statistics */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-green-400 font-bold console-glow">{stats.httpSuccess.toLocaleString()}</span>
              <span className="text-green-300">HTTP_200</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-red-400 font-bold console-glow">{stats.httpErrors.toLocaleString()}</span>
              <span className="text-red-300">HTTP_ERR</span>
            </div>
          </div>
          
          {/* Total */}
          <div className="hidden sm:block text-green-600">|</div>
          <div className="flex items-center gap-1">
            <span className="text-green-300">TOTAL:</span>
            <span className="text-green-400 font-bold console-glow">{stats.total.toLocaleString()}</span>
            <span className="text-green-300">DOMAINS</span>
          </div>
        </div>
        
        {/* Retro-style bottom border with green glow */}
        <div className="mt-1 h-0.5 bg-green-500 shadow-lg" style={{
          boxShadow: '0 0 10px rgba(0, 255, 0, 0.5), 0 0 20px rgba(0, 255, 0, 0.3)'
        }}></div>
      </div>
    </div>
  );
});

RetroStatsBar.displayName = 'RetroStatsBar';