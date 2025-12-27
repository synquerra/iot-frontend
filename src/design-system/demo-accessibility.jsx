/**
 * Accessibility Features Demo Page
 * Demonstrates all accessibility features implemented in the colorful UI redesign
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import React, { useState } from 'react';
import { 
  AccessibleWrapper, 
  AccessibleText, 
  AccessibleButton, 
  AccessibleStatusIndicator 
} from './components/AccessibleWrapper.jsx';
import { Button } from './components/Button.jsx';
import { Card } from './components/Card.jsx';
import { useAccessibility, useColorContrast, useAlternativeIndicators } from './hooks/useAccessibility.js';
import { accessibleColorUtils } from './tokens/accessibleColors.js';

export function AccessibilityDemo() {
  const [colorBlindMode, setColorBlindMode] = useState('none');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  const { preferences, utils, setColorBlindMode: setGlobalColorBlindMode } = useAccessibility();
  const { validateContrast } = useColorContrast();
  const { getStatusIndicator, getPriorityIndicator, getTrendIndicator } = useAlternativeIndicators();

  // Demo color combinations
  const demoColors = [
    { name: 'Primary', fg: '#ffffff', bg: '#7c3aed' },
    { name: 'Success', fg: '#ffffff', bg: '#16a34a' },
    { name: 'Warning', fg: '#000000', bg: '#f59e0b' },
    { name: 'Error', fg: '#ffffff', bg: '#dc2626' },
    { name: 'Info', fg: '#ffffff', bg: '#2563eb' },
  ];

  // Demo status indicators
  const statusExamples = ['success', 'warning', 'error', 'info'];
  const priorityExamples = ['high', 'medium', 'low'];
  const trendExamples = ['up', 'down', 'stable'];

  const handleColorBlindModeChange = (mode) => {
    setColorBlindMode(mode);
    setGlobalColorBlindMode(mode);
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Skip Link Demo */}
      <AccessibleWrapper skipLink skipLinkText="Skip to accessibility demo content">
        <div id="main-content">
          <h1 className="text-3xl font-bold mb-6">Accessibility Features Demo</h1>
          
          {/* Accessibility Controls */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Accessibility Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Color Blind Mode */}
              <div>
                <label className="block text-sm font-medium mb-2">Color Blind Mode</label>
                <select 
                  value={colorBlindMode}
                  onChange={(e) => handleColorBlindModeChange(e.target.value)}
                  className="w-full p-2 border rounded bg-surface-primary text-text-primary"
                >
                  <option value="none">None</option>
                  <option value="protanopia">Protanopia (Red-blind)</option>
                  <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                  <option value="tritanopia">Tritanopia (Blue-blind)</option>
                </select>
              </div>

              {/* High Contrast */}
              <div>
                <label className="block text-sm font-medium mb-2">High Contrast Mode</label>
                <AccessibleButton
                  variant={highContrast ? 'primary' : 'secondary'}
                  onClick={() => setHighContrast(!highContrast)}
                  ariaLabel={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
                >
                  {highContrast ? 'Enabled' : 'Disabled'}
                </AccessibleButton>
              </div>

              {/* Reduced Motion */}
              <div>
                <label className="block text-sm font-medium mb-2">Reduced Motion</label>
                <AccessibleButton
                  variant={reducedMotion ? 'primary' : 'secondary'}
                  onClick={() => setReducedMotion(!reducedMotion)}
                  ariaLabel={`${reducedMotion ? 'Disable' : 'Enable'} reduced motion`}
                >
                  {reducedMotion ? 'Enabled' : 'Disabled'}
                </AccessibleButton>
              </div>
            </div>
          </Card>

          {/* Color Contrast Demo */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">WCAG 2.1 AA Color Contrast</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoColors.map((color) => {
                const contrast = validateContrast(color.fg, color.bg);
                return (
                  <div
                    key={color.name}
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: color.bg, color: color.fg }}
                  >
                    <h3 className="font-semibold">{color.name}</h3>
                    <p className="text-sm">Contrast: {contrast.ratio.toFixed(2)}:1</p>
                    <p className="text-sm">Grade: {contrast.grade}</p>
                    <AccessibleStatusIndicator 
                      status={contrast.passes ? 'success' : 'error'}
                      showText={false}
                    />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Alternative Indicators Demo */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Alternative Indicators</h2>
            <p className="text-sm text-text-secondary mb-4">
              These indicators provide non-color ways to convey information, making content accessible to color-blind users.
            </p>
            
            <div className="space-y-6">
              {/* Status Indicators */}
              <div>
                <h3 className="font-medium mb-2">Status Indicators</h3>
                <div className="flex flex-wrap gap-4">
                  {statusExamples.map((status) => {
                    const indicator = getStatusIndicator(status);
                    return (
                      <div key={status} className="flex items-center gap-2 p-2 border rounded">
                        <span className={indicator.className} aria-hidden="true">
                          {indicator.icon}
                        </span>
                        <span className="capitalize">{status}</span>
                        <span className="sr-only">{indicator['aria-label']}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Priority Indicators */}
              <div>
                <h3 className="font-medium mb-2">Priority Indicators</h3>
                <div className="flex flex-wrap gap-4">
                  {priorityExamples.map((priority) => {
                    const indicator = getPriorityIndicator(priority);
                    return (
                      <div key={priority} className="flex items-center gap-2 p-2 border rounded">
                        <span className={indicator.className} aria-hidden="true">
                          {indicator.icon}
                        </span>
                        <span className="capitalize">{priority} Priority</span>
                        <span className="sr-only">{indicator['aria-label']}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trend Indicators */}
              <div>
                <h3 className="font-medium mb-2">Trend Indicators</h3>
                <div className="flex flex-wrap gap-4">
                  {trendExamples.map((trend) => {
                    const indicator = getTrendIndicator(trend);
                    return (
                      <div key={trend} className="flex items-center gap-2 p-2 border rounded">
                        <span className={indicator.className} aria-hidden="true">
                          {indicator.icon}
                        </span>
                        <span className="capitalize">{trend}</span>
                        <span className="sr-only">{indicator['aria-label']}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Color-Blind Friendly Chart Colors */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Color-Blind Friendly Chart Colors</h2>
            <p className="text-sm text-text-secondary mb-4">
              These colors are designed to be distinguishable for users with different types of color blindness.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {accessibleColorUtils.getChartColors(10).map((color, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg text-center text-white font-medium"
                  style={{ backgroundColor: color }}
                >
                  Color {index + 1}
                  <div className="text-xs mt-1 opacity-80">{color}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Accessible Buttons Demo */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Accessible Buttons</h2>
            <p className="text-sm text-text-secondary mb-4">
              Buttons with proper focus management, touch targets, and accessibility attributes.
            </p>
            <div className="flex flex-wrap gap-4">
              <AccessibleButton variant="primary">
                Primary Button
              </AccessibleButton>
              <AccessibleButton variant="secondary">
                Secondary Button
              </AccessibleButton>
              <AccessibleButton variant="outline" colorScheme="green">
                Success Button
              </AccessibleButton>
              <AccessibleButton variant="outline" colorScheme="amber">
                Warning Button
              </AccessibleButton>
              <AccessibleButton variant="outline" colorScheme="red">
                Error Button
              </AccessibleButton>
              <AccessibleButton loading loadingText="Processing your request...">
                Loading Button
              </AccessibleButton>
              <AccessibleButton disabled>
                Disabled Button
              </AccessibleButton>
            </div>
          </Card>

          {/* Motion Accessibility Demo */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Motion Accessibility</h2>
            <p className="text-sm text-text-secondary mb-4">
              Animations that respect user preferences for reduced motion.
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-violet-600 text-white rounded-lg animate-accessible-fade-in">
                Fade In Animation (respects reduced motion)
              </div>
              <div className="p-4 bg-blue-600 text-white rounded-lg animate-accessible-slide-in">
                Slide In Animation (respects reduced motion)
              </div>
            </div>
          </Card>

          {/* Focus Management Demo */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Focus Management</h2>
            <p className="text-sm text-text-secondary mb-4">
              Proper focus indicators and keyboard navigation support.
            </p>
            <div className="space-y-4">
              <AccessibleButton>
                Focus me with Tab
              </AccessibleButton>
              <AccessibleButton colorScheme="blue">
                Then focus me
              </AccessibleButton>
              <AccessibleButton colorScheme="green">
                Finally focus me
              </AccessibleButton>
            </div>
          </Card>

          {/* Screen Reader Support */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Screen Reader Support</h2>
            <p className="text-sm text-text-secondary mb-4">
              Content optimized for screen readers with proper ARIA labels and semantic markup.
            </p>
            <div className="space-y-4">
              <div>
                <span className="sr-only">This text is only visible to screen readers</span>
                <span>This text is visible to everyone</span>
              </div>
              <AccessibleText as="p" className="text-sm">
                This text component ensures proper contrast ratios automatically.
              </AccessibleText>
              <div role="status" aria-live="polite" className="sr-announce">
                Status updates will be announced to screen readers
              </div>
            </div>
          </Card>
        </div>
      </AccessibleWrapper>
    </div>
  );
}

export default AccessibilityDemo;