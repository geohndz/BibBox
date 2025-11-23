import { useEffect, useRef } from 'react';

/**
 * Calculate bounding box for coordinates
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

/**
 * Component for visualizing GPX route as a simple line drawing
 */
export function RouteVisualization({ routeData }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!routeData || !routeData.coordinates || routeData.coordinates.length === 0) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const padding = 40;
    const width = canvas.width;
    const height = canvas.height;
    const drawWidth = width - padding * 2;
    const drawHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, width, height);

    // Calculate bounds
    const bounds = routeData.bounds || calculateBounds(routeData.coordinates);
    const latRange = bounds.maxLat - bounds.minLat;
    const lonRange = bounds.maxLon - bounds.minLon;
    
    // Scale to fit
    const latScale = drawHeight / latRange;
    const lonScale = drawWidth / lonRange;
    const scale = Math.min(latScale, lonScale);

    // Center the route
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;
    const centerLon = (bounds.minLon + bounds.maxLon) / 2;

    // Draw route
    ctx.beginPath();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    routeData.coordinates.forEach((coord, index) => {
      const x = padding + drawWidth / 2 + (coord.lon - centerLon) * scale * drawWidth / lonRange;
      const y = padding + drawHeight / 2 - (coord.lat - centerLat) * scale * drawHeight / latRange;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw start point
    const start = routeData.coordinates[0];
    const startX = padding + drawWidth / 2 + (start.lon - centerLon) * scale * drawWidth / lonRange;
    const startY = padding + drawHeight / 2 - (start.lat - centerLat) * scale * drawHeight / latRange;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(startX, startY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw end point
    const end = routeData.coordinates[routeData.coordinates.length - 1];
    const endX = padding + drawWidth / 2 + (end.lon - centerLon) * scale * drawWidth / lonRange;
    const endY = padding + drawHeight / 2 - (end.lat - centerLat) * scale * drawHeight / latRange;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(endX, endY, 6, 0, Math.PI * 2);
    ctx.fill();

  }, [routeData]);

  if (!routeData || !routeData.coordinates || routeData.coordinates.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
        No route data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="w-full h-auto max-h-96 bg-gray-50 rounded-lg"
      />
      {routeData.stats && (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {routeData.stats.distance && (
            <div>
              <div className="text-gray-500">Distance</div>
              <div className="font-semibold">{routeData.stats.distance.toFixed(2)} km</div>
            </div>
          )}
          {routeData.stats.elevationGain && (
            <div>
              <div className="text-gray-500">Elevation Gain</div>
              <div className="font-semibold">{routeData.stats.elevationGain.toFixed(0)} m</div>
            </div>
          )}
          {routeData.stats.minElevation && (
            <div>
              <div className="text-gray-500">Min Elevation</div>
              <div className="font-semibold">{routeData.stats.minElevation.toFixed(0)} m</div>
            </div>
          )}
          {routeData.stats.maxElevation && (
            <div>
              <div className="text-gray-500">Max Elevation</div>
              <div className="font-semibold">{routeData.stats.maxElevation.toFixed(0)} m</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
