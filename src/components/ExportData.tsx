import React, { useState, useCallback, memo } from 'react';
import { Download, FileText, Table, Code } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { AreaData } from '../types';

type ExportFormat = 'csv' | 'json' | 'txt';

interface ExportOptions {
  format: ExportFormat;
  includeAnalytics: boolean;
  includeCoordinates: boolean;
  includeTimestamps: boolean;
  onlyFiltered: boolean;
}

const ExportData: React.FC = memo(() => {
  const { appData, results, query, filters } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeAnalytics: true,
    includeCoordinates: false,
    includeTimestamps: true,
    onlyFiltered: true
  });

  const getDataToExport = useCallback((): AreaData[] => {
    if (exportOptions.onlyFiltered && results.length > 0) {
      return [...results];
    }
    return appData?.areas ? [...appData.areas] : [];
  }, [appData, results, exportOptions.onlyFiltered]);

  const generateCSV = useCallback((data: AreaData[]): string => {
    const headers = ['Domain', 'Title'];
    
    if (exportOptions.includeCoordinates) {
      headers.push('X', 'Y', 'Width', 'Height');
    }
    
    if (exportOptions.includeAnalytics) {
      headers.push('DNS Status', 'HTTP Status', 'WHOIS Status', 'Has Analytics');
    }
    
    if (exportOptions.includeTimestamps) {
      headers.push('Registered At', 'Expiry Date', 'Analyzed At');
    }

    const csvRows = [headers.join(',')];

    data.forEach(area => {
      const row = [
        `"${area.domain}"`,
        `"${area.title || ''}"`
      ];

      if (exportOptions.includeCoordinates) {
        row.push(
          area.coordinates.x.toString(),
          area.coordinates.y.toString(),
          area.coordinates.width.toString(),
          area.coordinates.height.toString()
        );
      }

      if (exportOptions.includeAnalytics) {
        row.push(
          `"${area.analytics?.dns_status || ''}"`,
          `"${area.analytics?.http_status || ''}"`,
          `"${area.analytics?.whois_status || ''}"`,
          area.hasAnalytics ? 'true' : 'false'
        );
      }

      if (exportOptions.includeTimestamps) {
        row.push(
          `"${area.analytics?.registered_at || ''}"`,
          `"${area.analytics?.expiry_date || ''}"`,
          `"${area.analytics?.analyzed_at || ''}"`
        );
      }

      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }, [exportOptions]);

  const generateJSON = useCallback((data: AreaData[]): string => {
    const exportData = data.map(area => {
      const item: any = {
        domain: area.domain,
        title: area.title || null
      };

      if (exportOptions.includeCoordinates) {
        item.coordinates = area.coordinates;
      }

      if (exportOptions.includeAnalytics && area.analytics) {
        item.analytics = {
          dns_status: area.analytics.dns_status,
          http_status: area.analytics.http_status,
          whois_status: area.analytics.whois_status,
          has_analytics: area.hasAnalytics
        };

        if (exportOptions.includeTimestamps) {
          item.analytics.registered_at = area.analytics.registered_at;
          item.analytics.expiry_date = area.analytics.expiry_date;
          item.analytics.analyzed_at = area.analytics.analyzed_at;
        }

        if (area.analytics.nameservers) {
          item.analytics.nameservers = area.analytics.nameservers;
        }
      }

      return item;
    });

    const exportObject = {
      metadata: {
        exported_at: new Date().toISOString(),
        total_records: data.length,
        query: query || null,
        filters: Object.keys(filters).length > 0 ? filters : null,
        export_options: exportOptions
      },
      data: exportData
    };

    return JSON.stringify(exportObject, null, 2);
  }, [exportOptions, query, filters]);

  const generateTXT = useCallback((data: AreaData[]): string => {
    const lines = [
      'Million Dollar Homepage - Domain Export',
      '=====================================',
      `Exported: ${new Date().toLocaleString()}`,
      `Total Records: ${data.length}`,
      query ? `Search Query: "${query}"` : '',
      Object.keys(filters).length > 0 ? `Filters Applied: ${Object.keys(filters).length}` : '',
      '',
      'Domains:',
      '--------'
    ].filter(Boolean);

    data.forEach((area, index) => {
      lines.push(`${index + 1}. ${area.domain}`);
      if (area.title) {
        lines.push(`   Title: ${area.title}`);
      }
      
      if (exportOptions.includeAnalytics && area.analytics) {
        lines.push(`   DNS: ${area.analytics.dns_status || 'N/A'}`);
        lines.push(`   HTTP: ${area.analytics.http_status || 'N/A'}`);
        lines.push(`   WHOIS: ${area.analytics.whois_status || 'N/A'}`);
      }
      
      if (exportOptions.includeCoordinates) {
        lines.push(`   Position: ${area.coordinates.x},${area.coordinates.y} (${area.coordinates.width}x${area.coordinates.height})`);
      }
      
      lines.push('');
    });

    return lines.join('\n');
  }, [exportOptions, query, filters]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    
    try {
      const data = getDataToExport();
      let content: string;
      let filename: string;
      let mimeType: string;

      const timestamp = new Date().toISOString().split('T')[0];
      const baseFilename = query 
        ? `mdh-search-${query.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}`
        : `mdh-domains-${timestamp}`;

      switch (exportOptions.format) {
        case 'csv':
          content = generateCSV(data);
          filename = `${baseFilename}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          content = generateJSON(data);
          filename = `${baseFilename}.json`;
          mimeType = 'application/json';
          break;
        case 'txt':
          content = generateTXT(data);
          filename = `${baseFilename}.txt`;
          mimeType = 'text/plain';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowOptions(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [exportOptions, getDataToExport, generateCSV, generateJSON, generateTXT, query]);

  const dataCount = getDataToExport().length;

  if (!appData) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
        aria-expanded={showOptions}
        aria-label="Export data options"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export Data</span>
        <span className="sm:hidden">Export</span>
        <span className="bg-green-500 px-2 py-0.5 rounded-full text-xs">
          {dataCount.toLocaleString()}
        </span>
      </button>

      {showOptions && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-2">Export Options</h3>
              <p className="text-xs text-gray-600 mb-3">
                Exporting {dataCount.toLocaleString()} domain{dataCount !== 1 ? 's' : ''}
                {query && ` matching "${query}"`}
              </p>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Format</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'csv', label: 'CSV', icon: Table },
                  { value: 'json', label: 'JSON', icon: Code },
                  { value: 'txt', label: 'TXT', icon: FileText }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: value as ExportFormat }))}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                      exportOptions.format === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Include Options */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Include</label>
              <div className="space-y-2">
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={exportOptions.onlyFiltered}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, onlyFiltered: e.target.checked }))}
                    className="rounded mr-2"
                  />
                  Only filtered results ({results.length > 0 ? results.length : appData.areas.length} domains)
                </label>
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeAnalytics}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeAnalytics: e.target.checked }))}
                    className="rounded mr-2"
                  />
                  Analytics data (DNS, HTTP, WHOIS)
                </label>
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeCoordinates}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeCoordinates: e.target.checked }))}
                    className="rounded mr-2"
                  />
                  Pixel coordinates
                </label>
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeTimestamps}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeTimestamps: e.target.checked }))}
                    className="rounded mr-2"
                  />
                  Timestamps (registration, expiry, analysis)
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => setShowOptions(false)}
                className="flex-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ExportData.displayName = 'ExportData';

export { ExportData };