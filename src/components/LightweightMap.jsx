import React, { useRef, useEffect, useState } from 'react';
import { Button } from '../design-system/components/Button';
import { Card } from '../design-system/components/Card';

/**
 * LightweightMap Component
 * 
 * A fast-loading static map using Canvas API without external dependencies.
 * Renders location paths with start/end markers and provides an upgrade option
 * to switch to the full interactive Leaflet map.
 * 
 * Features:
 * - Canvas-based rendering (no external tile dependencies)
 * - Simple path visualization with start/end markers
 * - Automatic bounds calculation and centering
 * - Upgrade button to load interactive map
 * - Minimal performance footprint
 * 
 * Requirements: 4.1, 4.3, 4.4
 */

const LightweightMap = ({
  path = [],
  center = null,
  onUpgrade = null,
  showUpgradeButton = true,
  className = '',
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update canvas dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate bounds from path data
  const calculateBounds = (points) => {
    if (!points || points.length === 0) {
      return {
        minLat: -90,
        maxLat: 90,
        minLng: -180,
        maxLng: 180,
        centerLat: 0,
        centerLng: 0,
      };
    }

    let minLat = points[0].lat;
    let maxLat = points[0].lat;
    let minLng = points[0].lng;
    let maxLng = points[0].lng;

    points.forEach(point => {
      minLat = Math.min(minLat, point.lat);
      maxLat = Math.max(maxLat, point.lat);
      minLng = Math.min(minLng, point.lng);
      maxLng = Math.max(maxLng, point.lng);
    });

    // Add padding (10% of range)
    const latPadding = (maxLat - minLat) * 0.1 || 0.1;
    const lngPadding = (maxLng - minLng) * 0.1 || 0.1;

    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
      centerLat: (minLat + maxLat) / 2,
      centerLng: (minLng + minLng) / 2,
    };
  };

  // Convert lat/lng to canvas coordinates
  const latLngToCanvas = (lat, lng, bounds, width, height) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * height;
    return { x, y };
  };

  // Draw the map on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#1a2332';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines for visual reference
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Vertical grid lines
    for (let i = 0; i <= 4; i++) {
      const x = (width / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // If no path data, show placeholder
    if (!path || path.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No location data available', width / 2, height / 2);
      return;
    }

    // Calculate bounds
    const bounds = calculateBounds(path);

    // Draw path
    if (path.length > 1) {
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      const firstPoint = latLngToCanvas(path[0].lat, path[0].lng, bounds, width, height);
      ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < path.length; i++) {
        const point = latLngToCanvas(path[i].lat, path[i].lng, bounds, width, height);
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
    }

    // Draw start marker
    if (path.length > 0) {
      const startPoint = latLngToCanvas(path[0].lat, path[0].lng, bounds, width, height);
      
      // Marker circle
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Marker border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('Start', startPoint.x, startPoint.y - 12);
    }

    // Draw end marker
    if (path.length > 1) {
      const endPoint = latLngToCanvas(
        path[path.length - 1].lat,
        path[path.length - 1].lng,
        bounds,
        width,
        height
      );
      
      // Marker circle
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(endPoint.x, endPoint.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Marker border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('End', endPoint.x, endPoint.y - 12);
    }

    // Draw point count indicator
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`${path.length} points`, width - 10, 10);

  }, [path, dimensions]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[400px] bg-surface-secondary rounded-lg overflow-hidden ${className}`}
    >
      {/* Canvas for map rendering */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        aria-label="Static map showing device location path"
      />

      {/* Upgrade button overlay */}
      {showUpgradeButton && onUpgrade && (
        <div className="absolute bottom-4 right-4">
          <Button
            variant="primary"
            colorScheme="violet"
            size="sm"
            onClick={onUpgrade}
            ariaLabel="Upgrade to interactive map with pan and zoom"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Upgrade to Interactive Map
          </Button>
        </div>
      )}

      {/* Info overlay */}
      {path && path.length > 0 && (
        <div className="absolute top-4 left-4 bg-surface-primary/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Start</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>End</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LightweightMap;
