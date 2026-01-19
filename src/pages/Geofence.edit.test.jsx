import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Geofence from './Geofence';

// Mock the hooks
vi.mock('../hooks/useGeofenceCommand', () => ({
  useGeofenceCommand: () => ({
    setGeofence: vi.fn().mockResolvedValue({}),
    loading: false,
    error: null,
    response: null
  })
}));

// Mock the map component
vi.mock('../components/GeofenceMap', () => ({
  default: ({ coordinates, onCoordinatesChange }) => (
    <div data-testid="geofence-map">
      <div data-testid="map-coordinates">{coordinates.length} points</div>
      <button 
        data-testid="mock-add-point"
        onClick={() => onCoordinatesChange([...coordinates, { latitude: 23.3, longitude: 85.3 }])}
      >
        Add Point
      </button>
    </div>
  )
}));

// Mock CustomPolygonInput
vi.mock('../components/CustomPolygonInput', () => ({
  default: ({ points, onPointsChange }) => (
    <div data-testid="custom-polygon-input">
      <div>{points.length} points</div>
    </div>
  )
}));

describe('Geofence Edit Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should enter edit mode when Edit button is clicked', () => {
    render(<Geofence />);
    
    // Click Overview tab to see geofences
    const overviewTab = screen.getByText('Overview');
    fireEvent.click(overviewTab);
    
    // Find and click Edit button for first geofence
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Should switch to Create tab and show "Edit Geofence" title
    expect(screen.getByText('Edit Geofence')).toBeInTheDocument();
  });

  it('should pre-populate form fields when editing', () => {
    render(<Geofence />);
    
    // Click Overview tab
    const overviewTab = screen.getByText('Overview');
    fireEvent.click(overviewTab);
    
    // Click Edit button for "Home" geofence
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check that geofence name is pre-populated
    const nameInput = screen.getByPlaceholderText('Enter geofence name');
    expect(nameInput.value).toBe('Home');
  });

  it('should show visual indicator for currently editing geofence', () => {
    render(<Geofence />);
    
    // Click Overview tab
    const overviewTab = screen.getByText('Overview');
    fireEvent.click(overviewTab);
    
    // Click Edit button for first geofence
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Go back to Overview tab
    fireEvent.click(overviewTab);
    
    // Should show "Editing" badge
    expect(screen.getByText('Editing')).toBeInTheDocument();
  });

  it('should show "Update Geofence" button text in edit mode', () => {
    render(<Geofence />);
    
    // Click Overview tab
    const overviewTab = screen.getByText('Overview');
    fireEvent.click(overviewTab);
    
    // Click Edit button
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Should show "Update Geofence" instead of "Save Geofence"
    expect(screen.getByText('Update Geofence')).toBeInTheDocument();
    expect(screen.queryByText('Save Geofence')).not.toBeInTheDocument();
  });

  it('should show "Cancel Edit" button in edit mode', () => {
    render(<Geofence />);
    
    // Click Overview tab
    const overviewTab = screen.getByText('Overview');
    fireEvent.click(overviewTab);
    
    // Click Edit button
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Should show "Cancel Edit" button
    expect(screen.getByText('Cancel Edit')).toBeInTheDocument();
  });

  it('should exit edit mode when Cancel Edit is clicked', () => {
    render(<Geofence />);
    
    // Enter edit mode
    const overviewTab = screen.getByText('Overview');
    fireEvent.click(overviewTab);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Verify we're in edit mode
    expect(screen.getByText('Edit Geofence')).toBeInTheDocument();
    
    // Click Cancel Edit
    const cancelButton = screen.getByText('Cancel Edit');
    fireEvent.click(cancelButton);
    
    // Should show "Create New Geofence" again
    expect(screen.getByText('Create New Geofence')).toBeInTheDocument();
    expect(screen.queryByText('Cancel Edit')).not.toBeInTheDocument();
  });

  it('should reset form fields when canceling edit', () => {
    render(<Geofence />);
    
    // Enter edit mode
    const overviewTab = screen.getByText('Overview');
    fireEvent.click(overviewTab);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Verify name is "Home"
    const nameInput = screen.getByPlaceholderText('Enter geofence name');
    expect(nameInput.value).toBe('Home');
    
    // Change the name
    fireEvent.change(nameInput, { target: { value: 'Modified Name' } });
    expect(nameInput.value).toBe('Modified Name');
    
    // Cancel edit
    const cancelButton = screen.getByText('Cancel Edit');
    fireEvent.click(cancelButton);
    
    // Name should be reset to default
    expect(nameInput.value).toBe('Home');
  });

  it('should update geofence in list after successful edit', async () => {
    render(<Geofence />);
    
    // Enter edit mode
    const overviewTab = screen.getByText('Overview');
    fireEvent.click(overviewTab);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Change the name
    const nameInput = screen.getByPlaceholderText('Enter geofence name');
    fireEvent.change(nameInput, { target: { value: 'Updated Home' } });
    
    // Mock window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Click Update
    const updateButton = screen.getByText('Update Geofence');
    fireEvent.click(updateButton);
    
    // Wait for update to complete
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Updated Home'));
    });
    
    alertSpy.mockRestore();
  });

  it('should not show Cancel Edit button in create mode', () => {
    render(<Geofence />);
    
    // Go to Create tab
    const createTab = screen.getByText('Create');
    fireEvent.click(createTab);
    
    // Should not show Cancel Edit button
    expect(screen.queryByText('Cancel Edit')).not.toBeInTheDocument();
    
    // Should show "Save Geofence"
    expect(screen.getByText('Save Geofence')).toBeInTheDocument();
  });

  it('should highlight edited geofence row with blue background', () => {
    const { container } = render(<Geofence />);
    
    // Enter edit mode
    const overviewTab = screen.getByText('Overview');
    fireEvent.click(overviewTab);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Go back to Overview
    fireEvent.click(overviewTab);
    
    // Find the geofence row with "Editing" badge
    const editingBadge = screen.getByText('Editing');
    const geofenceRow = editingBadge.closest('div[class*="bg-blue-500/20"]');
    
    expect(geofenceRow).toBeInTheDocument();
  });
});
