import React, { useMemo, memo } from 'react';
import { BarChart3, PieChart, TrendingUp, Activity } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

interface ChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface BarChartProps {
  data: ChartData[];
  title: string;
  icon: React.ReactNode;
}

const BarChart: React.FC<BarChartProps> = memo(({ data, title, icon }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 truncate mr-2">{item.label}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-medium">{item.value.toLocaleString()}</span>
                <span className="text-xs text-gray-500">({item.percentage.toFixed(1)}%)</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${item.color}`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
                role="progressbar"
                aria-valuenow={item.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.label}: ${item.percentage.toFixed(1)}%`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

BarChart.displayName = 'BarChart';

interface DonutChartProps {
  data: ChartData[];
  title: string;
  icon: React.ReactNode;
  centerValue?: string;
  centerLabel?: string;
}

const DonutChart: React.FC<DonutChartProps> = memo(({ data, title, icon, centerValue, centerLabel }) => {
  // Calculate cumulative percentages for SVG path
  let cumulativePercentage = 0;
  const segments = data.map(item => {
    const startAngle = cumulativePercentage * 3.6; // Convert to degrees
    cumulativePercentage += item.percentage;
    const endAngle = cumulativePercentage * 3.6;
    return {
      ...item,
      startAngle,
      endAngle,
      path: createArcPath(50, 50, 35, 20, startAngle, endAngle)
    };
  });

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Donut Chart */}
        <div className="relative flex-shrink-0">
          <svg width="120" height="120" viewBox="0 0 100 100" className="transform -rotate-90">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.path}
                fill={getColorValue(segment.color)}
                className="transition-all duration-300 hover:opacity-80"
              />
            ))}
          </svg>
          {centerValue && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-lg sm:text-xl font-bold text-gray-900">{centerValue}</div>
              {centerLabel && (
                <div className="text-xs text-gray-500 text-center">{centerLabel}</div>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 min-w-0">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className={`w-3 h-3 rounded-full flex-shrink-0 ${item.color}`}
                aria-hidden="true"
              />
              <span className="text-gray-600 truncate flex-1">{item.label}</span>
              <span className="font-medium flex-shrink-0">
                {item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

DonutChart.displayName = 'DonutChart';

// Helper function to create SVG arc path
function createArcPath(cx: number, cy: number, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number): string {
  const startAngleRad = (startAngle * Math.PI) / 180;
  const endAngleRad = (endAngle * Math.PI) / 180;
  
  const x1 = cx + outerRadius * Math.cos(startAngleRad);
  const y1 = cy + outerRadius * Math.sin(startAngleRad);
  const x2 = cx + outerRadius * Math.cos(endAngleRad);
  const y2 = cy + outerRadius * Math.sin(endAngleRad);
  
  const x3 = cx + innerRadius * Math.cos(endAngleRad);
  const y3 = cy + innerRadius * Math.sin(endAngleRad);
  const x4 = cx + innerRadius * Math.cos(startAngleRad);
  const y4 = cy + innerRadius * Math.sin(startAngleRad);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", x1, y1,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 1, x2, y2,
    "L", x3, y3,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 0, x4, y4,
    "Z"
  ].join(" ");
}

// Helper function to get color value from Tailwind class
function getColorValue(colorClass: string): string {
  const colorMap: Record<string, string> = {
    'bg-blue-500': '#3B82F6',
    'bg-green-500': '#10B981',
    'bg-red-500': '#EF4444',
    'bg-yellow-500': '#F59E0B',
    'bg-purple-500': '#8B5CF6',
    'bg-pink-500': '#EC4899',
    'bg-indigo-500': '#6366F1',
    'bg-gray-500': '#6B7280'
  };
  return colorMap[colorClass] || '#6B7280';
}

export const DataVisualization: React.FC = memo(() => {
  const { appData, results, query } = useAppStore();

  if (!appData) return null;

  const currentResults = results.length > 0 ? results : appData.areas;

  // Memoize chart data calculations
  const dnsStatusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    const total = currentResults.length;

    currentResults.forEach(area => {
      if (area.analytics?.dns_status) {
        statusCounts[area.analytics.dns_status] = (statusCounts[area.analytics.dns_status] || 0) + 1;
      } else {
        statusCounts['No Data'] = (statusCounts['No Data'] || 0) + 1;
      }
    });

    const colors = ['bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-gray-500'];
    return Object.entries(statusCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([status, count], index) => ({
        label: status,
        value: count,
        percentage: (count / total) * 100,
        color: colors[index] || 'bg-gray-500'
      }));
  }, [currentResults]);

  const httpStatusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    const total = currentResults.length;

    currentResults.forEach(area => {
      if (area.analytics?.http_status !== undefined) {
        const status = area.analytics.http_status.toString();
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      } else {
        statusCounts['No Data'] = (statusCounts['No Data'] || 0) + 1;
      }
    });

    const colors = ['bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500', 'bg-gray-500'];
    return Object.entries(statusCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([status, count], index) => ({
        label: status === '200' ? 'HTTP 200 (OK)' : status === '0' ? 'No Response' : `HTTP ${status}`,
        value: count,
        percentage: (count / total) * 100,
        color: colors[index] || 'bg-gray-500'
      }));
  }, [currentResults]);

  const whoisStatusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    const total = currentResults.length;

    currentResults.forEach(area => {
      if (area.analytics?.whois_status) {
        statusCounts[area.analytics.whois_status] = (statusCounts[area.analytics.whois_status] || 0) + 1;
      } else {
        statusCounts['No Data'] = (statusCounts['No Data'] || 0) + 1;
      }
    });

    const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-gray-500'];
    return Object.entries(statusCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([status, count], index) => ({
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        percentage: (count / total) * 100,
        color: colors[index] || 'bg-gray-500'
      }));
  }, [currentResults]);

  const analyticsOverviewData = useMemo(() => {
    const withAnalytics = currentResults.filter(area => area.hasAnalytics).length;
    const withoutAnalytics = currentResults.length - withAnalytics;
    const total = currentResults.length;

    return [
      {
        label: 'With Analytics',
        value: withAnalytics,
        percentage: (withAnalytics / total) * 100,
        color: 'bg-green-500'
      },
      {
        label: 'Without Analytics',
        value: withoutAnalytics,
        percentage: (withoutAnalytics / total) * 100,
        color: 'bg-gray-500'
      }
    ];
  }, [currentResults]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
          {query ? 'Search Results Analytics' : 'Data Visualization'}
        </h2>
      </div>

      {query && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <p className="text-sm text-blue-800">
            Visualizing data for <span className="font-medium">"{query}"</span> 
            {' '}({currentResults.length} result{currentResults.length !== 1 ? 's' : ''})
          </p>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Analytics Coverage Donut Chart */}
        <DonutChart
          data={analyticsOverviewData}
          title="Analytics Coverage"
          icon={<PieChart className="w-5 h-5 text-blue-600" />}
          centerValue={currentResults.length.toLocaleString()}
          centerLabel="Total Domains"
        />

        {/* DNS Status Bar Chart */}
        <BarChart
          data={dnsStatusData}
          title="DNS Status Distribution"
          icon={<BarChart3 className="w-5 h-5 text-green-600" />}
        />

        {/* HTTP Status Bar Chart */}
        <BarChart
          data={httpStatusData}
          title="HTTP Status Distribution"
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
        />

        {/* WHOIS Status Donut Chart */}
        <DonutChart
          data={whoisStatusData}
          title="Domain Registration Status"
          icon={<PieChart className="w-5 h-5 text-indigo-600" />}
        />
      </div>

      {/* Summary Stats */}
      {!query && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Quick Insights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {((analyticsOverviewData[0]?.percentage || 0)).toFixed(1)}%
              </div>
              <div className="text-gray-600">Have Analytics</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {((dnsStatusData.find(d => d.label === 'NOERROR')?.percentage || 0)).toFixed(1)}%
              </div>
              <div className="text-gray-600">DNS Resolved</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {((httpStatusData.find(d => d.label.includes('200'))?.percentage || 0)).toFixed(1)}%
              </div>
              <div className="text-gray-600">HTTP Success</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">
                {((whoisStatusData.find(d => d.label === 'Registered')?.percentage || 0)).toFixed(1)}%
              </div>
              <div className="text-gray-600">Registered</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

DataVisualization.displayName = 'DataVisualization';