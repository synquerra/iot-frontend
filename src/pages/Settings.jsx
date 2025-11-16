import React from 'react'
import Card from '../components/Card'

export default function Settings(){
  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <h3 className="text-lg font-semibold">Account</h3>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <label className="flex flex-col text-sm">
            <span className="text-slate-400">Display name</span>
            <input className="mt-2 p-2 rounded-md bg-slate-900" placeholder="Your name" />
          </label>
          <label className="flex flex-col text-sm">
            <span className="text-slate-400">Email</span>
            <input className="mt-2 p-2 rounded-md bg-slate-900" placeholder="you@example.com" />
          </label>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Preferences</h3>
        <div className="mt-4 space-y-2 text-sm text-slate-400">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Dark mode</div>
              <div className="text-slate-500 text-sm">Toggle UI theme</div>
            </div>
            <input type="checkbox" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Timezone</div>
              <div className="text-slate-500 text-sm">Asia/Kolkata</div>
            </div>
            <select className="bg-slate-900 p-2 rounded-md">
              <option>Asia/Kolkata</option>
              <option>UTC</option>
              <option>America/New_York</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  )
}
