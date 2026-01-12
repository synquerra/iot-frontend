import React from 'react';

/**
 * FallbackMapView Component
 * 
 * Displays location data in a table format when map rendering fails completely.
 * This provides a graceful degradation path ensuring users can still access
 * their location data even when map libraries fail to load.
 * 
 * Requirements: 5.4
 */

const FallbackMapView = ({ path = [], error = null, onRetry = null }) => {
  // Sort path by time if available
  const sortedPath = [...path].sort((a, b) => {
    if (!a.time || !b.time) return 0;
    return new Date(a.time) - new Date(b.time);
  });

  // Calculate basic statistics
  const stats = {
    totalPoints: path.length,
    startPoint: path[0],
    endPoint: path[path.length - 1],
  };

  return (
    <div className="w-full h-full min-h-[400px] bg-surface-primary rounded-lg border border-border-primary p-6">
      {/* Error message header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-warning"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              Map Unavailable
            </h3>
            <p className="text-sm text-text-secondary">
              {error
                ? `Unable to load interactive map: ${error.message || 'Unknown error'}`
                : 'The interactive map could not be loaded. Showing location data in table format.'}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Retry Loading Map
              </button>
            )}
          </div>
        </div>

        {/* Statistics summary */}
        {stats.totalPoints > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-surface-secondary rounded-lg">
            <div>
              <div className="text-xs text-text-tertiary mb-1">Total Points</div>
              <div className="text-lg font-semibold text-text-primary">
                {stats.totalPoints}
              </div>
            </div>
            {stats.startPoint && (
              <div>
                <div className="text-xs text-text-tertiary mb-1">Start Location</div>
                <div className="text-sm text-text-secondary">
                  {stats.startPoint.lat.toFixed(6)}, {stats.startPoint.lng.toFixed(6)}
                </div>
                {stats.startPoint.time && (
                  <div className="text-xs text-text-tertiary mt-1">
                    {new Date(stats.startPoint.time).toLocaleString()}
                  </div>
                )}
              </div>
            )}
            {stats.endPoint && (
              <div>
                <div className="text-xs text-text-tertiary mb-1">End Location</div>
                <div className="text-sm text-text-secondary">
                  {stats.endPoint.lat.toFixed(6)}, {stats.endPoint.lng.toFixed(6)}
                </div>
                {stats.endPoint.time && (
                  <div className="text-xs text-text-tertiary mt-1">
                    {new Date(stats.endPoint.time).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location data table */}
      {sortedPath.length > 0 ? (
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface-secondary border-b border-border-primary">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">
                  #
                </th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">
                  Time
                </th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">
                  Latitude
                </th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">
                  Longitude
                </th>
                {sortedPath.some(p => p.speed !== undefined) && (
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">
                    Speed
                  </th>
                )}
                {sortedPath.some(p => p.accuracy !== undefined) && (
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">
                    Accuracy
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedPath.map((point, index) => (
                <tr
                  key={`point-${index}`}
                  className="border-b border-border-secondary hover:bg-surface-secondary/50 transition-colors"
                >
                  <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                  <td className="py-3 px-4 text-text-primary">
                    {point.time
                      ? new Date(point.time).toLocaleString()
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-text-primary font-mono">
                    {point.lat.toFixed(6)}
                  </td>
                  <td className="py-3 px-4 text-text-primary font-mono">
                    {point.lng.toFixed(6)}
                  </td>
                  {sortedPath.some(p => p.speed !== undefined) && (
                    <td className="py-3 px-4 text-text-secondary">
                      {point.speed !== undefined ? `${point.speed} km/h` : '-'}
                    </td>
                  )}
                  {sortedPath.some(p => p.accuracy !== undefined) && (
                    <td className="py-3 px-4 text-text-secondary">
                      {point.accuracy !== undefined ? `${point.accuracy}m` : '-'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-text-secondary">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-text-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p className="text-lg">No location data available</p>
        </div>
      )}
    </div>
  );
};

export default FallbackMapView;
