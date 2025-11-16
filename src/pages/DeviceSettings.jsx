import React from "react";

export default function DeviceSettings() {
  return (
    <div className="bg-card p-6 rounded-xl text-white space-y-5">
      <h2 className="text-2xl font-bold text-center border-b border-slate-700 pb-3">
        Device Settings
      </h2>

      <div className="space-y-2 text-sm">
        <label>Phone Number 1</label>
        <input className="bg-slate-800 rounded px-2 py-1 w-full" defaultValue="9473XXXXXX" />
        <label>Phone Number 2</label>
        <input className="bg-slate-800 rounded px-2 py-1 w-full" defaultValue="9674XXXXXX" />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mt-3">
        <div>
          <label>Temperature Limit</label>
          <input type="number" className="bg-slate-800 rounded px-2 py-1 w-full" defaultValue={42}/>
        </div>
        <div>
          <label>Speed Limit</label>
          <input type="number" className="bg-slate-800 rounded px-2 py-1 w-full" defaultValue={55}/>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button className="px-4 py-1 bg-green-500 rounded text-black font-semibold">Save</button>
        <button className="px-4 py-1 bg-gray-600 rounded font-semibold">Cancel</button>
      </div>
    </div>
  );
}
