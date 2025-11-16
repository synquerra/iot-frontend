import React from "react";

export default function Geofence() {
  return (
    <div className="bg-card p-6 rounded-xl text-white space-y-5">
      <h2 className="text-2xl font-bold text-center border-b border-slate-700 pb-3">
        Geofence
      </h2>

      <div className="space-y-2 text-sm">
        <p>Geofence Count: <span className="text-slate-400">15</span></p>
        <p>Activated: <span className="text-green-400">5</span></p>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <button className="bg-blue-600 py-1 rounded">Create</button>
        <button className="bg-yellow-600 py-1 rounded">Edit</button>
        <button className="bg-gray-600 py-1 rounded">Reset</button>
        <button className="bg-red-600 py-1 rounded">Delete</button>
      </div>

      <div className="pt-3 border-t border-slate-700">
        <label className="block text-sm mb-1">Profile Name</label>
        <input className="w-full bg-slate-800 px-2 py-1 rounded text-sm" defaultValue="Home" />
      </div>

      <div className="pt-3 text-xs text-slate-400 border-t border-slate-700">
        <p>Coordinates:</p>
        <div className="bg-slate-800 mt-1 rounded p-2">
          X: 62.531135, Y: 63.513135
        </div>
      </div>

      <button className="mt-3 w-full py-2 bg-green-600 rounded font-semibold">Save</button>
    </div>
  );
}
