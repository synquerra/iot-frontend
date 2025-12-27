import React, { useState } from "react";
import { Card, Button, Input } from '../design-system/components'

export default function Configuration() {
  const [lowBatteryPercent, setLowBatteryPercent] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  
  const [toggleStates, setToggleStates] = useState({
    "Access to Police": true,
    "Calling Enable": true,
    "Orig call Enable": false,
    "Extended History": true,
    "Temp Comp.": false,
    "AI Anomaly": true,
    "Airplane Mode": false,
    "Ble Enabled": true,
    "Battery Reserved": true
  })

  const handleToggleChange = (label, checked) => {
    setToggleStates(prev => ({
      ...prev,
      [label]: checked
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleReset = () => {
    setToggleStates({
      "Access to Police": true,
      "Calling Enable": true,
      "Orig call Enable": false,
      "Extended History": true,
      "Temp Comp.": false,
      "AI Anomaly": true,
      "Airplane Mode": false,
      "Ble Enabled": true,
      "Battery Reserved": true
    })
    setLowBatteryPercent(10)
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Card variant="default" padding="lg">
        <Card.Header>
          <Card.Title>Data Configuration</Card.Title>
          <Card.Description>
            Configure device settings and system parameters for optimal performance
          </Card.Description>
        </Card.Header>
        
        <Card.Content>
          <div className="space-y-6">
            {/* Feature Toggles */}
            <div>
              <h4 className="text-base font-medium text-text-primary mb-4">
                Feature Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(toggleStates).map(([label, checked]) => (
                  <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary border border-border-primary">
                    <span className="text-sm font-medium text-text-primary">
                      {label}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => handleToggleChange(label, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Battery Configuration */}
            <div className="pt-6 border-t border-border-primary/50">
              <h4 className="text-base font-medium text-text-primary mb-4">
                Battery Settings
              </h4>
              <div className="max-w-md">
                <Input
                  label="Low Battery Threshold (%)"
                  type="number"
                  min="1"
                  max="50"
                  value={lowBatteryPercent}
                  onChange={(e) => setLowBatteryPercent(parseInt(e.target.value) || 10)}
                  helperText="Alert when battery level drops below this percentage"
                />
              </div>
            </div>

            {/* System Status */}
            <div className="pt-6 border-t border-border-primary/50">
              <h4 className="text-base font-medium text-text-primary mb-4">
                Configuration Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-surface-secondary border border-border-primary">
                  <div className="text-sm text-text-secondary">Active Features</div>
                  <div className="text-2xl font-bold text-status-success">
                    {Object.values(toggleStates).filter(Boolean).length}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-surface-secondary border border-border-primary">
                  <div className="text-sm text-text-secondary">Disabled Features</div>
                  <div className="text-2xl font-bold text-text-tertiary">
                    {Object.values(toggleStates).filter(v => !v).length}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-surface-secondary border border-border-primary">
                  <div className="text-sm text-text-secondary">Battery Alert</div>
                  <div className="text-2xl font-bold text-status-warning">
                    {lowBatteryPercent}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card.Content>
        
        <Card.Footer>
          <Button 
            variant="primary" 
            loading={isLoading}
            onClick={handleSave}
          >
            Save Configuration
          </Button>
          <Button 
            variant="secondary" 
            className="ml-2"
            onClick={handleReset}
          >
            Reset to Defaults
          </Button>
          <Button variant="ghost" className="ml-2">
            Export Config
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}
