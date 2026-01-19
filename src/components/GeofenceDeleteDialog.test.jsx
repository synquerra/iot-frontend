import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GeofenceDeleteDialog from './GeofenceDeleteDialog';

describe('GeofenceDeleteDialog', () => {
  const mockGeofence = {
    id: 1,
    name: 'Home',
    status: 'active',
    coordinates: '5 points',
    radius: null
  };

  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog with geofence data when open', () => {
    render(
      <GeofenceDeleteDialog
        geofence={mockGeofence}
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        loading={false}
      />
    );

    expect(screen.getByText('Delete Geofence')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('5 points')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(
      <GeofenceDeleteDialog
        geofence={mockGeofence}
        isOpen={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        loading={false}
      />
    );

    expect(screen.queryByText('Delete Geofence')).not.toBeInTheDocument();
  });

  it('should not render when geofence is null', () => {
    render(
      <GeofenceDeleteDialog
        geofence={null}
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        loading={false}
      />
    );

    expect(screen.queryByText('Delete Geofence')).not.toBeInTheDocument();
  });

  it('should call onConfirm when Delete button is clicked', () => {
    render(
      <GeofenceDeleteDialog
        geofence={mockGeofence}
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        loading={false}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when Cancel button is clicked', () => {
    render(
      <GeofenceDeleteDialog
        geofence={mockGeofence}
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        loading={false}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should show loading spinner when loading is true', () => {
    render(
      <GeofenceDeleteDialog
        geofence={mockGeofence}
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        loading={true}
      />
    );

    // Loading component should be rendered
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('should disable buttons when loading', () => {
    render(
      <GeofenceDeleteDialog
        geofence={mockGeofence}
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        loading={true}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeDisabled();
  });

  it('should display warning message', () => {
    render(
      <GeofenceDeleteDialog
        geofence={mockGeofence}
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        loading={false}
      />
    );

    expect(screen.getByText(/Are you sure you want to delete this geofence/i)).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
  });

  it('should show correct status badge color for active geofence', () => {
    const { container } = render(
      <GeofenceDeleteDialog
        geofence={mockGeofence}
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        loading={false}
      />
    );

    const statusBadge = screen.getByText('active');
    expect(statusBadge).toHaveClass('bg-green-500/20', 'text-green-300');
  });

  it('should show correct status badge color for inactive geofence', () => {
    const inactiveGeofence = { ...mockGeofence, status: 'inactive' };
    
    render(
      <GeofenceDeleteDialog
        geofence={inactiveGeofence}
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        loading={false}
      />
    );

    const statusBadge = screen.getByText('inactive');
    expect(statusBadge).toHaveClass('bg-gray-500/20', 'text-gray-300');
  });
});
