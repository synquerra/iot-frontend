import React, { useState } from "react";
import { Card } from "../design-system/components";
import { Button } from "../design-system/components";
import { Loading } from "../design-system/components";
import { cn } from "../design-system/utils/cn";

export default function Configuration() {
  const [lowBatteryPercent, setLowBatteryPercent] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("features");
  
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
  });

  const handleToggleChange = (label, checked) => {
    setToggleStates(prev => ({
      ...prev,
      [label]: checked
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

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
    });
    setLowBatteryPercent(10);
  };

  const tabs = [
    { id: "features", label: "Features", icon: "⚙️" },
    { id: "battery", label: "Battery", icon: "🔋" },
    { id: "network", label: "Network", icon: "📡" },
    { id: "security", label: "Security", icon: "🔒" }
  ];

  const activeFeatures = Object.values(toggleStates).filter(Boolean).length;
  const disabledFeatures = Object.values(toggleStates).filter(v => !v).length;

  return (
    <div className="space-y-8 p-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-teal-600/20 border border-blue-500/30 backdrop-blur-xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 animate-pulse" />
          <div className="absolute top-6 left-6 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-6 right-6 w-40 h-40 bg-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">
                Device Configuration
              </h1>
              <p className="text-blue-100/90 text-lg leading-relaxed max-w-2xl">
                Configure device settings, features, and system parameters for optimal performance
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-blue-200/80 text-sm">Active Features</div>
                <div className="text-green-300 text-xl font-bold">{activeFeatures}/{Object.keys(toggleStates).length}</div>
                <div className="text-blue-200/70 text-xs">Configuration Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card variant="glass" colorScheme="slate" padding="sm" className="backdrop-blur-xl">
        <Card.Content>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                  activeTab === tab.id
                    ? 'bg-blue-500/80 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Configuration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass" colorScheme="green" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-green-200/80 text-sm font-medium mb-1">Active Features</div>
                <div className="text-white text-3xl font-bold mb-2">{activeFeatures}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-200/70 text-xs">Enabled</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="amber" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-amber-200/80 text-sm font-medium mb-1">Disabled Features</div>
                <div className="text-white text-3xl font-bold mb-2">{disabledFeatures}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-amber-200/70 text-xs">Inactive</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="glass" colorScheme="purple" padding="lg" hover={true} className="group">
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-purple-200/80 text-sm font-medium mb-1">Battery Alert</div>
                <div className="text-white text-3xl font-bold mb-2">{lowBatteryPercent}%</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-200/70 text-xs">Threshold</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Tab Content */}
      {activeTab === "features" && (
        <Card variant="glass" colorScheme="slate" padding="lg">
          <Card.Content>
            <h3 className="text-white text-lg font-semibold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              Feature Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(toggleStates).map(([label, checked]) => (
                <div key={label} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      checked ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                    )}></div>
                    <span className="text-white font-medium">{label}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => handleToggleChange(label, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {activeTab === "battery" && (
        <Card variant="glass" colorScheme="purple" padding="lg">
          <Card.Content>
            <h3 className="text-purple-300 text-lg font-semibold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
              </svg>
              Battery Settings
            </h3>
            <div className="space-y-6">
              <div className="max-w-md">
                <label className="text-purple-200/80 text-sm font-medium block mb-3">
                  Low Battery Threshold (%)
                </label>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={lowBatteryPercent}
                    onChange={(e) => setLowBatteryPercent(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-purple-200/60">
                    <span>1%</span>
                    <span className="text-white font-bold">{lowBatteryPercent}%</span>
                    <span>50%</span>
                  </div>
                </div>
                <p className="text-purple-200/70 text-sm mt-3">
                  Alert when battery level drops below this percentage
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-purple-200/80 text-sm font-medium mb-2">Power Saving Mode</div>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Auto Enable at 20%</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-purple-200/80 text-sm font-medium mb-2">Battery Optimization</div>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Smart Charging</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}

      {activeTab === "network" && (
        <Card variant="glass" colorScheme="blue" padding="lg">
          <Card.Content>
            <h3 className="text-blue-300 text-lg font-semibold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              Network Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-blue-200/80 text-sm font-medium mb-3">Connection Settings</div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Auto Reconnect</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Data Roaming</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-blue-200/80 text-sm font-medium mb-3">Data Usage</div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Data Limit Alerts</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Background Data</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}

      {activeTab === "security" && (
        <Card variant="glass" colorScheme="red" padding="lg">
          <Card.Content>
            <h3 className="text-red-300 text-lg font-semibold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-red-200/80 text-sm font-medium mb-3">Access Control</div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Device Lock</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Remote Wipe</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-red-200/80 text-sm font-medium mb-3">Encryption</div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Data Encryption</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Secure Boot</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <Card variant="glass" colorScheme="slate" padding="lg">
        <Card.Content>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant="glass"
              colorScheme="green"
              size="lg"
              onClick={handleSave}
              disabled={isLoading}
              className="min-w-[150px]"
            >
              {isLoading ? (
                <Loading type="spinner" size="sm" color="white" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Configuration
                </>
              )}
            </Button>
            <Button
              variant="outline"
              colorScheme="amber"
              size="lg"
              onClick={handleReset}
              className="min-w-[150px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset to Defaults
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="min-w-[150px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Config
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
