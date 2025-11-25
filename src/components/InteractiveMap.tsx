import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { DomainTooltip } from './DomainTooltip';
import { TooltipData, AreaData, BaseComponentProps } from '../types';
import {
  IMAGE_CONSTANTS,
  TOOLTIP_CONSTANTS
} from '../constants';

interface HtmlMapArea {
  readonly coords: string;
  readonly href: string;
  readonly title: string;
  readonly domain: string;
}


interface InteractiveMapProps extends BaseComponentProps {
  readonly onDomainSelect?: (domain: string) => void;
  readonly onAreaHover?: (area: AreaData | HtmlMapArea) => void;
  readonly enableAnimations?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = memo((props) => {
  const {
    onDomainSelect: externalOnDomainSelect,
    onAreaHover: externalOnAreaHover,
    className,
    'data-testid': dataTestId
  } = props;
  const {
    appData,
    selectedDomain,
    highlightedAreas,
    setSelectedDomain
  } = useAppStore();

  const [tooltip, setTooltip] = useState<TooltipData>({
    domain: '',
    title: '',
    analytics: null,
    position: { x: 0, y: 0 },
    visible: false
  });

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [htmlMapAreas, setHtmlMapAreas] = useState<HtmlMapArea[]>([]);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mapAreasLoadedRef = useRef<boolean>(false);

  // Memoized function to parse domain from href
  const parseDomain = useMemo(() => (href: string): string => {
    try {
      const url = new URL(href);
      return url.hostname.replace('www.', '');
    } catch {
      // If URL parsing fails, try to extract domain from href
      const match = href.match(/\/\/(?:www\.)?([^/]+)/);
      return match ? match[1] : href;
    }
  }, []);

  // Load and parse the HTML map areas - with protection against multiple loads
  useEffect(() => {
    // Prevent multiple loads
    if (mapAreasLoadedRef.current) {
      return;
    }

    const loadMapAreas = async () => {
      try {
        mapAreasLoadedRef.current = true;
        const response = await fetch('/extracted-map.html');
        const htmlText = await response.text();
        
        // Parse the HTML to extract area elements
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const areas = doc.querySelectorAll('area');
        
        const parsedAreas = Array.from(areas).map(area => {
          const href = area.getAttribute('href') || '';
          const coords = area.getAttribute('coords') || '';
          const title = area.getAttribute('title') || '';
          
          return {
            coords,
            href,
            title,
            domain: parseDomain(href)
          };
        });
        
        setHtmlMapAreas(parsedAreas);
        // console.log(`Loaded ${parsedAreas.length} HTML map areas`);
        console.log(`InteractiveMap: Loading HTML map areas (component render #${Date.now()})`);
      } catch (error) {
        console.error('Failed to load HTML map areas:', error);
        mapAreasLoadedRef.current = false; // Reset on error to allow retry
      }
    };

    loadMapAreas();
  }, []); // Empty dependency array - load only once


  // Optimized mouse move handler with throttling
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!tooltip.visible) return;
    
    // Throttle mouse move updates for better performance
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      setTooltip(prev => ({
        ...prev,
        position: {
          x: e.clientX + TOOLTIP_CONSTANTS.OFFSET_X,
          y: e.clientY + TOOLTIP_CONSTANTS.OFFSET_Y
        }
      }));
    });
  }, [tooltip.visible]);

  // Optimized area hover handler with memoized domain lookup
  const domainLookupMap = useMemo(() => {
    if (!appData?.areas) return new Map();
    
    const map = new Map<string, AreaData>();
    appData.areas.forEach(area => {
      map.set(area.domain, area);
    });
    return map;
  }, [appData?.areas]);

  const handleAreaHover = useCallback((area: AreaData | HtmlMapArea, e: React.MouseEvent) => {
    // Check if it's an AreaData or HtmlMapArea
    const isAreaData = 'analytics' in area;
    const domain = area.domain;
    const title = area.title;
    let analytics = isAreaData ? area.analytics : null;
    
    // If it's an HTML map area, use the optimized lookup
    if (!isAreaData) {
      const matchingArea = domainLookupMap.get(domain);
      analytics = matchingArea?.analytics || null;
    }
    
    // Smart tooltip positioning - check if tooltip would be cut off at bottom
    const tooltipHeight = 200; // Approximate tooltip height
    const viewportHeight = window.innerHeight;
    const mouseY = e.clientY;
    
    // For bottom half of the image, show tooltip upwards
    // Check if mouse is in bottom half of viewport OR if tooltip would be cut off
    const shouldPositionAbove = mouseY > viewportHeight / 2 || mouseY + tooltipHeight > viewportHeight - 20;
    
    setTooltip({
      domain,
      title,
      analytics,
      position: {
        x: e.clientX + TOOLTIP_CONSTANTS.OFFSET_X,
        y: shouldPositionAbove
          ? e.clientY - tooltipHeight - 10  // Position above cursor
          : e.clientY + TOOLTIP_CONSTANTS.OFFSET_Y  // Position below cursor (default)
      },
      visible: true
    });

    // Call external hover handler if provided
    externalOnAreaHover?.(area);
  }, [domainLookupMap, externalOnAreaHover]);

  // Handle area leave
  const handleAreaLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  // Handle area click - works with both existing AreaData and HTML map areas
  const handleAreaClick = useCallback((area: AreaData | HtmlMapArea) => {
    setSelectedDomain(area.domain);
    externalOnDomainSelect?.(area.domain);
    // Hide tooltip when area is clicked/selected
    setTooltip(prev => ({ ...prev, visible: false }));
    
    // Open domain URL in new tab
    const url = area.domain.startsWith('http') ? area.domain : `https://${area.domain}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    
    // Refresh the page to fix any tooltip state issues
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
    // Optionally scroll to domain in search results
  }, [setSelectedDomain, externalOnDomainSelect]);

  // Scroll to selected domain when it changes
  useEffect(() => {
    if (selectedDomain && mapRef.current && appData) {
      const selectedArea = appData.areas.find(area => area.domain === selectedDomain);
      if (selectedArea) {
        // Calculate the center of the selected area
        const centerX = selectedArea.coordinates.x + selectedArea.coordinates.width / 2;
        const centerY = selectedArea.coordinates.y + selectedArea.coordinates.height / 2;
        
        // Scroll the map container to center the selected area
        const mapContainer = mapRef.current;
        const containerRect = mapContainer.getBoundingClientRect();
        
        mapContainer.scrollTo({
          left: centerX - containerRect.width / 2,
          top: centerY - containerRect.height / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedDomain, appData]);

  // Hide tooltip when selectedDomain changes (when an area is selected)
  useEffect(() => {
    if (selectedDomain) {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  }, [selectedDomain]);

  // Handle clicking on empty areas to clear selection
  const handleMapClick = useCallback((e: React.MouseEvent) => {
    // Only clear selection if clicking on the map container itself (not on areas)
    if (e.target === e.currentTarget) {
      setSelectedDomain(null);
    }
  }, [setSelectedDomain]);

  if (!appData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  // Memoize highlight functions
  const isHighlighted = useCallback((domain: string) => {
    return highlightedAreas.includes(domain) || selectedDomain === domain;
  }, [highlightedAreas, selectedDomain]);

  const getHighlightColor = useCallback((domain: string) => {
    if (selectedDomain === domain) return 'rgba(59, 130, 246, 0.6)'; // Blue for selected
    if (highlightedAreas.includes(domain)) return 'rgba(16, 185, 129, 0.4)'; // Green for search results
    return 'transparent';
  }, [selectedDomain, highlightedAreas]);

  // Optimized area rendering with better memoization
  const areasToRender = useMemo(() => {
    return htmlMapAreas.length > 0 ? htmlMapAreas : appData?.areas || [];
  }, [htmlMapAreas, appData?.areas]);

  // Memoize highlighted and non-highlighted areas separately for better performance
  const { highlightedAreasToRender, nonHighlightedAreas } = useMemo(() => {
    const highlighted: (AreaData | HtmlMapArea)[] = [];
    const nonHighlighted: (AreaData | HtmlMapArea)[] = [];
    
    areasToRender.forEach((area) => {
      const domain = area.domain;
      if (isHighlighted(domain)) {
        highlighted.push(area);
      } else {
        nonHighlighted.push(area);
      }
    });
    
    return {
      highlightedAreasToRender: highlighted,
      nonHighlightedAreas: nonHighlighted
    };
  }, [areasToRender, isHighlighted]);

  // Memoize coordinate parsing for HTML areas to avoid repeated calculations
  const parsedCoordinates = useMemo(() => {
    const coordMap = new Map<string, { x: number; y: number; width: number; height: number } | null>();
    
    areasToRender.forEach((area, index) => {
      const isHtmlArea = 'coords' in area;
      // Create truly unique keys by including coordinates or ID to handle duplicate domains
      const uniqueKey = isHtmlArea
        ? `html-${area.domain}-${area.coords}-${index}`
        : `area-${area.id || index}-${area.domain}`;
      
      if (isHtmlArea) {
        const coords = area.coords.split(',').map(Number);
        if (coords.length === 4 && !coords.some(isNaN)) {
          const x = Math.min(coords[0], coords[2]);
          const y = Math.min(coords[1], coords[3]);
          const width = Math.abs(coords[2] - coords[0]);
          const height = Math.abs(coords[3] - coords[1]);
          
          // Validate coordinates are within bounds - allow coordinates up to and including the boundary
          if (x >= 0 && y >= 0 && x + width <= IMAGE_CONSTANTS.ORIGINAL_WIDTH &&
              y + height <= IMAGE_CONSTANTS.ORIGINAL_HEIGHT && width > 0 && height > 0) {
            coordMap.set(uniqueKey, { x, y, width, height });
          } else {
            coordMap.set(uniqueKey, null);
          }
        } else {
          coordMap.set(uniqueKey, null);
        }
      } else {
        coordMap.set(uniqueKey, {
          x: area.coordinates.x,
          y: area.coordinates.y,
          width: area.coordinates.width,
          height: area.coordinates.height
        });
      }
    });
    
    return coordMap;
  }, [areasToRender]);

  return (
    <div
      className={`map-container-fullscreen ${className || ''}`}
      data-testid={dataTestId}
    >
      {/* Full Screen Map Container */}
      <div
        ref={mapRef}
        className="relative h-full w-full overflow-auto flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onClick={handleMapClick}
        role="img"
        aria-label="Interactive Million Dollar Homepage pixel map"
        tabIndex={0}
        style={{
          paddingTop: 'max(250px, 10vh',
          paddingBottom: '2vh'
        }}
      >
        {/* Background Image - Native 1000x1000 Resolution */}
        <div className="relative" style={{ minHeight: '1000px', minWidth: '1000px' }}>
          <img
            ref={imageRef}
            src="/image-map.png"
            alt="Million Dollar Homepage - Interactive pixel map with domain analytics"
            className={`native-resolution-image transition-opacity duration-300 pixel-art ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              width: '1000px',
              height: '1000px',
              maxWidth: 'none',
              maxHeight: 'none',
              objectFit: 'none',
              display: 'block'
            }}
            onLoad={() => {
              setImageLoaded(true);
            }}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            loading="eager"
            decoding="async"
            crossOrigin="anonymous"
          />

          {/* Loading State */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 min-h-[300px]">
              <div className="text-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-xs sm:text-sm text-gray-600" role="status" aria-live="polite">
                  Loading image...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 min-h-[300px]">
              <div className="text-center p-4">
                <p className="text-red-600 mb-2 text-sm sm:text-base">Failed to load image</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Unable to load the Million Dollar Homepage image from the original server
                </p>
              </div>
            </div>
          )}

          {/* HTML Map Areas Overlay - Native 1000x1000 pixel coordinates */}
          {imageLoaded && !imageError && imageRef.current && (
            <>
              {/* SVG overlay for highlighted areas - native resolution */}
              <svg
                className="absolute pointer-events-none"
                style={{
                  zIndex: 10,
                  left: 0,
                  top: 0,
                  width: '1000px',
                  height: '1000px',
                  overflow: 'visible'
                }}
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {highlightedAreasToRender.map((area, index) => {
                  const isHtmlArea = 'coords' in area;
                  // Create truly unique keys by including coordinates and index
                  const uniqueKey = isHtmlArea
                    ? `html-${area.domain}-${area.coords}-${index}`
                    : `area-${area.id || index}-${area.domain}`;
                  const coords = parsedCoordinates.get(uniqueKey);
                  
                  if (!coords) return null;
                  
                  const { x, y, width, height } = coords;
                  const domain = area.domain;
                  
                  return (
                    <motion.rect
                      key={`svg-highlighted-${index}-${uniqueKey}`}
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={getHighlightColor(domain)}
                      stroke={selectedDomain === domain ? '#3B82F6' : '#10B981'}
                      strokeWidth={2}
                      className="pointer-events-auto cursor-pointer"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        scale: selectedDomain === domain ? 1.05 : 1
                      }}
                      transition={{ duration: 0.2 }}
                      onMouseEnter={(e) => {
                        const mouseEvent = {
                          clientX: e.nativeEvent.clientX,
                          clientY: e.nativeEvent.clientY
                        } as React.MouseEvent;
                        handleAreaHover(area, mouseEvent);
                      }}
                      onMouseLeave={handleAreaLeave}
                      onClick={() => handleAreaClick(area)}
                      whileHover={{
                        opacity: 0.8,
                        transition: { duration: 0.1 }
                      }}
                    />
                  );
                })}
              </svg>

              {/* Invisible clickable areas for non-highlighted domains - native resolution */}
              <div
                className="absolute pointer-events-none"
                style={{
                  zIndex: 5,
                  left: 0,
                  top: 0,
                  width: '1000px',
                  height: '1000px',
                  overflow: 'hidden'
                }}
              >
                {nonHighlightedAreas.map((area, index) => {
                  const isHtmlArea = 'coords' in area;
                  // Create truly unique keys by including coordinates and index
                  const uniqueKey = isHtmlArea
                    ? `html-${area.domain}-${area.coords}-${index}`
                    : `area-${area.id || index}-${area.domain}`;
                  const coords = parsedCoordinates.get(uniqueKey);
                  
                  if (!coords) return null;
                  
                  const { x, y, width, height } = coords;
                  
                  // Use native pixel coordinates directly (1:1 ratio)
                  return (
                    <div
                      key={`clickable-nonhighlighted-${index}-${uniqueKey}`}
                      className="absolute cursor-pointer hover:bg-blue-200 hover:bg-opacity-30 transition-colors pointer-events-auto"
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        width: `${width}px`,
                        height: `${height}px`
                      }}
                      onMouseEnter={(e) => handleAreaHover(area, e)}
                      onMouseLeave={handleAreaLeave}
                      onClick={() => handleAreaClick(area)}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tooltip */}
      <DomainTooltip tooltip={tooltip} />

    </div>
  );
});

InteractiveMap.displayName = 'InteractiveMap';