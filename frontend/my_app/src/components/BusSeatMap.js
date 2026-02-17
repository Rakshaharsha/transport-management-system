import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { User, X, MapPin, DollarSign, GraduationCap, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../api/axios';

const BusSeatMap = ({ busId, isAdmin = false, userRole = 'DRIVER' }) => {
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeats();
  }, [busId]);

  const fetchSeats = async () => {
    try {
      const response = await axiosInstance.get(`/seats/?bus=${busId}`);
      console.log('Raw API response:', response.data);
      
      // Sort seats by seat_number and ensure unique seats
      const sortedSeats = response.data
        .sort((a, b) => a.seat_number - b.seat_number)
        .filter((seat, index, self) => 
          index === self.findIndex((s) => s.seat_number === seat.seat_number)
        );
      
      console.log('Processed seats:', sortedSeats.map(s => ({ id: s.id, number: s.seat_number })));
      setSeats(sortedSeats);
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeatColor = (seat) => {
    if (!seat.is_available) {
      return 'bg-emerald-500/20 border-emerald-500/50 hover:border-emerald-500';
    }
    return 'bg-gray-800/50 border-gray-700 hover:border-gray-600';
  };

  const getSeatIcon = (seat) => {
    if (!seat.is_available && seat.assigned_user) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <User className="h-4 w-4 text-emerald-500 mb-1" />
          <span className="text-[10px] text-emerald-400 font-mono font-bold">
            {seat.seat_number}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-sm text-gray-400 font-mono font-bold">{seat.seat_number}</span>
      </div>
    );
  };

  // Organize seats in rows (4 seats per row: 2 left, aisle, 2 right)
  // Layout: 1  2  |  3  4
  //         5  6  |  7  8
  //         9 10  | 11 12
  const organizeSeats = () => {
    const rows = [];
    for (let i = 0; i < seats.length; i += 4) {
      const row = seats.slice(i, i + 4);
      rows.push(row);
    }
    return rows;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading seats...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-12 rounded border-2 bg-emerald-500/20 border-emerald-500/50" />
          <span className="text-gray-400">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-12 rounded border-2 bg-gray-800/50 border-gray-700" />
          <span className="text-gray-400">Available</span>
        </div>
      </div>

      {/* Bus Layout */}
      <Card className="p-6 bg-gray-900/50">
        {/* Driver Section */}
        <div className="mb-6 pb-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">Driver</div>
            <div className="h-12 w-16 rounded-lg bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="space-y-2 max-h-96 overflow-y-auto px-4">
          {organizeSeats().map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-2 justify-center">
              {/* Left side - Seats 1 & 2 (or 5 & 6, etc.) */}
              <div className="flex gap-2">
                {row[0] && (
                  <motion.button
                    key={row[0].id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSeat(row[0])}
                    className={`h-12 w-14 rounded-lg border-2 transition-all ${getSeatColor(row[0])}`}
                  >
                    {getSeatIcon(row[0])}
                  </motion.button>
                )}
                {row[1] && (
                  <motion.button
                    key={row[1].id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSeat(row[1])}
                    className={`h-12 w-14 rounded-lg border-2 transition-all ${getSeatColor(row[1])}`}
                  >
                    {getSeatIcon(row[1])}
                  </motion.button>
                )}
              </div>

              {/* Aisle */}
              <div className="w-8 flex-shrink-0 border-l-2 border-r-2 border-dashed border-gray-700 h-12 flex items-center justify-center">
                <span className="text-[10px] text-gray-600 transform -rotate-90 whitespace-nowrap">AISLE</span>
              </div>

              {/* Right side - Seats 3 & 4 (or 7 & 8, etc.) */}
              <div className="flex gap-2">
                {row[2] && (
                  <motion.button
                    key={row[2].id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSeat(row[2])}
                    className={`h-12 w-14 rounded-lg border-2 transition-all ${getSeatColor(row[2])}`}
                  >
                    {getSeatIcon(row[2])}
                  </motion.button>
                )}
                {row[3] && (
                  <motion.button
                    key={row[3].id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSeat(row[3])}
                    className={`h-12 w-14 rounded-lg border-2 transition-all ${getSeatColor(row[3])}`}
                  >
                    {getSeatIcon(row[3])}
                  </motion.button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total seats info */}
        <div className="mt-4 pt-4 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-400">
            Total Seats: <span className="text-white font-semibold">{seats.length}</span>
            {' • '}
            Occupied: <span className="text-emerald-400 font-semibold">
              {seats.filter(s => !s.is_available).length}
            </span>
            {' • '}
            Available: <span className="text-gray-400 font-semibold">
              {seats.filter(s => s.is_available).length}
            </span>
          </p>
        </div>
      </Card>

      {/* Seat Details Modal */}
      <AnimatePresence>
        {selectedSeat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSeat(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Seat {selectedSeat.seat_number}
                </h3>
                <button
                  onClick={() => setSelectedSeat(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {selectedSeat.is_available ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-800 border border-gray-700 mb-4">
                    <User className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400">This seat is available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <User className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        {selectedSeat.user_details?.first_name}{' '}
                        {selectedSeat.user_details?.last_name}
                      </h4>
                      <Badge variant="success" className="mt-1">
                        {selectedSeat.user_details?.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-800">
                    {/* Always show these fields for both ADMIN and DRIVER */}
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">College</p>
                        <p className="text-sm text-white">
                          {selectedSeat.user_details?.college_name || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">Year</p>
                        <p className="text-sm text-white">
                          {selectedSeat.user_details?.year ? `${selectedSeat.user_details?.year} Year` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">Location</p>
                        <p className="text-sm text-white">
                          {selectedSeat.user_details?.home_location || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">Fees Status</p>
                        <Badge 
                          variant={selectedSeat.user_details?.has_unpaid_fees ? 'error' : 'success'}
                          size="sm"
                        >
                          {selectedSeat.user_details?.has_unpaid_fees ? '⚠ Unpaid' : '✓ Paid'}
                        </Badge>
                      </div>
                    </div>

                    {/* ADMIN-ONLY: Show additional details */}
                    {userRole === 'ADMIN' && (
                      <>
                        <div className="pt-3 border-t border-gray-800">
                          <p className="text-xs text-gray-500 mb-2">Additional Information</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-400">Username</p>
                            <p className="text-sm text-white">
                              {selectedSeat.user_details?.username}
                            </p>
                          </div>
                        </div>

                        {selectedSeat.user_details?.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-400">Email</p>
                              <p className="text-sm text-white">
                                {selectedSeat.user_details?.email}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedSeat.user_details?.phone_number && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-400">Phone</p>
                              <p className="text-sm text-white">
                                {selectedSeat.user_details?.phone_number}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedSeat.user_details?.semester && (
                          <div className="flex items-center gap-3">
                            <GraduationCap className="h-4 w-4 text-gray-500" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-400">Semester</p>
                              <p className="text-sm text-white">
                                {selectedSeat.user_details?.semester}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedSeat.user_details?.gender && (
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-gray-500" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-400">Gender</p>
                              <p className="text-sm text-white">
                                {selectedSeat.user_details?.gender}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusSeatMap;
