import React, { useState, useEffect } from "react";
import { Card } from "../design-system/components";
import { Button } from "../design-system/components";
import { Loading } from "../design-system/components";
import { cn } from "../design-system/utils/cn";

export default function Telemetry() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("live");
  const [telemetryData, setTelemetryData] = useState({
    imei: "7984561481678167",
    firmware: "516v151",
    status: "Online",
    lastSeen: "15-01-2025 03:56:41",
    normalPacket: {
      lat: 62.531135,
      lng: 63.513135,
      speed: 40,
      temp: 27,
      battery: 92
    },
    errorPacket: {
      code: "E1002",
      timestamp: "13-02-2011 12:53:49"
    },
    esim: {
      sim1: "Active",
      sim2: "Inactive"
    }
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: "live", label: "Live Data", icon: "📡" },
    { id: "packets", label: "Packets", icon: "📦" },
    { id: "esim", label: "E-SIM", icon: "📱" },
    { id: "controls", label: "Controls", icon: "🎛️" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading 
          type="spinner" 
          size="xl" 
          color="blue"
          text="Loading telemetry data..." 
          textPosition="bottom"
        />
      </div>
    );
  }

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
                Data Telemetry
              </h1>
              <p className="text-blue-100/90 text-lg leading-relaxed max-w-2xl">
                Real-time telemetry monitoring and packet analysis for IoT devices
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-blue-200/80 text-sm">Device Status</div>
                <div className="text-green-300 text-xl font-bold">{telemetryData.status}</div>
                <div className="text-blue-200/70 text-xs">Last: {telemetryData.lastSeen}</div>
              </div>
              <Button
                variant="glass"
                colorScheme="teal"
                size="lg"
                onClick={() => window.location.reload()}
                className="backdrop-blur-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
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
      {activeTab === "live" && (
        <div className="space-y-6">
          {/* Device Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="glass" colorScheme="blue" padding="lg" hover={true} className="group">
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-blue-200/80 text-sm font-medium mb-1">IMEI</div>
                    <div className="text-white text-lg font-bold mb-2 font-mono">{telemetryData.imei}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-200/70 text-xs">Device ID</span>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card variant="glass" colorScheme="purple" padding="lg" hover={true} className="group">
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-purple-200/80 text-sm font-medium mb-1">Firmware</div>
                    <div className="text-white text-lg font-bold mb-2">{telemetryData.firmware}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-purple-200/70 text-xs">Version</span>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card variant="glass" colorScheme="green" padding="lg" hover={true} className="group">
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-green-200/80 text-sm font-medium mb-1">Status</div>
                    <div className="text-white text-lg font-bold mb-2">{telemetryData.status}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-200/70 text-xs">Connected</span>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card variant="glass" colorScheme="amber" padding="lg" hover={true} className="group">
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-amber-200/80 text-sm font-medium mb-1">Last Seen</div>
                    <div className="text-white text-sm font-bold mb-2">{telemetryData.lastSeen}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                      <span className="text-amber-200/70 text-xs">Recent</span>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Live Telemetry Data */}
          <Card variant="glass" colorScheme="green" padding="lg">
            <Card.Content>
              <h3 className="text-green-300 text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                Live Telemetry Data
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-green-200/80 text-xs font-medium mb-2">Latitude</div>
                  <div className="text-white font-bold text-lg">{telemetryData.normalPacket.lat}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-green-200/80 text-xs font-medium mb-2">Longitude</div>
                  <div className="text-white font-bold text-lg">{telemetryData.normalPacket.lng}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-green-200/80 text-xs font-medium mb-2">Speed</div>
                  <div className="text-white font-bold text-lg">{telemetryData.normalPacket.speed} km/h</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-green-200/80 text-xs font-medium mb-2">Temperature</div>
                  <div className="text-white font-bold text-lg">{telemetryData.normalPacket.temp}°C</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-green-200/80 text-sm">Battery Level</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-white/20 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-400 transition-all duration-300"
                        style={{ width: `${telemetryData.normalPacket.battery}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-bold">{telemetryData.normalPacket.battery}%</span>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "packets" && (
        <div className="space-y-6">
          {/* Normal Packet */}
          <Card variant="glass" colorScheme="green" padding="lg">
            <Card.Content>
              <h3 className="text-green-300 text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Normal Packet (N)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-green-200/80">Latitude</span>
                  <span className="text-white font-mono">{telemetryData.normalPacket.lat}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-green-200/80">Longitude</span>
                  <span className="text-white font-mono">{telemetryData.normalPacket.lng}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-green-200/80">Speed</span>
                  <span className="text-white">{telemetryData.normalPacket.speed} km/h</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-green-200/80">Temperature</span>
                  <span className="text-white">{telemetryData.normalPacket.temp}°C</span>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Error Packet */}
          <Card variant="glass" colorScheme="red" padding="lg">
            <Card.Content>
              <h3 className="text-red-300 text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Error Packet (E)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-red-200/80">Error Code</span>
                  <span className="text-white font-mono bg-red-500/20 px-2 py-1 rounded">{telemetryData.errorPacket.code}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-red-200/80">Timestamp</span>
                  <span className="text-white text-sm">{telemetryData.errorPacket.timestamp}</span>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "esim" && (
        <div className="space-y-6">
          <Card variant="glass" colorScheme="slate" padding="lg">
            <Card.Content>
              <h3 className="text-white text-lg font-semibold mb-6 text-center flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                E-SIM Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card variant="glass" colorScheme="green" padding="lg">
                  <Card.Content>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold text-lg">SIM 1</h4>
                      <div className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full">
                        {telemetryData.esim.sim1}
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">Status</span>
                        <span className="text-green-400 font-semibold">{telemetryData.esim.sim1}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">Signal Strength</span>
                        <span className="text-white">85%</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-white/70">Data Usage</span>
                        <span className="text-white">2.3 GB</span>
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                <Card variant="glass" colorScheme="red" padding="lg">
                  <Card.Content>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold text-lg">SIM 2</h4>
                      <div className="px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded-full">
                        {telemetryData.esim.sim2}
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">Status</span>
                        <span className="text-red-400 font-semibold">{telemetryData.esim.sim2}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">Signal Strength</span>
                        <span className="text-white">0%</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-white/70">Data Usage</span>
                        <span className="text-white">0 GB</span>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {activeTab === "controls" && (
        <div className="space-y-6">
          <Card variant="glass" colorScheme="slate" padding="lg">
            <Card.Content>
              <h3 className="text-white text-lg font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
                Device Controls
              </h3>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  variant="glass"
                  colorScheme="amber"
                  size="lg"
                  className="min-w-[120px]"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  SOS
                </Button>
                <Button
                  variant="glass"
                  colorScheme="green"
                  size="lg"
                  className="min-w-[120px]"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ACK
                </Button>
                <Button
                  variant="glass"
                  colorScheme="red"
                  size="lg"
                  className="min-w-[120px]"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                  OFF
                </Button>
              </div>
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-amber-300 font-semibold text-sm">Warning</span>
                </div>
                <p className="text-amber-200 text-sm">
                  These controls send direct commands to your device. Use with caution as they may affect device operation.
                </p>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}
    </div>
  );
}
