import React from 'react';
import { User, Steering } from 'lucide-react';
import { Badge } from './ui/Badge';

const SeatMap = ({ seats, capacity }) => {
  // Create seat layout: 4 seats per row (2 on each side of aisle)
  const rows = Math.ceil(capacity / 4);
  const seatLayout = [];

  // Organize seats into rows
  for (let row = 0; row < rows; row++) {
    const rowSeats = {
      left: [
        seats.find(s => s.seat_number === row * 4 + 1),
        seats.find(s => s.seat_number === row * 4 + 2)
      ],
      right: [
        seats.find(s => s.seat_number === row * 4 + 3),
        seats.find(s => s.seat_number === row * 4 + 4)
      ]
    };
    seatLayout.push(rowSeats);
  }

  const SeatBox = ({ seat }) => {
    if (!seat) return <div className="w-12 h-12" />;

    const isOccupied = !seat.is_available;
    
    return (
      <div
        className={`
          w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold
          transition-all duration-200
          ${isOccupied 
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
            : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'
          }
        `}
        title={isOccupied ? `Seat ${seat.seat_number} - ${seat.user_details?.name || 'Occupied'}` : `Seat ${seat.seat_number} - Available`}
      >
        {isOccupied ? <User className="h-4 w-4" /> : seat.seat_number}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      {/* Bus Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Steering className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Bus Seat Layout</h3>
            <p className="text-sm text-gray-400">
              {seats.filter(s => !s.is_available).length} / {capacity} seats occupied
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-emerald-500/20 border-2 border-emerald-500/50" />
            <span className="text-xs text-gray-400">Occupied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-gray-800 border-2 border-gray-700" />
            <span className="text-xs text-gray-400">Available</span>
          </div>
        </div>
      </div>

      {/* Driver Section */}
      <div className="mb-4 pb-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center">
              <Steering className="h-6 w-6 text-blue-500" />
            </div>
            <span className="text-sm text-gray-400">Driver</span>
          </div>
          <div className="text-xs text-gray-500">Front of Bus →</div>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="space-y-3">
        {seatLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center justify-center space-x-4">
            {/* Left Side - Seats 1 & 2 */}
            <div className="flex space-x-2">
              <SeatBox seat={row.left[0]} />
              <SeatBox seat={row.left[1]} />
            </div>

            {/* Aisle */}
            <div className="w-8 flex items-center justify-center">
              <div className="h-px w-full bg-gray-800" />
            </div>

            {/* Right Side - Seats 3 & 4 */}
            <div className="flex space-x-2">
              <SeatBox seat={row.right[0]} />
              <SeatBox seat={row.right[1]} />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          Hover over seats to see details
        </p>
      </div>
    </div>
  );
};

export default SeatMap;
