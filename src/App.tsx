import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TopBar } from './components/TopBar';
import {
  LazyInteractiveMap,
} from './components/LazyComponents';
import ErrorBoundary from './components/ErrorBoundary';
import { CookieBanner } from './components/CookieBanner';
import { useAppStore } from './stores/appStore';
import { useGlobalKeyboardShortcuts } from './hooks/useKeyboardNavigation';
import { AppData } from './types';
import './App.css';

const App = React.memo(() => {
  const {
    appData,
    setAppData
  } = useAppStore();

  // Enable global keyboard shortcuts
  useGlobalKeyboardShortcuts();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSuccessfulLoad, setLastSuccessfulLoad] = useState<Date | null>(null);

  // Enhanced data loading function with better error handling and user feedback
  const loadAppData = useCallback(async (attempt = 1) => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(10);

      // Check online status
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 80));
      }, 100);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch('/app-data.json', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Accept': 'application/json'
          }
        });

        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        setLoadingProgress(90);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Data file not found. Please ensure the application is properly deployed.');
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format. Expected JSON data.');
        }

        const data: AppData = await response.json();
        
        // Enhanced data validation
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data format: expected object');
        }

        if (!data.areas || !Array.isArray(data.areas)) {
          throw new Error('Invalid data format: missing or invalid areas array');
        }

        if (data.areas.length === 0) {
          throw new Error('No domain data available');
        }

        if (!data.metadata || typeof data.metadata !== 'object') {
          throw new Error('Invalid data format: missing or invalid metadata');
        }

        // Validate critical metadata fields
        if (typeof data.metadata.totalAreas !== 'number' || data.metadata.totalAreas <= 0) {
          throw new Error('Invalid metadata: totalAreas must be a positive number');
        }

        setLoadingProgress(100);
        setAppData(data);
        setRetryCount(0);
        setLastSuccessfulLoad(new Date());
        
        // Clear progress after a short delay for better UX
        setTimeout(() => setLoadingProgress(0), 500);
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        throw fetchError;
      }
    } catch (err) {
      let errorMessage = 'Failed to load application data';
      let errorDetails = '';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out';
          errorDetails = 'The request took too long to complete. Please check your connection and try again.';
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Network connection error';
          errorDetails = 'Unable to connect to the server. Please check your internet connection.';
        } else if (err.message.includes('JSON')) {
          errorMessage = 'Data parsing error';
          errorDetails = 'The server returned invalid data. Please try again or contact support.';
        } else {
          errorMessage = err.message;
          errorDetails = attempt > 1 ? `Attempt ${attempt} of 3 failed.` : '';
        }
      }

      setError(errorMessage);
      console.error(`Error loading app data (attempt ${attempt}):`, {
        error: err,
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        online: navigator.onLine
      });
      
      // Auto-retry up to 3 times with exponential backoff
      if (attempt < 3 && navigator.onLine) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        setTimeout(() => {
          setRetryCount(attempt);
          loadAppData(attempt + 1);
        }, delay);
      }
    } finally {
      setLoading(false);
      if (loadingProgress > 0) {
        setTimeout(() => setLoadingProgress(0), 500);
      }
    }
  }, [setAppData]);

  // Manual retry function
  const handleRetry = useCallback(() => {
    setRetryCount(0);
    loadAppData(1);
  }, [loadAppData]);

  // Online/offline detection for better user experience
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // If we were offline and had an error, try to reload
      if (error && !loading) {
        loadAppData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (loading) {
        setError('Connection lost. Please check your internet connection.');
        setLoading(false);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error, loading, loadAppData]);

  // Load app data on mount
  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  // Memoize computed values
  const totalAreas = useMemo(() => appData?.metadata.totalAreas || 0, [appData?.metadata.totalAreas]);
  const areasWithAnalytics = useMemo(() => appData?.metadata.areasWithAnalytics || 0, [appData?.metadata.areasWithAnalytics]);
  const analysisDate = useMemo(() => {
    if (!appData?.metadata.analyticsMetadata?.generated_at) return '';
    return new Date(appData.metadata.analyticsMetadata.generated_at).toLocaleDateString();
  }, [appData?.metadata.analyticsMetadata?.generated_at]);

  // Memoize enhanced loading component
  const loadingComponent = useMemo(() => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"
          aria-label="Loading spinner"
        />
        
        <h2 className="text-xl font-semibold text-white mb-2">
          Loading Analytics Data
        </h2>
        
        <p className="text-gray-300 text-sm mb-4" role="status" aria-live="polite">
          {retryCount > 0
            ? `Retrying... (attempt ${retryCount + 1}/3)`
            : 'Fetching Million Dollar Homepage analytics...'
          }
        </p>

        {/* Progress Bar */}
        {loadingProgress > 0 && (
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        <div className="text-xs text-gray-400 space-y-1">
          <p>• Loading domain data and analytics</p>
          <p>• Processing {appData?.metadata?.totalAreas?.toLocaleString() || '2,000+'} pixel areas</p>
          <p>• Preparing interactive visualizations</p>
        </div>
      </div>
    </div>
  ), [retryCount, loadingProgress, appData?.metadata?.totalAreas]);

  // Enhanced error component with better user guidance
  const errorComponent = useMemo(() => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-red-400 mb-2">
            Unable to Load Data
          </h1>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            {error}
          </p>
          
          {/* Connection status indicator */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-4 ${
            isOnline
              ? 'bg-green-900 text-green-300'
              : 'bg-red-900 text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-green-400' : 'bg-red-400'
            }`} />
            {isOnline ? 'Connected' : 'Offline'}
          </div>

          {retryCount > 0 && (
            <p className="text-yellow-400 text-sm mb-4">
              Attempted {retryCount} time{retryCount !== 1 ? 's' : ''} to reconnect
            </p>
          )}

          {lastSuccessfulLoad && (
            <p className="text-gray-400 text-xs mb-4">
              Last successful load: {lastSuccessfulLoad.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            disabled={loading || !isOnline}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Retry loading data"
          >
            {loading ? 'Retrying...' : !isOnline ? 'Waiting for Connection...' : 'Try Again'}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
          >
            Reload Page
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 space-y-2">
            <p>Troubleshooting tips:</p>
            <ul className="text-left space-y-1 ml-4">
              <li>• Check your internet connection</li>
              <li>• Disable ad blockers or VPN if enabled</li>
              <li>• Try refreshing the page</li>
              <li>• Clear browser cache and cookies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ), [error, retryCount, loading, handleRetry, isOnline, lastSuccessfulLoad]);

  // Memoize main content before any conditional returns
  const mainContent = useMemo(() => {
    if (!appData) return null;
    
    return (
      <div className="h-screen w-screen overflow-hidden">
        {/* Full Screen Interactive Map */}
        <main id="main-content" className="h-full w-full">
          <LazyInteractiveMap />
        </main>
        
        {/* Top Stats Bar */}
        <TopBar />
      </div>
    );
  }, [appData, totalAreas, areasWithAnalytics, analysisDate]);

  // All conditional returns after all hooks
  if (loading) return loadingComponent;
  if (error) return errorComponent;
  if (!appData) return null;

  return (
    <ErrorBoundary>
      {mainContent}
      <CookieBanner />
    </ErrorBoundary>
  );
});

App.displayName = 'App';

export default App;