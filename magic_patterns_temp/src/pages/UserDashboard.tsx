import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Bus, MapPin, Clock, MessageSquare, Bell } from 'lucide-react';
export function UserDashboard() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-white">Student Portal</h1>
            <p className="text-gray-400">Welcome back, Alice</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-gray-500 uppercase">Next Pickup</p>
            <p className="text-xl font-mono text-emerald-400">08:15 AM</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Bus Status */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <Badge variant="success" dot className="mb-2">
                    En Route
                  </Badge>
                  <h2 className="text-xl font-bold text-white">
                    Bus 104 - North Route
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">ETA</p>
                  <p className="text-2xl font-mono font-bold text-white">
                    12{' '}
                    <span className="text-sm font-sans text-gray-500">min</span>
                  </p>
                </div>
              </div>

              {/* Visual Route Progress */}
              <div className="relative py-8 px-4">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-800 -translate-y-1/2 rounded-full" />
                <div className="absolute top-1/2 left-0 w-[60%] h-1 bg-emerald-500 -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />

                <div className="relative flex justify-between">
                  {['Home', 'Stop A', 'Stop B', 'Campus'].map((stop, i) => {
                    const isPassed = i < 2;
                    const isNext = i === 2;
                    return (
                      <div
                        key={stop}
                        className="flex flex-col items-center gap-3">

                        <div
                          className={`
                          w-4 h-4 rounded-full border-2 z-10 bg-gray-950
                          ${isPassed ? 'border-emerald-500 bg-emerald-500' : isNext ? 'border-emerald-500 animate-pulse' : 'border-gray-700'}
                        `} />

                        <span
                          className={`text-xs ${isNext ? 'text-white font-bold' : 'text-gray-500'}`}>

                          {stop}
                        </span>
                      </div>);

                  })}

                  {/* Bus Icon Moving */}
                  <div className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 mb-8">
                    <div className="bg-emerald-500 text-gray-950 p-1.5 rounded-lg shadow-lg transform -translate-y-8">
                      <Bus size={16} />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 border-4 border-transparent border-t-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Seat Map */}
            <Card>
              <h3 className="font-semibold text-white mb-4">
                Seat Availability
              </h3>
              <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto p-4 bg-gray-800/30 rounded-xl border border-gray-800">
                {Array.from({
                  length: 24
                }).map((_, i) => {
                  const isOccupied = [2, 5, 6, 10, 11, 15].includes(i);
                  const isSelected = i === 18;
                  return (
                    <div
                      key={i}
                      className={`
                        h-8 rounded-t-lg border-t-2 mx-1
                        ${isOccupied ? 'bg-gray-800 border-gray-600 opacity-50' : isSelected ? 'bg-emerald-500/20 border-emerald-500' : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700'}
                      `} />);


                })}
              </div>
              <div className="flex justify-center gap-6 mt-4 text-xs text-gray-400">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-700 rounded-sm" /> Available
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-800 border border-gray-600 rounded-sm" />{' '}
                  Occupied
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500 rounded-sm" />{' '}
                  Your Seat
                </span>
              </div>
            </Card>
          </div>

          {/* Sidebar: Queries & Notifications */}
          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                Submit Query
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High'].map((p) =>
                    <button
                      key={p}
                      type="button"
                      className={`flex-1 py-1.5 text-xs rounded border ${p === 'Medium' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-gray-900 border-gray-800 text-gray-400'}`}>

                        {p}
                      </button>
                    )}
                  </div>
                </div>
                <Input placeholder="Subject" className="bg-gray-900" />
                <textarea
                  className="w-full bg-gray-900 border border-gray-800 rounded-md p-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none min-h-[100px]"
                  placeholder="Describe your issue..." />

                <Button className="w-full">Submit Ticket</Button>
              </form>
            </Card>

            <Card>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-400" />
                Recent Alerts
              </h3>
              <div className="space-y-4">
                {[
                {
                  title: 'Bus Delayed',
                  time: '10m ago',
                  type: 'warning'
                },
                {
                  title: 'Fee Payment Due',
                  time: '2h ago',
                  type: 'info'
                },
                {
                  title: 'Route Change',
                  time: '1d ago',
                  type: 'neutral'
                }].
                map((notif, i) =>
                <div
                  key={i}
                  className="flex gap-3 items-start p-2 hover:bg-gray-800/50 rounded-lg transition-colors">

                    <div
                    className={`mt-1 w-2 h-2 rounded-full ${notif.type === 'warning' ? 'bg-amber-400' : notif.type === 'info' ? 'bg-blue-400' : 'bg-gray-400'}`} />

                    <div>
                      <p className="text-sm text-gray-200">{notif.title}</p>
                      <p className="text-xs text-gray-500">{notif.time}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>);

}