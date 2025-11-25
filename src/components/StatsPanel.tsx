import React, { useMemo, memo } from 'react';
import { BarChart3, Globe, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  total?: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = memo(({ icon, title, value, total, color }) => {
  const percentage = total ? ((value / total) * 100).toFixed(1) : null;
  
  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200" role="region" aria-label={`${title} statistics`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className={`p-1.5 sm:p-2 rounded-lg ${color} flex-shrink-0`}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-600 truncate">{title}</p>
            <p className="text-lg sm:text-xl font-semibold text-gray-900" aria-label={`${value.toLocaleString()} ${title.toLowerCase()}`}>
              {value.toLocaleString()}
              {total && (
                <span className="text-xs sm:text-sm text-gray-500 ml-1">
                  / {total.toLocaleString()}
                </span>
              )}
            </p>
          </div>
        </div>
        {total && percentage && (
          <div className="text-right flex-shrink-0 ml-2">
            <div className="text-xs sm:text-sm font-medium text-gray-900" aria-label={`${percentage} percent`}>
              {percentage}%
            </div>
            <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-1.5 sm:h-2 mt-1">
              <div
                className={`h-1.5 sm:h-2 rounded-full ${color.replace('bg-', 'bg-').replace('-100', '-500')}`}
                style={{ width: `${percentage}%` }}
                role="progressbar"
                aria-valuenow={parseFloat(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${percentage}% of ${title.toLowerCase()}`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export const StatsPanel: React.FC = memo(() => {
  const { appData, results, query } = useAppStore();

  if (!appData) return null;

  const { metadata } = appData;
  const currentResults = results.length > 0 ? results : appData.areas;

  // Memoize stats calculation for performance
  const stats = useMemo(() => {
    const withAnalytics = currentResults.filter(area => area.hasAnalytics);
    const withoutAnalytics = currentResults.filter(area => !area.hasAnalytics);
    const dnsSuccess = currentResults.filter(area => area.analytics?.dns_status === 'NOERROR');
    const httpSuccess = currentResults.filter(area => area.analytics?.http_status === 200);
    const registered = currentResults.filter(area => area.analytics?.whois_status === 'registered');

    return {
      total: currentResults.length,
      withAnalytics: withAnalytics.length,
      withoutAnalytics: withoutAnalytics.length,
      dnsSuccess: dnsSuccess.length,
      httpSuccess: httpSuccess.length,
      registered: registered.length
    };
  }, [currentResults]);

  // Memoize formatted analysis date
  const analysisDate = useMemo(() => {
    if (!metadata.analyticsMetadata?.generated_at) return 'N/A';
    return new Date(metadata.analyticsMetadata.generated_at).toLocaleDateString();
  }, [metadata.analyticsMetadata?.generated_at]);

  // Memoize DNS status entries for display
  const dnsStatusEntries = useMemo(() => {
    if (!metadata.analyticsMetadata?.summary?.dns_status) return [];
    return Object.entries(metadata.analyticsMetadata.summary.dns_status)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  }, [metadata.analyticsMetadata?.summary?.dns_status]);

  return (
    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
          {query ? `Search Results Stats` : 'Overview'}
        </h2>
      </div>

      {query && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
          <p className="text-xs sm:text-sm text-blue-800">
            Showing stats for <span className="font-medium">"{query.length > 20 ? `${query.substring(0, 20)}...` : query}"</span>
            {' '}({stats.total} result{stats.total !== 1 ? 's' : ''})
          </p>
        </div>
      )}

      <div className="space-y-2 sm:space-y-4">
        {/* Total Domains */}
        <StatCard
          icon={<Globe className="w-5 h-5 text-blue-600" />}
          title="Total Domains"
          value={stats.total}
          color="bg-blue-100"
        />

        {/* Analytics Coverage */}
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          title="With Analytics"
          value={stats.withAnalytics}
          total={stats.total}
          color="bg-green-100"
        />

        <StatCard
          icon={<XCircle className="w-5 h-5 text-gray-600" />}
          title="Without Analytics"
          value={stats.withoutAnalytics}
          total={stats.total}
          color="bg-gray-100"
        />

        {/* Status Stats */}
        {stats.withAnalytics > 0 && (
          <>
            <div className="pt-2 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Status Breakdown</h3>
            </div>

            <StatCard
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              title="DNS Resolved"
              value={stats.dnsSuccess}
              total={stats.withAnalytics}
              color="bg-green-100"
            />

            <StatCard
              icon={<CheckCircle className="w-5 h-5 text-blue-600" />}
              title="HTTP 200 OK"
              value={stats.httpSuccess}
              total={stats.withAnalytics}
              color="bg-blue-100"
            />

            <StatCard
              icon={<AlertCircle className="w-5 h-5 text-purple-600" />}
              title="Registered"
              value={stats.registered}
              total={stats.withAnalytics}
              color="bg-purple-100"
            />
          </>
        )}

        {/* Global Stats (when not searching) */}
        {!query && (
          <>
            <div className="pt-2 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Global Summary</h3>
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex justify-between sm:block">
                  <span className="text-gray-600">Match Rate:</span>
                  <span className="font-medium sm:ml-2">{metadata.matchRate}</span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="text-gray-600">Total Areas:</span>
                  <span className="font-medium sm:ml-2">{metadata.totalAreas.toLocaleString()}</span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="text-gray-600">Coordinate Range:</span>
                  <span className="font-medium sm:ml-2">
                    {metadata.coordinateRange.maxX}×{metadata.coordinateRange.maxY}
                  </span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="text-gray-600">Last Analysis:</span>
                  <span className="font-medium sm:ml-2" title={analysisDate}>{analysisDate}</span>
                </div>
              </div>
            </div>

            {/* Top Status Counts */}
            {dnsStatusEntries.length > 0 && (
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Status Distribution</h4>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  {dnsStatusEntries.map(([status, count]) => (
                    <div key={status} className="flex justify-between">
                      <span className="text-gray-600 truncate mr-2">DNS {status}:</span>
                      <span className="font-medium flex-shrink-0">{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

StatsPanel.displayName = 'StatsPanel';