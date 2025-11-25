/**
 * Script to integrate Million Dollar Homepage area map data
 * with the analytics report data
 */

const fs = require('fs');

// Read the parsed area map data
const areaMapData = JSON.parse(fs.readFileSync('area-map-data.json', 'utf8'));
const analyticsData = JSON.parse(fs.readFileSync('data/report_20251113_121359.json', 'utf8'));

console.log(`Area map data: ${areaMapData.length} areas`);
console.log(`Analytics data: ${analyticsData.domains.length} domains`);

// Create a map of analytics data by domain for quick lookup
const analyticsMap = new Map();
analyticsData.domains.forEach(domain => {
  const cleanDomain = domain.domain.toLowerCase().replace('www.', '');
  analyticsMap.set(cleanDomain, domain);
});

// Integrate the data
const integratedData = areaMapData.map(area => {
  const cleanDomain = area.domain.toLowerCase().replace('www.', '');
  const analytics = analyticsMap.get(cleanDomain);
  
  return {
    ...area,
    analytics: analytics || null,
    hasAnalytics: !!analytics
  };
});

// Statistics
const withAnalytics = integratedData.filter(item => item.hasAnalytics).length;
const withoutAnalytics = integratedData.length - withAnalytics;

console.log(`\nIntegration Results:`);
console.log(`- Areas with analytics: ${withAnalytics}`);
console.log(`- Areas without analytics: ${withoutAnalytics}`);
console.log(`- Match rate: ${((withAnalytics / integratedData.length) * 100).toFixed(1)}%`);

// Save the integrated data
fs.writeFileSync('integrated-data.json', JSON.stringify(integratedData, null, 2));

// Create a summary for the React app
const appData = {
  metadata: {
    totalAreas: integratedData.length,
    areasWithAnalytics: withAnalytics,
    areasWithoutAnalytics: withoutAnalytics,
    matchRate: ((withAnalytics / integratedData.length) * 100).toFixed(1),
    coordinateRange: {
      minX: Math.min(...integratedData.map(area => area.coordinates.x)),
      maxX: Math.max(...integratedData.map(area => area.coordinates.x + area.coordinates.width)),
      minY: Math.min(...integratedData.map(area => area.coordinates.y)),
      maxY: Math.max(...integratedData.map(area => area.coordinates.y + area.coordinates.height))
    },
    analyticsMetadata: analyticsData.metadata
  },
  areas: integratedData
};

fs.writeFileSync('app-data.json', JSON.stringify(appData, null, 2));

console.log('✅ Integrated data saved to integrated-data.json');
console.log('✅ App data saved to app-data.json');

// Show some examples of matched domains
console.log('\nSample matched domains:');
integratedData
  .filter(item => item.hasAnalytics)
  .slice(0, 5)
  .forEach(item => {
    console.log(`- ${item.domain}: ${item.analytics.dns_status}, HTTP ${item.analytics.http_status}`);
  });