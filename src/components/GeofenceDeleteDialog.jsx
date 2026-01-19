import React from 'react';
import { Card, Button, Loading } from '../design-system/components';
import { cn } from '../design-system/utils/cn';

/**
 * GeofenceDeleteDialog Component
 * Confirmation dialog for deleting geofences
 * 
 * @param {Object} props
 * @param {Object} props.geofence - Geofence object to delete
 * @param {boolean} props.isOpen - Whether dialog is open
 * @param {Function} props.onConfirm - Callback when delete is confirmed
 * @param {Function} props.onCancel - Callback when delete is cancelled
 * @param {boolean} props.loading - Whether deletion is in progress
 */
const GeofenceDeleteDialog = ({
  geofence,
  isOpen,
  onConfirm,
  onCancel,
  loading = false
}) => {
  if (!isOpen || !geofence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <Card variant="glass" colorScheme="red" padding="lg">
          <Card.Content>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-red-300 text-lg font-semibold">Delete Geofence</h3>
                <p className="text-red-200/70 text-sm">This action cannot be undone</p>
              </div>
            </div>

            {/* Geofence Details */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-red-200/80 text-sm">Name:</span>
                  <span className="text-red-100 font-medium">{geofence.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-200/80 text-sm">Coordinates:</span>
                  <span className="text-red-100 font-medium">{geofence.coordinates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-200/80 text-sm">Status:</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    geofence.status === 'active' 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-gray-500/20 text-gray-300'
                  )}>
                    {geofence.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 mb-6">
              <p className="text-red-200/90 text-sm">
                Are you sure you want to delete this geofence? This will remove the geofence from the device and cannot be recovered.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="glass"
                colorScheme="red"
                size="md"
                onClick={onConfirm}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loading type="spinner" size="sm" color="white" />
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                colorScheme="slate"
                size="md"
                onClick={onCancel}
                disabled={loading}
                className="flex-1"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default GeofenceDeleteDialog;
