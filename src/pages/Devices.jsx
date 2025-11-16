// src/pages/Devices.jsx
import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { listDevices } from "../utils/device";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <div className="text-center text-slate-400 mt-10">
        Loading devices...
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
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-white">Devices</h3>

        <table className="w-full text-sm text-slate-300">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th className="py-2 text-left">Topic</th>
              <th className="py-2 text-left">IMEI</th>
              <th className="py-2 text-left">Interval</th>
              <th className="py-2 text-left">Geoid</th>
              <th className="py-2 text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-800 hover:bg-slate-800/40 transition"
              >
                <td className="py-2">{d.topic}</td>
                <td className="py-2">{d.imei}</td>
                <td className="py-2">{d.interval}</td>
                <td className="py-2">{d.geoid}</td>
                <td className="py-2">{d.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {devices.length === 0 && (
          <div className="text-center py-6 text-slate-500">
            No devices found.
          </div>
        )}
      </Card>
    </div>
  );
}
