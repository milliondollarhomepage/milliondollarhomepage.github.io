import { lazy } from 'react';

// Lazy load heavy components to improve initial bundle size
export const LazyDataVisualization = lazy(() => 
  import('./DataVisualization').then(module => ({ default: module.DataVisualization }))
);

export const LazyExportData = lazy(() => 
  import('./ExportData').then(module => ({ default: module.ExportData }))
);

export const LazyInteractiveMap = lazy(() => 
  import('./InteractiveMap').then(module => ({ default: module.InteractiveMap }))
);

// Loading fallback component
export const ComponentLoader: React.FC<{ name?: string }> = ({ name = 'component' }) => (
  <div className="flex items-center justify-center p-4 sm:p-6">
    <div className="text-center">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
      <p className="text-sm text-gray-600">Loading {name}...</p>
    </div>
  </div>
);

// Error fallback for lazy components
export const ComponentError: React.FC<{ 
  error?: Error; 
  retry?: () => void; 
  componentName?: string;
}> = ({ error, retry, componentName = 'component' }) => (
  <div className="flex items-center justify-center p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg">
    <div className="text-center">
      <div className="text-red-500 mb-2">
        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-sm text-red-800 mb-2">Failed to load {componentName}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      )}
      {error && (
        <details className="mt-2 text-xs text-red-600">
          <summary className="cursor-pointer">Error details</summary>
          <pre className="mt-1 text-left overflow-auto max-w-xs">{error.message}</pre>
        </details>
      )}
    </div>
  </div>
);