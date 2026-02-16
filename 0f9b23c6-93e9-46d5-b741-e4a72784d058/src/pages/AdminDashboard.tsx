import React from 'react';
import { Layout } from '../components/layout/Layout';
import { StatCard } from '../components/dashboard/StatCard';
import { BusGrid } from '../components/dashboard/BusGrid';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Users,
  Bus,
  AlertTriangle,
  DollarSign,
  Check,
  X,
  Search } from
'lucide-react';
import { Input } from '../components/ui/Input';
export function AdminDashboard() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Command Center</h1>
            <p className="text-gray-400 text-sm">
              Real-time fleet monitoring and management
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm">
              Export Report
            </Button>
            <Button size="sm" leftIcon={<Bus className="h-4 w-4" />}>
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Fleet"
            value="42"
            trend="+2"
            trendUp={true}
            icon={<Bus className="h-5 w-5" />} />

          <StatCard
            title="Active Drivers"
            value="38"
            trend="-1"
            trendUp={false}
            icon={<Users className="h-5 w-5" />} />

          <StatCard
            title="Maintenance"
            value="3"
            trend="Stable"
            trendUp={true}
            icon={<AlertTriangle className="h-5 w-5" />} />

          <StatCard
            title="Monthly Cost"
            value="$12.4k"
            trend="+5%"
            trendUp={false}
            icon={<DollarSign className="h-5 w-5" />} />

        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Fleet Status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Live Fleet Status
              </h2>
              <div className="flex gap-2">
                <Badge variant="success" dot>
                  Active (35)
                </Badge>
                <Badge variant="warning" dot>
                  Maint (3)
                </Badge>
                <Badge variant="error" dot>
                  Down (4)
                </Badge>
              </div>
            </div>
            <BusGrid />

            {/* Driver Assignment Panel */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Driver Assignments
                </h2>
                <div className="w-64">
                  <Input
                    placeholder="Search drivers..."
                    icon={<Search className="h-4 w-4" />}
                    className="bg-gray-900" />

                </div>
              </div>
              <Card noPadding className="overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-900 text-gray-400 border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-3 font-medium">Driver</th>
                      <th className="px-6 py-3 font-medium">Route</th>
                      <th className="px-6 py-3 font-medium">Vehicle</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {[1, 2, 3].map((i) =>
                    <tr
                      key={i}
                      className="hover:bg-gray-800/50 transition-colors">

                        <td className="px-6 py-4 font-medium text-white">
                          John Doe {i}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          Route {100 + i}
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-300">
                          B-{200 + i}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="success" dot>
                            On Route
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-emerald-400 hover:text-emerald-300 text-xs font-medium">
                            Edit
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>
            </div>
          </div>

          {/* Right Column: Notifications & Approvals */}
          <div className="space-y-6">
            {/* Attendance Queue */}
            <Card>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                Attendance Approvals
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) =>
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-800">

                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                        JD
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          Jane Driver
                        </p>
                        <p className="text-xs text-gray-500">
                          Check-in: 08:00 AM
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300">

                        <X size={16} />
                      </Button>
                      <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300">

                        <Check size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                View All Requests
              </Button>
            </Card>

            {/* Salary Management Mini-View */}
            <Card>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                Pending Salaries
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Total Pending</span>
                  <span className="font-mono text-white font-bold">
                    $12,450
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full w-[70%]"></div>
                </div>
                <p className="text-xs text-gray-500 text-right">
                  70% Disbursed
                </p>
                <Button variant="primary" size="sm" className="w-full mt-2">
                  Process Batch
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>);

}