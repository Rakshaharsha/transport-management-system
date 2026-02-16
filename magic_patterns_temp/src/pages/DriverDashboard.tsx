import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MapPin, Clock, Users, Navigation, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
export function DriverDashboard() {
  const [isLive, setIsLive] = useState(false);
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">Driver Portal</h1>

        {/* Hero Status Card */}
        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Current Assignment</p>
              <div className="flex items-baseline gap-3">
                <h2 className="text-4xl font-bold text-white font-mono">
                  Rt-104
                </h2>
                <span className="text-xl text-gray-500">Bus B-202</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>North Campus ↔ City Center</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
              <div className="flex items-center gap-3 bg-gray-800 p-1.5 rounded-lg border border-gray-700">
                <span
                  className={`text-xs font-medium px-2 ${isLive ? 'text-emerald-400' : 'text-gray-400'}`}>

                  {isLive ? 'LIVE TRACKING' : 'OFFLINE'}
                </span>
                <motion.button
                  whileTap={{
                    scale: 0.95
                  }}
                  onClick={() => setIsLive(!isLive)}
                  className={`
                    relative h-6 w-12 rounded-full transition-colors duration-300
                    ${isLive ? 'bg-emerald-500' : 'bg-gray-600'}
                  `}>

                  <motion.div
                    animate={{
                      x: isLive ? 24 : 2
                    }}
                    className="absolute top-1 left-0 h-4 w-4 rounded-full bg-white shadow-sm" />

                </motion.button>
              </div>
              <p className="text-xs text-gray-500">Last sync: Just now</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Attendance */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-500" />
                Student Pickup
              </h3>
              <span className="text-sm font-mono text-gray-400">
                12/45 Boarded
              </span>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {Array.from({
                length: 15
              }).map((_, i) =>
              <motion.button
                key={i}
                whileTap={{
                  scale: 0.9
                }}
                className={`
                    aspect-square rounded-full flex items-center justify-center text-xs font-bold border transition-colors
                    ${i < 12 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500'}
                  `}>

                  {String.fromCharCode(65 + i)}
                </motion.button>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Tap to mark attendance
              </span>
              <Button size="sm" variant="outline">
                View List
              </Button>
            </div>
          </Card>

          {/* Schedule & Salary */}
          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-amber-400" />
                Today's Schedule
              </h3>
              <div className="space-y-4 relative">
                {/* Timeline line */}
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-800" />

                {[
                {
                  time: '08:00 AM',
                  event: 'Start Route',
                  done: true
                },
                {
                  time: '09:30 AM',
                  event: 'Campus Arrival',
                  done: true
                },
                {
                  time: '02:00 PM',
                  event: 'Return Trip',
                  done: false
                },
                {
                  time: '04:30 PM',
                  event: 'Depot Check-in',
                  done: false
                }].
                map((item, i) =>
                <div
                  key={i}
                  className="relative flex items-center gap-4 pl-6">

                    <div
                    className={`
                      absolute left-0 w-4 h-4 rounded-full border-2 
                      ${item.done ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-900 border-gray-600'}
                    `}>

                      {item.done &&
                    <CheckCircle className="h-3 w-3 text-white" />
                    }
                    </div>
                    <span className="font-mono text-xs text-gray-400">
                      {item.time}
                    </span>
                    <span
                    className={`text-sm ${item.done ? 'text-gray-300 line-through' : 'text-white'}`}>

                      {item.event}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-gray-800">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400 uppercase">
                    Monthly Earnings
                  </p>
                  <h3 className="text-2xl font-bold text-white font-mono mt-1">
                    $2,450.00
                  </h3>
                </div>
                <Badge variant="success">Paid</Badge>
              </div>
              <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[85%]" />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-right">
                85% of target
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>);

}