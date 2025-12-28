import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../design-system/components";
import { Button } from "../design-system/components";
import { Loading } from "../design-system/components";
import { cn } from "../design-system/utils/cn";

export default function DeviceSettings() {
  const { imei } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    phoneNumber1: "9473XXXXXX",
    phoneNumber2: "9674XXXXXX",
    temperatureLimit: 42,
    speedLimit: 55,
    reportingInterval: 30,
    batteryThreshold: 20,
    gpsAccuracy: "high",
    dataEncryption: true,
    autoRestart: true,
    debugMode: false
  });

  const tabs = [
    { id: "general", label: "General", icon: "⚙️" },
    { id: "alerts", label: "Alerts", icon: "🚨" },
    { id: "connectivity", label: "Connectivity", icon: "📡" },
    { id: "security", label: "Security", icon: "🔒" }
  ];

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

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
              <div className="flex items-center gap-3 mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/devices')}
                  className="text-blue-200 hover:text-white"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Devices
                </Button>
                <div className="w-1 h-6 bg-blue-400/50 rounded-full"></div>
                <div className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                  Settings
                </div>
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
                Device Settings
              </h1>
              <p className="text-blue-100/90 text-lg leading-relaxed">
                Configure settings and parameters for device <span className="font-mono text-blue-200">{imei || "Device"}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-blue-200/80 text-sm">Device Status</div>
                <div className="text-green-300 text-xl font-bold">Online</div>
                <div className="text-blue-200/70 text-xs">Connected</div>
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

      {/* Tab Content */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <Card variant="glass" colorScheme="blue" padding="lg">
            <Card.Content>
              <h3 className="text-blue-300 text-lg font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                General Settings
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-blue-200/80 text-sm font-medium block mb-3">
                      Primary Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.phoneNumber1}
                      onChange={(e) => handleSettingChange('phoneNumber1', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:bg-white/15 focus:border-blue-400/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-blue-200/80 text-sm font-medium block mb-3">
                      Secondary Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.phoneNumber2}
                      onChange={(e) => handleSettingChange('phoneNumber2', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:bg-white/15 focus:border-blue-400/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-blue-200/80 text-sm font-medium block mb-3">
                      Reporting Interval (seconds)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="3600"
                      value={settings.reportingInterval}
                      onChange={(e) => handleSettingChange('reportingInterval', parseInt(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:bg-white/15 focus:border-blue-400/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-blue-200/80 text-sm font-medium block mb-3">
                      GPS Accuracy
                    </label>
                    <select
                      value={settings.gpsAccuracy}
                      onChange={(e) => handleSettingChange('gpsAccuracy', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:bg-white/15 focus:border-blue-400/60 focus:outline-none"
                    >
                      <option value="high" className="bg-slate-900">High Accuracy</option>
                      <option value="medium" className="bg-slate-900">Medium Accuracy</option>
                      <option value="low" className="bg-slate-900">Low Accuracy</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Auto Restart</div>
                      <div className="text-blue-200/70 text-sm">Automatically restart device on errors</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoRestart}
                        onChange={(e) => handleSettingChange('autoRestart', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Debug Mode</div>
                      <div className="text-blue-200/70 text-sm">Enable detailed logging and diagnostics</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.debugMode}
                        onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "alerts" && (
        <div className="space-y-6">
          <Card variant="glass" colorScheme="amber" padding="lg">
            <Card.Content>
              <h3 className="text-amber-300 text-lg font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Alert Thresholds
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-amber-200/80 text-sm font-medium block mb-3">
                      Temperature Limit (°C)
                    </label>
                    <input
                      type="number"
                      min="-40"
                      max="85"
                      value={settings.temperatureLimit}
                      onChange={(e) => handleSettingChange('temperatureLimit', parseInt(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:bg-white/15 focus:border-amber-400/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-amber-200/80 text-sm font-medium block mb-3">
                      Speed Limit (km/h)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={settings.speedLimit}
                      onChange={(e) => handleSettingChange('speedLimit', parseInt(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:bg-white/15 focus:border-amber-400/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-amber-200/80 text-sm font-medium block mb-3">
                    Battery Threshold (%)
                  </label>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={settings.batteryThreshold}
                      onChange={(e) => handleSettingChange('batteryThreshold', parseInt(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-amber-200/60">
                      <span>5%</span>
                      <span className="text-white font-bold">{settings.batteryThreshold}%</span>
                      <span>50%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "connectivity" && (
        <div className="space-y-6">
          <Card variant="glass" colorScheme="green" padding="lg">
            <Card.Content>
              <h3 className="text-green-300 text-lg font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                Connectivity Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Auto Reconnect</div>
                    <div className="text-green-200/70 text-sm">Automatically reconnect on connection loss</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Data Roaming</div>
                    <div className="text-green-200/70 text-sm">Allow data usage when roaming</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Low Power Mode</div>
                    <div className="text-green-200/70 text-sm">Reduce connectivity to save battery</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6">
          <Card variant="glass" colorScheme="red" padding="lg">
            <Card.Content>
              <h3 className="text-red-300 text-lg font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Data Encryption</div>
                    <div className="text-red-200/70 text-sm">Encrypt all data transmissions</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.dataEncryption}
                      onChange={(e) => handleSettingChange('dataEncryption', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Remote Lock</div>
                    <div className="text-red-200/70 text-sm">Allow remote device locking</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Secure Boot</div>
                    <div className="text-red-200/70 text-sm">Verify firmware integrity on startup</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
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
              disabled={loading}
              className="min-w-[150px]"
            >
              {loading ? (
                <Loading type="spinner" size="sm" color="white" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Settings
                </>
              )}
            </Button>
            <Button
              variant="outline"
              colorScheme="amber"
              size="lg"
              onClick={() => navigate(`/devices/${imei}`)}
              className="min-w-[150px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
