import React from "react";
import detectTrips from "../utils/detectTrips";
import { formatIST } from "../utils/timeHelpers";

export default function TripSummary({ packets, startDate, endDate }) {
  let s, e;

  // CASE 1: User selected custom range
  if (startDate && endDate) {
    s = new Date(startDate);
    e = new Date(endDate);
  } 
  
  // CASE 2: No date selected → use TODAY
  else {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // start of day

    s = today;
    e = new Date(); // now
  }

  // FILTER PACKETS BY TIME RANGE
  const filtered = packets.filter((p) => {
    const t = new Date(p.deviceTimestamp || p.deviceRawTimestamp);
    return t >= s && t <= e;
  });
  filtered.sort(
    (a, b) =>
      new Date(a.deviceTimestamp || a.deviceRawTimestamp) -
      new Date(b.deviceTimestamp || b.deviceRawTimestamp)
  );

  const trips = detectTrips(filtered);

  return (
    <div className="bg-[#111827] border border-slate-700 rounded-lg p-6 text-sm">
      <h3 className="text-lg text-purple-300 font-semibold mb-3">
        Trip Summary
        {!startDate && !endDate && " (Today)"}
        {startDate && endDate && " (Custom Range)"}
      </h3>

      {trips.length === 0 ? (
        <div className="text-slate-500">No trips detected</div>
      ) : (
        <div className="space-y-4">
          {trips.map((t, i) => (
            <div
              key={i}
              className="border border-slate-600 p-4 rounded bg-slate-800"
            >
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Trip #{i + 1}</span>
                <span className="text-purple-300 font-semibold">
                  {t.distance} km
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-1 text-xs">
                <span className="text-slate-400">Start Time</span>
                <span>{formatIST(t.startTime)}</span>

                <span className="text-slate-400">End Time</span>
                <span>{formatIST(t.endTime)}</span>

                <span className="text-slate-400">Duration</span>
                <span>{t.durationMin} min</span>

                <span className="text-slate-400">Avg Speed</span>
                <span>{t.avgSpeed} km/h</span>

                <span className="text-slate-400">Max Speed</span>
                <span>{t.maxSpeed} km/h</span>

                <span className="text-slate-400">Start Location</span>
                <a
                  href={`https://www.google.com/maps?q=${t.startLat},${t.startLon}`}
                  target="_blank"
                  className="text-blue-400 underline"
                >
                  Open
                </a>

                <span className="text-slate-400">End Location</span>
                <a
                  href={`https://www.google.com/maps?q=${t.endLat},${t.endLon}`}
                  target="_blank"
                  className="text-blue-400 underline"
                >
                  Open
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
