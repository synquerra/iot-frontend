import React from "react";

export default function Configuration() {
  const toggles = [
    "Access to Police","Calling Enable","Orig call Enable","Extended History",
    "Temp Comp.","AI Anomaly","Airplane Mode","Ble Enabled","Battery Reserved"
  ];

  return (
    <div className="bg-card p-6 rounded-xl text-white space-y-6">
      <h2 className="text-2xl font-bold text-center border-b border-slate-700 pb-3">
        Data Configuration
      </h2>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {toggles.map((label, i) => (
          <div key={i} className="flex items-center justify-between">
            <span>{label}</span>
            <input type="checkbox" defaultChecked className="accent-green-500 scale-110" />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-700">
        <span>Low Battery %</span>
        <input
          type="number"
          className="w-16 bg-slate-800 px-2 py-1 rounded text-center"
          defaultValue={10}
        />
      </div>
    </div>
  );
}
