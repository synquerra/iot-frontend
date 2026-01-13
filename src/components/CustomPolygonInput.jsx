import React from "react";

export default function CustomPolygonInput({ points, onPointsChange }) {
  const updatePoint = (index, field, value) => {
    const newPoints = [...points];
    newPoints[index][field] = parseFloat(value) || 0;
    onPointsChange(newPoints);
  };

  return (
    <div className="space-y-4">
      <label className="text-blue-200/80 text-sm font-medium block">
        Polygon Coordinates (5 points)
      </label>

      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-blue-500/20">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-300 text-sm font-medium">
              {index + 1}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  step="0.000001"
                  value={points[index]?.latitude || 0}
                  onChange={(e) => updatePoint(index, 'latitude', e.target.value)}
                  placeholder="Latitude"
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:bg-white/15 focus:border-blue-400/60 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.000001"
                  value={points[index]?.longitude || 0}
                  onChange={(e) => updatePoint(index, 'longitude', e.target.value)}
                  placeholder="Longitude"
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:bg-white/15 focus:border-blue-400/60 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
