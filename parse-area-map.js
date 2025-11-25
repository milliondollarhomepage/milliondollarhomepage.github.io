/**
 * Script to parse the Million Dollar Homepage area map data
 * and extract domain coordinates for our React application
 */

const fs = require('fs');

// Read the HTML file
const htmlContent = fs.readFileSync('milliondollarhomepage.html', 'utf8');

// Extract area elements using regex
const areaRegex = /<area[^>]*>/g;
const areas = htmlContent.match(areaRegex) || [];

// Parse each area element
const parsedAreas = areas.map((area, index) => {
  // Extract attributes
  const coordsMatch = area.match(/coords="([^"]+)"/);
  const hrefMatch = area.match(/href="([^"]+)"/);
  const titleMatch = area.match(/title="([^"]+)"/);
  
  if (!coordsMatch || !hrefMatch) {
    return null;
  }
  
  const coords = coordsMatch[1].split(',').map(Number);
  const href = hrefMatch[1];
  const title = titleMatch ? titleMatch[1] : '';
  
  // Extract domain from href
  let domain = '';
  try {
    if (href.startsWith('http')) {
      const url = new URL(href);
      domain = url.hostname.replace('www.', '');
    } else {
      // Handle relative URLs or special cases
      domain = href;
    }
  } catch (e) {
    domain = href;
  }
  
  // Convert coordinates to rectangle format
  const [x1, y1, x2, y2] = coords;
  
  return {
    id: index,
    domain: domain,
    title: title,
    href: href,
    coordinates: {
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1
    },
    rawCoords: coords
  };
}).filter(Boolean);

console.log(`Parsed ${parsedAreas.length} area elements`);

// Save the parsed data
fs.writeFileSync('area-map-data.json', JSON.stringify(parsedAreas, null, 2));

// Also create a summary
const summary = {
  totalAreas: parsedAreas.length,
  uniqueDomains: [...new Set(parsedAreas.map(area => area.domain))].length,
  coordinateRange: {
    minX: Math.min(...parsedAreas.map(area => area.coordinates.x)),
    maxX: Math.max(...parsedAreas.map(area => area.coordinates.x + area.coordinates.width)),
    minY: Math.min(...parsedAreas.map(area => area.coordinates.y)),
    maxY: Math.max(...parsedAreas.map(area => area.coordinates.y + area.coordinates.height))
  }
};

console.log('Summary:', summary);
fs.writeFileSync('area-map-summary.json', JSON.stringify(summary, null, 2));

console.log('✅ Area map data parsed and saved to area-map-data.json');
console.log('✅ Summary saved to area-map-summary.json');