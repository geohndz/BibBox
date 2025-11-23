/**
 * Parse a GPX file and extract route data
 * @param {File} file - The GPX file
 * @returns {Promise<Object>} - Parsed GPX data with coordinates and stats
 */
export async function parseGPX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        
        // Check for parsing errors
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
          reject(new Error('Invalid GPX file format'));
          return;
        }
        
        const trkpts = xmlDoc.querySelectorAll('trkpt');
        const coordinates = [];
        
        trkpts.forEach(trkpt => {
          const lat = parseFloat(trkpt.getAttribute('lat'));
          const lon = parseFloat(trkpt.getAttribute('lon'));
          const ele = trkpt.querySelector('ele')?.textContent;
          
          if (!isNaN(lat) && !isNaN(lon)) {
            coordinates.push({
              lat,
              lon,
              elevation: ele ? parseFloat(ele) : null,
            });
          }
        });
        
        if (coordinates.length === 0) {
          reject(new Error('No track points found in GPX file'));
          return;
        }
        
        // Calculate distance and stats
        const stats = calculateRouteStats(coordinates);
        
        resolve({
          coordinates,
          stats,
          bounds: calculateBounds(coordinates),
        });
      } catch (error) {
        reject(new Error(`Failed to parse GPX file: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read GPX file'));
    reader.readAsText(file);
  });
}

/**
 * Calculate route statistics
 * @param {Array} coordinates - Array of coordinate objects
 * @returns {Object} - Route statistics
 */
function calculateRouteStats(coordinates) {
  let totalDistance = 0;
  let totalElevationGain = 0;
  let minElevation = Infinity;
  let maxElevation = -Infinity;
  
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];
    
    // Calculate distance using Haversine formula
    const distance = haversineDistance(prev.lat, prev.lon, curr.lat, curr.lon);
    totalDistance += distance;
    
    // Calculate elevation changes
    if (prev.elevation !== null && curr.elevation !== null) {
      if (curr.elevation > prev.elevation) {
        totalElevationGain += curr.elevation - prev.elevation;
      }
      minElevation = Math.min(minElevation, curr.elevation, prev.elevation);
      maxElevation = Math.max(maxElevation, curr.elevation, prev.elevation);
    }
  }
  
  return {
    distance: totalDistance, // in kilometers
    elevationGain: totalElevationGain,
    minElevation: minElevation === Infinity ? null : minElevation,
    maxElevation: maxElevation === -Infinity ? null : maxElevation,
    pointsCount: coordinates.length,
  };
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate bounding box for coordinates
 * @param {Array} coordinates - Array of coordinate objects
 * @returns {Object} - Bounding box
 */
function calculateBounds(coordinates) {
  const lats = coordinates.map(c => c.lat);
  const lons = coordinates.map(c => c.lon);
  
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
  };
}
