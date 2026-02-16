import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Bus, MapPin, Users, Fuel } from 'lucide-react';
import { motion } from 'framer-motion';
const MOCK_BUSES = [
{
  id: 'B-101',
  route: 'North Campus',
  status: 'active',
  passengers: 42,
  fuel: 78,
  location: 'Main Gate'
},
{
  id: 'B-102',
  route: 'South City',
  status: 'active',
  passengers: 35,
  fuel: 62,
  location: 'City Center'
},
{
  id: 'B-103',
  route: 'West End',
  status: 'maintenance',
  passengers: 0,
  fuel: 45,
  location: 'Depot'
},
{
  id: 'B-104',
  route: 'East Valley',
  status: 'active',
  passengers: 28,
  fuel: 91,
  location: 'Valley Rd'
},
{
  id: 'B-105',
  route: 'Central',
  status: 'delayed',
  passengers: 55,
  fuel: 30,
  location: 'Traffic Jct'
},
{
  id: 'B-106',
  route: 'Highland',
  status: 'active',
  passengers: 12,
  fuel: 88,
  location: 'Highland Park'
}];

export function BusGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {MOCK_BUSES.map((bus, index) =>
      <motion.div
        key={bus.id}
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          delay: index * 0.05
        }}>

          <Card hoverEffect className="h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-700">
                  <Bus className="h-5 w-5 text-gray-300" />
                </div>
                <div>
                  <h4 className="font-bold text-white font-mono">{bus.id}</h4>
                  <p className="text-xs text-gray-400">{bus.route}</p>
                </div>
              </div>
              <Badge
              variant={
              bus.status === 'active' ?
              'success' :
              bus.status === 'maintenance' ?
              'warning' :
              'error'
              }
              dot>

                {bus.status}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-800">
              <div className="text-center">
                <div className="flex items-center justify-center text-gray-500 mb-1">
                  <Users className="h-3 w-3 mr-1" />
                </div>
                <span className="text-sm font-mono text-gray-200">
                  {bus.passengers}
                </span>
              </div>
              <div className="text-center border-l border-gray-800">
                <div className="flex items-center justify-center text-gray-500 mb-1">
                  <Fuel className="h-3 w-3 mr-1" />
                </div>
                <span className="text-sm font-mono text-gray-200">
                  {bus.fuel}%
                </span>
              </div>
              <div className="text-center border-l border-gray-800">
                <div className="flex items-center justify-center text-gray-500 mb-1">
                  <MapPin className="h-3 w-3 mr-1" />
                </div>
                <span className="text-xs font-mono text-gray-200 truncate max-w-full px-1">
                  {bus.location}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>);

}