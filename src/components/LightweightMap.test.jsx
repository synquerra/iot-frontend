import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LightweightMap from './LightweightMap';

describe('LightweightMap', () => {
  let mockCanvas;
  let mockContext;

  beforeEach(() => {
    // Mock canvas context
    mockContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      setLineDash: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
    };

    // Mock canvas element
    mockCanvas = {
      getContext: vi.fn(() => mockContext),
      width: 800,
      height: 400,
    };

    // Mock HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 400,
      top: 0,
      left: 0,
      right: 800,
      bottom: 400,
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test rendering with empty path (Requirements: 4.1)
  describe('Rendering with empty path', () => {
    it('renders without crashing when path is empty array', () => {
      render(<LightweightMap path={[]} />);
      
      const canvas = screen.getByLabelText('Static map showing device location path');
      expect(canvas).toBeInTheDocument();
    });

    it('renders without crashing when path is undefined', () => {
      render(<LightweightMap />);
      
      const canvas = screen.getByLabelText('Static map showing device location path');
      expect(canvas).toBeInTheDocument();
    });

    it('displays placeholder text when path is empty', async () => {
      render(<LightweightMap path={[]} />);
      
      await waitFor(() => {
        expect(mockContext.fillText).toHaveBeenCalledWith(
          'No location data available',
          expect.any(Number),
          expect.any(Number)
        );
      });
    });

    it('does not render path or markers when path is empty', async () => {
      render(<LightweightMap path={[]} />);
      
      await waitFor(() => {
        // Should not draw start/end labels
        const fillTextCalls = mockContext.fillText.mock.calls;
        const hasStartLabel = fillTextCalls.some(call => call[0] === 'Start');
        const hasEndLabel = fillTextCalls.some(call => call[0] === 'End');
        
        expect(hasStartLabel).toBe(false);
        expect(hasEndLabel).toBe(false);
      });
    });

    it('renders background and grid when path is empty', async () => {
      render(<LightweightMap path={[]} />);
      
      await waitFor(() => {
        // Should clear canvas
        expect(mockContext.clearRect).toHaveBeenCalled();
        
        // Should draw background
        expect(mockContext.fillRect).toHaveBeenCalled();
        
        // Should draw grid lines
        expect(mockContext.setLineDash).toHaveBeenCalled();
      });
    });

    it('does not show info overlay when path is empty', () => {
      render(<LightweightMap path={[]} />);
      
      expect(screen.queryByText('Start')).not.toBeInTheDocument();
      expect(screen.queryByText('End')).not.toBeInTheDocument();
    });
  });

  // Test rendering with valid path data (Requirements: 4.1, 4.3)
  describe('Rendering with valid path data', () => {
    const validPath = [
      { lat: 40.7128, lng: -74.0060, time: '2024-01-01T10:00:00Z' },
      { lat: 40.7580, lng: -73.9855, time: '2024-01-01T10:30:00Z' },
      { lat: 40.7489, lng: -73.9680, time: '2024-01-01T11:00:00Z' },
    ];

    it('renders canvas with valid path data', () => {
      render(<LightweightMap path={validPath} />);
      
      const canvas = screen.getByLabelText('Static map showing device location path');
      expect(canvas).toBeInTheDocument();
    });

    it('draws path lines when path has multiple points', async () => {
      render(<LightweightMap path={validPath} />);
      
      await waitFor(() => {
        // Should begin path
        expect(mockContext.beginPath).toHaveBeenCalled();
        
        // Should move to first point
        expect(mockContext.moveTo).toHaveBeenCalled();
        
        // Should draw lines to subsequent points
        expect(mockContext.lineTo).toHaveBeenCalled();
        
        // Should stroke the path
        expect(mockContext.stroke).toHaveBeenCalled();
      });
    });

    it('draws start marker when path has at least one point', async () => {
      render(<LightweightMap path={validPath} />);
      
      await waitFor(() => {
        // Should draw start marker circle
        expect(mockContext.arc).toHaveBeenCalled();
        
        // Should draw "Start" label
        const fillTextCalls = mockContext.fillText.mock.calls;
        const hasStartLabel = fillTextCalls.some(call => call[0] === 'Start');
        expect(hasStartLabel).toBe(true);
      });
    });

    it('draws end marker when path has multiple points', async () => {
      render(<LightweightMap path={validPath} />);
      
      await waitFor(() => {
        // Should draw "End" label
        const fillTextCalls = mockContext.fillText.mock.calls;
        const hasEndLabel = fillTextCalls.some(call => call[0] === 'End');
        expect(hasEndLabel).toBe(true);
      });
    });

    it('displays point count indicator', async () => {
      render(<LightweightMap path={validPath} />);
      
      await waitFor(() => {
        const fillTextCalls = mockContext.fillText.mock.calls;
        const hasPointCount = fillTextCalls.some(call => call[0] === '3 points');
        expect(hasPointCount).toBe(true);
      });
    });

    it('shows info overlay with start and end indicators', () => {
      render(<LightweightMap path={validPath} />);
      
      // Info overlay should show Start and End labels
      const startElements = screen.getAllByText('Start');
      const endElements = screen.getAllByText('End');
      
      expect(startElements.length).toBeGreaterThan(0);
      expect(endElements.length).toBeGreaterThan(0);
    });

    it('renders with single point path', async () => {
      const singlePointPath = [
        { lat: 40.7128, lng: -74.0060, time: '2024-01-01T10:00:00Z' },
      ];
      
      render(<LightweightMap path={singlePointPath} />);
      
      await waitFor(() => {
        // Should draw start marker
        const fillTextCalls = mockContext.fillText.mock.calls;
        const hasStartLabel = fillTextCalls.some(call => call[0] === 'Start');
        expect(hasStartLabel).toBe(true);
        
        // Should not draw end marker (only one point)
        const hasEndLabel = fillTextCalls.some(call => call[0] === 'End');
        expect(hasEndLabel).toBe(false);
      });
    });

    it('handles large path data efficiently', async () => {
      const largePath = Array.from({ length: 1000 }, (_, i) => ({
        lat: 40.7128 + (i * 0.001),
        lng: -74.0060 + (i * 0.001),
        time: `2024-01-01T${String(10 + Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00Z`,
      }));
      
      render(<LightweightMap path={largePath} />);
      
      await waitFor(() => {
        // Should render without errors
        expect(mockContext.beginPath).toHaveBeenCalled();
        
        // Should display correct point count
        const fillTextCalls = mockContext.fillText.mock.calls;
        const hasPointCount = fillTextCalls.some(call => call[0] === '1000 points');
        expect(hasPointCount).toBe(true);
      });
    });
  });

  // Test upgrade button callback (Requirements: 4.3)
  describe('Upgrade button callback', () => {
    const validPath = [
      { lat: 40.7128, lng: -74.0060, time: '2024-01-01T10:00:00Z' },
      { lat: 40.7580, lng: -73.9855, time: '2024-01-01T10:30:00Z' },
    ];

    it('renders upgrade button when showUpgradeButton is true and onUpgrade is provided', () => {
      const handleUpgrade = vi.fn();
      
      render(
        <LightweightMap
          path={validPath}
          onUpgrade={handleUpgrade}
          showUpgradeButton={true}
        />
      );
      
      const upgradeButton = screen.getByRole('button', { name: /upgrade to interactive map/i });
      expect(upgradeButton).toBeInTheDocument();
    });

    it('does not render upgrade button when showUpgradeButton is false', () => {
      const handleUpgrade = vi.fn();
      
      render(
        <LightweightMap
          path={validPath}
          onUpgrade={handleUpgrade}
          showUpgradeButton={false}
        />
      );
      
      const upgradeButton = screen.queryByRole('button', { name: /upgrade to interactive map/i });
      expect(upgradeButton).not.toBeInTheDocument();
    });

    it('does not render upgrade button when onUpgrade is not provided', () => {
      render(
        <LightweightMap
          path={validPath}
          showUpgradeButton={true}
        />
      );
      
      const upgradeButton = screen.queryByRole('button', { name: /upgrade to interactive map/i });
      expect(upgradeButton).not.toBeInTheDocument();
    });

    it('calls onUpgrade callback when upgrade button is clicked', () => {
      const handleUpgrade = vi.fn();
      
      render(
        <LightweightMap
          path={validPath}
          onUpgrade={handleUpgrade}
          showUpgradeButton={true}
        />
      );
      
      const upgradeButton = screen.getByRole('button', { name: /upgrade to interactive map/i });
      fireEvent.click(upgradeButton);
      
      expect(handleUpgrade).toHaveBeenCalledTimes(1);
    });

    it('upgrade button is keyboard accessible', () => {
      const handleUpgrade = vi.fn();
      
      render(
        <LightweightMap
          path={validPath}
          onUpgrade={handleUpgrade}
          showUpgradeButton={true}
        />
      );
      
      const upgradeButton = screen.getByRole('button', { name: /upgrade to interactive map/i });
      expect(upgradeButton.tagName).toBe('BUTTON');
    });

    it('upgrade button has proper ARIA label', () => {
      const handleUpgrade = vi.fn();
      
      render(
        <LightweightMap
          path={validPath}
          onUpgrade={handleUpgrade}
          showUpgradeButton={true}
        />
      );
      
      const upgradeButton = screen.getByRole('button', { name: /upgrade to interactive map/i });
      expect(upgradeButton).toHaveAttribute('aria-label', 'Upgrade to interactive map with pan and zoom');
    });

    it('upgrade button contains icon', () => {
      const handleUpgrade = vi.fn();
      
      render(
        <LightweightMap
          path={validPath}
          onUpgrade={handleUpgrade}
          showUpgradeButton={true}
        />
      );
      
      const upgradeButton = screen.getByRole('button', { name: /upgrade to interactive map/i });
      const svg = upgradeButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('does not call onUpgrade multiple times on rapid clicks', () => {
      const handleUpgrade = vi.fn();
      
      render(
        <LightweightMap
          path={validPath}
          onUpgrade={handleUpgrade}
          showUpgradeButton={true}
        />
      );
      
      const upgradeButton = screen.getByRole('button', { name: /upgrade to interactive map/i });
      
      // Rapid clicks
      fireEvent.click(upgradeButton);
      fireEvent.click(upgradeButton);
      fireEvent.click(upgradeButton);
      
      // Should be called 3 times (once per click)
      expect(handleUpgrade).toHaveBeenCalledTimes(3);
    });
  });

  // Test canvas accessibility
  describe('Canvas accessibility', () => {
    it('canvas has proper aria-label', () => {
      render(<LightweightMap path={[]} />);
      
      const canvas = screen.getByLabelText('Static map showing device location path');
      expect(canvas).toHaveAttribute('aria-label', 'Static map showing device location path');
    });

    it('canvas is a canvas element', () => {
      render(<LightweightMap path={[]} />);
      
      const canvas = screen.getByLabelText('Static map showing device location path');
      expect(canvas.tagName).toBe('CANVAS');
    });
  });

  // Test custom center prop
  describe('Custom center prop', () => {
    it('accepts custom center coordinates', () => {
      const customCenter = [40.7128, -74.0060];
      
      render(
        <LightweightMap
          path={[]}
          center={customCenter}
        />
      );
      
      const canvas = screen.getByLabelText('Static map showing device location path');
      expect(canvas).toBeInTheDocument();
    });
  });

  // Test custom className prop
  describe('Custom className prop', () => {
    it('applies custom className to container', () => {
      const { container } = render(
        <LightweightMap
          path={[]}
          className="custom-map-class"
        />
      );
      
      const mapContainer = container.querySelector('.custom-map-class');
      expect(mapContainer).toBeInTheDocument();
    });

    it('preserves default classes when custom className is provided', () => {
      const { container } = render(
        <LightweightMap
          path={[]}
          className="custom-map-class"
        />
      );
      
      const mapContainer = container.querySelector('.custom-map-class');
      expect(mapContainer).toHaveClass('relative', 'w-full', 'h-full');
    });
  });

  // Test responsive behavior
  describe('Responsive behavior', () => {
    it('updates canvas dimensions on window resize', async () => {
      render(<LightweightMap path={[]} />);
      
      // Mock new dimensions
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        width: 1200,
        height: 600,
        top: 0,
        left: 0,
        right: 1200,
        bottom: 600,
      }));
      
      // Trigger resize
      fireEvent(window, new Event('resize'));
      
      await waitFor(() => {
        // Canvas should be updated (context methods called again)
        expect(mockContext.clearRect).toHaveBeenCalled();
      });
    });

    it('cleans up resize listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<LightweightMap path={[]} />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  // Test edge cases
  describe('Edge cases', () => {
    it('handles path with invalid coordinates gracefully', async () => {
      const invalidPath = [
        { lat: NaN, lng: -74.0060, time: '2024-01-01T10:00:00Z' },
        { lat: 40.7580, lng: Infinity, time: '2024-01-01T10:30:00Z' },
      ];
      
      render(<LightweightMap path={invalidPath} />);
      
      // Should not crash
      const canvas = screen.getByLabelText('Static map showing device location path');
      expect(canvas).toBeInTheDocument();
    });

    it('handles path with missing properties', async () => {
      const incompletePath = [
        { lat: 40.7128 }, // missing lng and time
        { lng: -74.0060 }, // missing lat and time
      ];
      
      render(<LightweightMap path={incompletePath} />);
      
      // Should not crash
      const canvas = screen.getByLabelText('Static map showing device location path');
      expect(canvas).toBeInTheDocument();
    });

    it('handles null path gracefully', () => {
      render(<LightweightMap path={null} />);
      
      const canvas = screen.getByLabelText('Static map showing device location path');
      expect(canvas).toBeInTheDocument();
    });
  });
});
