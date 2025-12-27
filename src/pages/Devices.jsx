// src/pages/Devices.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../design-system/components";
import { Table } from "../design-system/components";
import { Button } from "../design-system/components";
import { Loading } from "../design-system/components";
import { listDevices } from "../utils/device";


export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const { devices: items } = await listDevices();

        const normalized = items.map((d) => ({
          topic: d.topic || "-",
          imei: d.imei || "-",
          interval: d.interval ?? "-",
          geoid: d.geoid || "-",
          createdAt: d.createdAt || "-",
        }));

        setDevices(normalized);
      } catch (err) {
        setError(err.message || "Failed to load devices");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading 
          type="spinner" 
          size="lg" 
          color="accent"
          text="Loading devices..." 
          textPosition="bottom"
        />
      </div>
    );

  if (error)
    return (
      <div className="text-center">
        <Card variant="colorful" colorScheme="red" padding="lg" className="max-w-md mx-auto mt-10">
          <Card.Content className="text-center">
            <div className="text-red-400 text-lg font-medium mb-2">
              Error Loading Devices
            </div>
            <div className="text-red-300 text-sm">
              {error}
            </div>
          </Card.Content>
        </Card>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient Background */}
      <div className="bg-gradient-to-r from-violet-600/10 via-blue-600/10 to-teal-600/10 rounded-xl p-6 border border-violet-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Device Management</h1>
            <p className="text-slate-300">Monitor and manage your connected IoT devices</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="gradient"
              colorScheme="teal"
              size="md"
              onClick={() => navigate('/devices/add')}
            >
              Add Device
            </Button>
            <Button
              variant="outline"
              colorScheme="violet"
              size="md"
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Devices Card with Gradient Background */}
      <Card 
        variant="gradient" 
        colorScheme="blue" 
        padding="lg"
        hover={true}
        glowEffect={true}
      >
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <Card.Title className="text-white text-xl">Connected Devices</Card.Title>
              <Card.Description className="text-blue-100">
                {devices.length} device{devices.length !== 1 ? 's' : ''} currently registered
              </Card.Description>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-blue-100 text-sm">Live</span>
              </div>
            </div>
          </div>
        </Card.Header>
        
        <Card.Content>
          {/* Enhanced Table with Colorful Styling */}
          <div className="bg-surface-primary/50 backdrop-blur-sm rounded-lg border border-blue-400/20 overflow-hidden">
            <Table
              variant="bordered"
              size="md"
              hoverable={true}
              striped={false}
              loading={loading}
              loadingRows={5}
              loadingColumns={6}
              emptyMessage="No devices found. Add your first device to get started."
              data={devices}
              className="bg-transparent"
              columns={[
                {
                  key: 'topic',
                  header: 'Topic',
                  sortable: false,
                  render: (value) => (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                      <span className="font-medium text-white">{value}</span>
                    </div>
                  ),
                },
                {
                  key: 'imei',
                  header: 'IMEI',
                  sortable: false,
                  render: (value) => (
                    <span className="font-mono text-sm text-slate-300 bg-slate-800/50 px-2 py-1 rounded">
                      {value}
                    </span>
                  ),
                },
                {
                  key: 'interval',
                  header: 'Interval',
                  sortable: false,
                  render: (value) => (
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-300">{value}</span>
                      {value !== '-' && (
                        <span className="text-xs text-slate-400">sec</span>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'geoid',
                  header: 'Geoid',
                  sortable: false,
                  render: (value) => (
                    <span className="text-slate-300">{value}</span>
                  ),
                },
                {
                  key: 'createdAt',
                  header: 'Created At',
                  sortable: false,
                  render: (value) => (
                    <span className="text-slate-400 text-sm">{value}</span>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  sortable: false,
                  render: (value, device) => (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="colorful"
                        colorScheme="teal"
                        size="sm"
                        onClick={() => navigate(`/devices/${device.imei}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/devices/${device.imei}/settings`)}
                        className="text-slate-400 hover:text-white"
                      >
                        Settings
                      </Button>
                    </div>
                  ),
                },
              ]}
              onRowClick={(device) => navigate(`/devices/${device.imei}`)}
            />
          </div>
        </Card.Content>

        {/* Card Footer with Statistics */}
        <Card.Footer>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-blue-100 text-sm">
                  {devices.filter(d => d.interval !== '-').length} Active
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                <span className="text-blue-100 text-sm">
                  {devices.filter(d => d.interval === '-').length} Inactive
                </span>
              </div>
            </div>
            <div className="text-blue-100 text-sm">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </Card.Footer>
      </Card>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="colorful" colorScheme="green" padding="md" hover={true}>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-100 text-sm font-medium">Active Devices</div>
                <div className="text-white text-2xl font-bold">
                  {devices.filter(d => d.interval !== '-').length}
                </div>
              </div>
              <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="colorful" colorScheme="amber" padding="md" hover={true}>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-amber-100 text-sm font-medium">Inactive Devices</div>
                <div className="text-white text-2xl font-bold">
                  {devices.filter(d => d.interval === '-').length}
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-amber-400 rounded-full"></div>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card variant="colorful" colorScheme="violet" padding="md" hover={true}>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-violet-100 text-sm font-medium">Total Devices</div>
                <div className="text-white text-2xl font-bold">{devices.length}</div>
              </div>
              <div className="w-12 h-12 bg-violet-400/20 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-violet-400 rounded-full"></div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
