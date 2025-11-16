import React from "react";

export default function Telemetry() {
  return (
    <div className="bg-card p-6 rounded-xl text-white space-y-5">
      <h2 className="text-2xl font-bold text-center border-b border-slate-700 pb-3">
        Data Telemetry
      </h2>

      <div className="space-y-2 text-sm">
        <p>IMEI (Device): <span className="text-slate-400">7984561481678167</span></p>
        <p>Firmware Version: <span className="text-slate-400">516v151</span></p>
        <p>Device Status: <span className="text-green-400 font-semibold">Online</span></p>
        <p>Last Seen: <span className="text-slate-400">15-01-2025 03:56:41</span></p>
      </div>

      <div className="pt-3 border-t border-slate-700">
        <h3 className="text-yellow-400 font-semibold">Normal Packet (N)</h3>
        <div className="grid grid-cols-2 text-sm gap-2 mt-2">
          <p>Lat: 62.531135</p>
          <p>Lng: 63.513135</p>
          <p>Speed: 40 Km/h</p>
          <p>Temp: 27°C</p>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Battery: <span className="text-green-400">92%</span>
        </p>
      </div>

      <div className="pt-3 border-t border-slate-700">
        <h3 className="text-red-400 font-semibold">Error Packet (E)</h3>
        <p className="text-sm mt-1">Code: <span className="text-slate-400">E1002</span></p>
        <p className="text-xs text-slate-400">Timestamp: 13-02-2011 12:53:49</p>
      </div>

      <div className="pt-3 border-t border-slate-700 space-y-2">
        <h4 className="font-semibold text-sm text-slate-300">E-Sim Management</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Sim 1: <span className="text-green-400">Active</span></div>
          <div>Sim 2: <span className="text-red-400">Inactive</span></div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-700 flex gap-2 justify-center">
        <button className="px-3 py-1 bg-yellow-500 text-black rounded text-xs font-semibold">SOS</button>
        <button className="px-3 py-1 bg-green-500 text-black rounded text-xs font-semibold">ASK</button>
        <button className="px-3 py-1 bg-red-500 text-black rounded text-xs font-semibold">OFF</button>
      </div>
    </div>
  );
}
