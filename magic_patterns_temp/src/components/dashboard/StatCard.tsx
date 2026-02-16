import React from 'react';
import { Card } from '../ui/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
}
export function StatCard({
  title,
  value,
  trend,
  trendUp,
  icon
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-white mt-1 font-mono">
            {value}
          </h3>
        </div>
        {icon &&
        <div className="p-2 rounded-lg bg-gray-800 text-gray-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors duration-300">
            {icon}
          </div>
        }
      </div>

      {trend &&
      <div className="flex items-center text-xs">
          <span
          className={`flex items-center font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>

            {trendUp ?
          <ArrowUpRight className="h-3 w-3 mr-1" /> :

          <ArrowDownRight className="h-3 w-3 mr-1" />
          }
            {trend}
          </span>
          <span className="text-gray-500 ml-2">vs last month</span>
        </div>
      }

      {/* Decorative gradient blob */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-300" />
    </Card>);

}