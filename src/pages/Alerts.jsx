import React from 'react'
import Card from '../components/Card'

export default function Alerts(){
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold">Alerts & Logs</h3>
        <div className="mt-4 space-y-2 text-sm text-slate-400">
          <div>[High] sensor-12 temperature spike — 5m ago</div>
          <div>[Info] maintenance scheduled — Oct 10</div>
        </div>
      </Card>
    </div>
  )
}
