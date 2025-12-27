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
          text="Loading devices..." 
          textPosition="bottom"
        />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-400 mt-10">
        {error}
      </div>
    );

  return (
    <div className="space-y-6">
      <Card variant="default" padding="md">
        <Card.Header>
          <Card.Title>Devices</Card.Title>
          <Card.Description>
            Manage and monitor your connected devices
          </Card.Description>
        </Card.Header>
        
        <Card.Content>
          <Table
            variant="default"
            size="md"
            hoverable={true}
            striped={false}
            loading={loading}
            loadingRows={5}
            loadingColumns={6}
            emptyMessage="No devices found."
            data={devices}
            columns={[
              {
                key: 'topic',
                header: 'Topic',
                sortable: false,
              },
              {
                key: 'imei',
                header: 'IMEI',
                sortable: false,
              },
              {
                key: 'interval',
                header: 'Interval',
                sortable: false,
              },
              {
                key: 'geoid',
                header: 'Geoid',
                sortable: false,
              },
              {
                key: 'createdAt',
                header: 'Created At',
                sortable: false,
              },
              {
                key: 'actions',
                header: 'Actions',
                sortable: false,
                render: (value, device) => (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/devices/${device.imei}`)}
                  >
                    View
                  </Button>
                ),
              },
            ]}
            onRowClick={(device) => navigate(`/devices/${device.imei}`)}
          />
        </Card.Content>
      </Card>
    </div>
  );
}
