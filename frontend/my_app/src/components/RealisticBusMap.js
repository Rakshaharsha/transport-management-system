import React, { useState } from 'react';
import { User, X, MapPin, DollarSign, GraduationCap, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from './ui/Badge';

const RealisticBusMap = ({ busId, seats = [], showNames = true, userRole = 'ADMIN', onRemoveSeat }) => {
    const [selectedSeat, setSelectedSeat] = useState(null);
    
    const handleRemoveSeat = async (seat) => {
        if (window.confirm(`Are you sure you want to remove ${seat.user_details.first_name} ${seat.user_details.last_name} from seat ${seat.seat_number}?`)) {
            if (onRemoveSeat) {
                await onRemoveSeat(seat.id);
                setSelectedSeat(null);
            }
        }
    };
    
    // Sort all seats by seat number
    const sortedSeats = [...seats].sort((a, b) => a.seat_number - b.seat_number);

    // Arrange seats in proper bus layout: 4 seats per row (2-2 configuration)
    // Layout: 1  2  |  3  4
    //         5  6  |  7  8
    //         9 10  | 11 12
    const rows = [];
    const seatsPerRow = 4;

    for (let i = 0; i < sortedSeats.length; i += seatsPerRow) {
        const rowSeats = sortedSeats.slice(i, i + seatsPerRow);
        rows.push(rowSeats);
    }

    const SeatButton = ({ seat }) => {
        if (!seat) return <div className="h-16 w-14"></div>;

        const getSeatColor = () => {
            if (!seat.is_available) return 'bg-emerald-500/20 border-emerald-500/50 hover:border-emerald-400';
            return 'bg-gray-800 border-gray-700';
        };

        const isClickable = !seat.is_available && seat.user_details;

        return (
            <button
                onClick={() => {
                    if (isClickable) {
                        console.log('Seat clicked:', seat);
                        console.log('User details:', seat.user_details);
                        setSelectedSeat(seat);
                    }
                }}
                className={`relative h-16 w-14 rounded-lg border-2 transition-all ${getSeatColor()} ${
                    isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                }`}
            >
                <div className="flex flex-col items-center justify-center h-full">
                    {seat.is_available ? (
                        <div className="text-sm font-bold text-gray-400">{seat.seat_number}</div>
                    ) : (
                        <>
                            <User className="h-4 w-4 text-emerald-400 mb-1" />
                            {showNames && seat.user_details && (
                                <div className="text-[8px] text-white leading-tight text-center px-1">
                                    {seat.user_details.first_name}
                                </div>
                            )}
                            <div className="text-[8px] text-emerald-300">{seat.seat_number}</div>
                        </>
                    )}
                </div>
            </button>
        );
    };

    return (
        <>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                {/* Driver Section */}
                <div className="mb-6 pb-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center">
                                <User className="h-6 w-6 text-blue-500" />
                            </div>
                            <span className="text-sm text-gray-400">Driver</span>
                        </div>
                        <div className="text-xs text-gray-500">← Front of Bus</div>
                    </div>
                </div>

                {/* Passenger Seats - 2x2 Configuration */}
                <div className="space-y-3">
                    {rows.map((row, rowIndex) => {
                        const seat1 = row[0];
                        const seat2 = row[1];
                        const seat3 = row[2];
                        const seat4 = row[3];

                        return (
                            <div key={rowIndex} className="flex items-center justify-center gap-3">
                                {/* Left side - 2 seats */}
                                <div className="flex gap-2">
                                    <SeatButton seat={seat1} />
                                    <SeatButton seat={seat2} />
                                </div>

                                {/* Aisle */}
                                <div className="w-8 border-l-2 border-r-2 border-dashed border-gray-700 h-16 flex items-center justify-center">
                                    <div className="text-[10px] text-gray-600 transform -rotate-90 whitespace-nowrap">
                                        AISLE
                                    </div>
                                </div>

                                {/* Right side - 2 seats */}
                                <div className="flex gap-2">
                                    <SeatButton seat={seat3} />
                                    <SeatButton seat={seat4} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bus Back */}
                <div className="mt-6 pt-4 border-t border-gray-800 text-center text-xs text-gray-500">
                    Back of Bus →
                </div>

                {/* Legend */}
                <div className="mt-6 flex items-center justify-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-emerald-500/20 border-2 border-emerald-500/50"></div>
                        <span className="text-gray-400">Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-gray-800 border-2 border-gray-700"></div>
                        <span className="text-gray-400">Available</span>
                    </div>
                </div>
            </div>

            {/* Student Details Modal */}
            <AnimatePresence>
                {selectedSeat && selectedSeat.user_details && (
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

                            <div className="space-y-4">
                                {/* User Avatar & Basic Info */}
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                        <User className="h-8 w-8 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-white">
                                            {selectedSeat.user_details.first_name}{' '}
                                            {selectedSeat.user_details.last_name}
                                        </h4>
                                        <Badge variant="success" className="mt-1">
                                            {selectedSeat.user_details.role}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="space-y-3 pt-4 border-t border-gray-800">
                                    {/* Always show these fields for both ADMIN and DRIVER */}
                                    <div className="flex items-center gap-3">
                                        <GraduationCap className="h-4 w-4 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-400">College</p>
                                            <p className="text-sm text-white">
                                                {selectedSeat.user_details.college_name || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <GraduationCap className="h-4 w-4 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-400">Year</p>
                                            <p className="text-sm text-white">
                                                {selectedSeat.user_details.year ? `${selectedSeat.user_details.year} Year` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-400">Location</p>
                                            <p className="text-sm text-white">
                                                {selectedSeat.user_details.home_location || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <DollarSign className="h-4 w-4 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-400">Fees Status</p>
                                            <Badge 
                                                variant={selectedSeat.user_details.has_unpaid_fees ? 'error' : 'success'}
                                                size="sm"
                                            >
                                                {selectedSeat.user_details.has_unpaid_fees ? '⚠ Unpaid' : '✓ Paid'}
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
                                                        {selectedSeat.user_details.username}
                                                    </p>
                                                </div>
                                            </div>

                                            {selectedSeat.user_details.email && (
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-400">Email</p>
                                                        <p className="text-sm text-white">
                                                            {selectedSeat.user_details.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedSeat.user_details.phone_number && (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-4 w-4 text-gray-500" />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-400">Phone</p>
                                                        <p className="text-sm text-white">
                                                            {selectedSeat.user_details.phone_number}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedSeat.user_details.semester && (
                                                <div className="flex items-center gap-3">
                                                    <GraduationCap className="h-4 w-4 text-gray-500" />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-400">Semester</p>
                                                        <p className="text-sm text-white">
                                                            {selectedSeat.user_details.semester}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedSeat.user_details.gender && (
                                                <div className="flex items-center gap-3">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-400">Gender</p>
                                                        <p className="text-sm text-white">
                                                            {selectedSeat.user_details.gender}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Remove Button for Admin */}
                                {userRole === 'ADMIN' && onRemoveSeat && (
                                    <div className="mt-6 pt-4 border-t border-gray-800">
                                        <button
                                            onClick={() => handleRemoveSeat(selectedSeat)}
                                            className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-lg transition-all font-medium text-sm"
                                        >
                                            Remove from Seat
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default RealisticBusMap;
