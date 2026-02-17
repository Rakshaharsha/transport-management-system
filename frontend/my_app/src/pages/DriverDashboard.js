import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import BusSeatMap from '../components/BusSeatMap';
import { Bus, DollarSign, CheckCircle, MapPin, AlertCircle, Users, ClipboardCheck, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [bus, setBus] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [driverStatus, setDriverStatus] = useState('AVAILABLE');
  const [user, setUser] = useState(null);
  const [leaveForm, setLeaveForm] = useState({ start_date: '', end_date: '', reason: '' });
  const [applyingLeave, setApplyingLeave] = useState(false);
  const [pendingLeaves, setPendingLeaves] = useState([]);

  // Tracking State
  const [isTracking, setIsTracking] = useState(false);
  const [ws, setWs] = useState(null);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    loadDashboard();
    loadMyBus();
    loadUserProfile();
    loadPendingLeaves();

    // Cleanup tracking on unmount
    return () => {
      stopTracking();
    };
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await axiosInstance.get('/auth/profile/');
      setUser(response.data);
      setDriverStatus(response.data.driver_status || 'AVAILABLE');
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await axiosInstance.get('/dashboard/driver/');
      setDashboard(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadMyBus = async () => {
    try {
      const response = await axiosInstance.get('/buses/my_bus/');
      setBus(response.data);
    } catch (error) {
      console.log('No bus assigned');
    }
  };

  const loadPendingLeaves = async () => {
    try {
      const response = await axiosInstance.get('/driver-leaves/');
      setPendingLeaves(response.data);
    } catch (error) {
      console.error('Error loading leaves:', error);
    }
  };

  // Tracking Functions
  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    // Connect WebSocket
    const socket = new WebSocket('ws://localhost:8000/ws/drivers/location/');

    socket.onopen = () => {
      console.log('Connected to tracking server');
      setIsTracking(true);
      setWs(socket);

      // Start watching position
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Send location to server
          if (socket.readyState === WebSocket.OPEN && user) {
            socket.send(JSON.stringify({
              type: 'update_location',
              driver_id: user.id,
              latitude,
              longitude
            }));
          }
        },
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
      setWatchId(id);
    };

    socket.onclose = () => {
      console.log('Disconnected from tracking server');
      setIsTracking(false);
      setWs(null);
    };
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    if (ws) {
      ws.close();
      setWs(null);
    }
    setIsTracking(false);
  };

  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  // Status & Location Functions
  const updateDriverStatus = async (status) => {
    setUpdating(true);
    try {
      await axiosInstance.post('/driver/update-status/', { status: status });
      setDriverStatus(status);
      window.alert(`✅ Status updated to ${status}`);
      loadDashboard(); // Reload to update stats
    } catch (error) {
      console.error('Error updating status:', error);
      window.alert(error.response?.data?.error || '❌ Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const handleApplyLeave = async () => {
    if (!leaveForm.start_date || !leaveForm.end_date || !leaveForm.reason) {
      window.alert('Please fill all fields');
      return;
    }

    setApplyingLeave(true);
    try {
      const response = await axiosInstance.post('/driver-leaves/', {
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        reason: leaveForm.reason
      });
      window.alert('✅ Leave request submitted successfully! Waiting for admin approval.');
      setLeaveForm({ start_date: '', end_date: '', reason: '' });
      // Clear the form inputs
      document.querySelectorAll('input[type="date"]').forEach(input => input.value = '');
      document.querySelector('textarea').value = '';
      loadPendingLeaves(); // Reload leaves to show the new request
    } catch (error) {
      console.error('Error applying for leave:', error);
      window.alert(error.response?.data?.error || '❌ Error submitting leave request');
    } finally {
      setApplyingLeave(false);
    }
  };

  const updateBusStatus = async (status) => {
    if (!bus) return;
    
    // If marking as breakdown, send breakdown alert
    if (status === 'BREAKDOWN') {
      const message = prompt('Enter breakdown details:');
      const location = prompt('Enter current location:');
      
      if (!message) {
        alert('Breakdown details are required');
        return;
      }
      
      setUpdating(true);
      try {
        const response = await axiosInstance.post('/driver/breakdown-alert/', {
          message: message,
          location: location || ''
        });
        
        alert(`✅ ${response.data.message}\n\nAdmins notified: ${response.data.admins_notified}\nStudents notified: ${response.data.students_notified}`);
        loadMyBus();
      } catch (error) {
        console.error('Error sending breakdown alert:', error);
        alert(error.response?.data?.error || 'Error sending breakdown alert');
      } finally {
        setUpdating(false);
      }
    } else {
      // Regular status update
      setUpdating(true);
      try {
        await axiosInstance.patch(`/buses/${bus.id}/update_status/`, { status });
        loadMyBus();
        alert('Bus status updated successfully');
      } catch (error) {
        alert('Error updating bus status');
      } finally {
        setUpdating(false);
      }
    }
  };

  const updateLocation = async () => {
    if (!bus) return;
    const location = prompt('Enter current location:');
    if (location) {
      setUpdating(true);
      try {
        await axiosInstance.patch(`/buses/${bus.id}/update_location/`, { current_location: location });
        loadMyBus();
        alert('Location updated successfully');
      } catch (error) {
        alert('Error updating location');
      } finally {
        setUpdating(false);
      }
    }
  };

  const getBusStatusVariant = (status) => {
    switch (status) {
      case 'WORKING':
        return 'success';
      case 'BREAKDOWN':
        return 'error';
      case 'NOT_RUNNING':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const StatCard = ({ icon: Icon, label, value, variant = 'emerald' }) => (
    <Card hoverEffect>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-lg bg-${variant}-500/10 border border-${variant}-500/20 flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${variant}-500`} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Driver Dashboard</h1>
            <p className="text-gray-400">Manage your assigned bus and routes</p>
          </div>
          <Button
            onClick={toggleTracking}
            variant={isTracking ? 'danger' : 'success'}
            className="animate-pulse"
          >
            {isTracking ? 'Stop Live Tracking' : 'Start Live Tracking'}
          </Button>
        </div>

        {/* Stats */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <StatCard
              icon={DollarSign}
              label="Monthly Salary"
              value={`₹${dashboard.salary || user?.salary || 0}`}
              variant="emerald"
            />
            <StatCard
              icon={CheckCircle}
              label="Today's Attendance"
              value={dashboard.today_attendance_marked ? 'Marked' : 'Not Marked'}
              variant="blue"
            />
          </div>
        )}

        {/* Bus Information */}
        {bus ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Bus Details Card */}
              <Card>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Bus className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Assigned Bus</h2>
                    <p className="text-sm text-gray-400">Your current assignment</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Bus Number</p>
                    <p className="text-lg font-semibold text-white">{bus.bus_number}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Route</p>
                    <p className="text-white">
                      {bus.source} <span className="text-emerald-500">→</span> {bus.destination}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Capacity</p>
                      <p className="text-white font-medium">{bus.capacity} seats</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
                      <Badge variant={getBusStatusVariant(bus.status)} dot>
                        {bus.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Current Location</p>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <p className="text-white">{bus.current_location || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Actions Card */}
              <Card>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Quick Actions</h2>
                    <p className="text-sm text-gray-400">Update bus status and location</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Update Status</p>
                    <div className="flex rounded-lg border border-gray-700 overflow-hidden bg-gray-900">
                      <button
                        onClick={() => updateBusStatus('WORKING')}
                        disabled={updating}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                          bus.status === 'WORKING'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-white'
                        } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <CheckCircle className="h-4 w-4 inline mr-2" />
                        Working
                      </button>
                      <button
                        onClick={() => updateBusStatus('BREAKDOWN')}
                        disabled={updating}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-all border-l border-r border-gray-700 ${
                          bus.status === 'BREAKDOWN'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-white'
                        } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        Breakdown
                      </button>
                      <button
                        onClick={() => updateBusStatus('NOT_RUNNING')}
                        disabled={updating}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                          bus.status === 'NOT_RUNNING'
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-white'
                        } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Bus className="h-4 w-4 inline mr-2" />
                        Not Running
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Driver Status</p>
                    <div className="flex rounded-lg border border-gray-700 overflow-hidden bg-gray-900">
                      <button
                        onClick={() => updateDriverStatus('AVAILABLE')}
                        disabled={updating}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                          driverStatus === 'AVAILABLE'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-white'
                        } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <CheckCircle className="h-4 w-4 inline mr-2" />
                        Available
                      </button>
                      <button
                        onClick={() => updateDriverStatus('UNAVAILABLE')}
                        disabled={updating}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-all border-l border-r border-gray-700 ${
                          driverStatus === 'UNAVAILABLE'
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-white'
                        } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <XCircle className="h-4 w-4 inline mr-2" />
                        Unavailable
                      </button>
                      <button
                        onClick={() => updateDriverStatus('ON_LEAVE')}
                        disabled={updating}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                          driverStatus === 'ON_LEAVE'
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-white'
                        } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        On Leave
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Attendance</p>
                    <Button
                      onClick={() => navigate('/attendance')}
                      variant="primary"
                      className="w-full justify-start"
                      leftIcon={<ClipboardCheck className="h-4 w-4" />}
                    >
                      Mark My Attendance
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Apply for Leave</p>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          placeholder="From Date"
                          className="rounded-md bg-gray-900 border border-gray-800 text-gray-100 text-sm px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                        />
                        <input
                          type="date"
                          placeholder="To Date"
                          className="rounded-md bg-gray-900 border border-gray-800 text-gray-100 text-sm px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                        />
                      </div>
                      <textarea
                        placeholder="Reason for leave..."
                        rows="2"
                        className="w-full rounded-md bg-gray-900 border border-gray-800 text-gray-100 text-sm px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      />
                      <Button
                        onClick={handleApplyLeave}
                        variant="warning"
                        size="sm"
                        className="w-full"
                        isLoading={applyingLeave}
                      >
                        Submit Leave Request
                      </Button>
                    </div>

                    {/* Leave Status Display */}
                    {pendingLeaves.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Your Leave Requests</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {pendingLeaves.map((leave) => (
                            <div key={leave.id} className="p-3 bg-gray-900 border border-gray-800 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-300">
                                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">{leave.reason}</p>
                                </div>
                                <Badge 
                                  variant={
                                    leave.status === 'APPROVED' ? 'success' : 
                                    leave.status === 'REJECTED' ? 'error' : 
                                    'warning'
                                  }
                                  size="sm"
                                >
                                  {leave.status}
                                </Badge>
                              </div>
                              {leave.status === 'APPROVED' && leave.substitute_driver_details && (
                                <p className="text-xs text-emerald-400">
                                  Substitute: {leave.substitute_driver_details.first_name} {leave.substitute_driver_details.last_name}
                                </p>
                              )}
                              {leave.status === 'REJECTED' && leave.admin_remarks && (
                                <p className="text-xs text-red-400 mt-1">
                                  Remarks: {leave.admin_remarks}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Bus Seat Map */}
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Seat Allocation</h2>
                  <p className="text-sm text-gray-400">View passenger seating arrangement</p>
                </div>
              </div>
              <BusSeatMap busId={bus.id} userRole="DRIVER" />
            </Card>
          </>
        ) : (
          <Card className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Bus className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Bus Assigned</h3>
              <p className="text-gray-400">
                You haven't been assigned to a bus yet. Please contact your administrator.
              </p>
            </motion.div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
