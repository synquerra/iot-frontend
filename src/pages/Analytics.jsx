import React from 'react'
import Card from '../components/Card'

export default function Analytics(){
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold">Analytics</h3>
        <p className="text-slate-400 mt-2">Charts & metrics (placeholder)</p>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold">Trends</h3>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900 rounded-lg">Throughput<br/><strong>4.2k</strong></div>
          <div className="p-4 bg-slate-900 rounded-lg">Errors<br/><strong>3%</strong></div>
          <div className="p-4 bg-slate-900 rounded-lg">Latency<br/><strong>120ms</strong></div>
        </div>
      </Card>
    </div>
  )
}
