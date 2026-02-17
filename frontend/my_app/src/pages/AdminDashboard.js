import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Bus, Users, UserCheck, AlertTriangle, Plus, X, ArrowLeft, Zap, UserPlus, User, GraduationCap, MapPin, Phone, Mail, Calendar, MessageSquare, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RealisticBusMap from '../components/RealisticBusMap';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingDriver, setEditingDriver] = useState(false);
  const [driverEditForm, setDriverEditForm] = useState({
    salary: '',
    home_location: '',
    home_latitude: '',
    home_longitude: '',
  });
  const [busSeats, setBusSeats] = useState([]);
  const [showBusForm, setShowBusForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [assigningStudents, setAssigningStudents] = useState(false);
  const [assigningDriver, setAssigningDriver] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [currentView, setCurrentView] = useState('buses'); // 'buses', 'drivers', 'students', 'alerts', 'leaves', 'queries'
  const [feeFilter, setFeeFilter] = useState('all'); // 'all', 'paid', 'unpaid'
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [studentQueries, setStudentQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [selectedLeaveForApproval, setSelectedLeaveForApproval] = useState(null);
  const [substituteDriverId, setSubstituteDriverId] = useState('');
  const [busForm, setBusForm] = useState({
    bus_number: '',
    source: '',
    destination: '',
    capacity: '',
  });

  useEffect(() => {
    loadDashboard();
    loadBuses();
    loadDrivers();
    loadAlerts(); // Load alerts on mount to get count
  }, []);

  useEffect(() => {
    if (currentView === 'students') {
      loadStudents();
    } else if (currentView === 'alerts') {
      loadAlerts();
    } else if (currentView === 'leaves') {
      loadLeaveRequests();
    } else if (currentView === 'queries') {
      loadStudentQueries();
    }
  }, [currentView]);

  const loadAlerts = async () => {
    try {
      const response = await axiosInstance.get('/emergency-alerts/');
      setAlerts(response.data);
      // Count active alerts
      const activeCount = response.data.filter(a => a.status === 'ACTIVE').length;
      setActiveAlertsCount(activeCount);
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts([]);
      setActiveAlertsCount(0);
    }
  };

  const loadLeaveRequests = async () => {
    try {
      const response = await axiosInstance.get('/driver-leaves/');
      setLeaveRequests(response.data);
    } catch (error) {
      console.error('Error loading leave requests:', error);
      setLeaveRequests([]);
    }
  };

  const loadStudentQueries = async () => {
    try {
      const response = await axiosInstance.get('/student-queries/');
      setStudentQueries(response.data);
    } catch (error) {
      console.error('Error loading student queries:', error);
      setStudentQueries([]);
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await axiosInstance.get('/dashboard/admin/');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadBuses = async () => {
    try {
      const response = await axiosInstance.get('/buses/');
      setBuses(response.data);
    } catch (error) {
      console.error('Error loading buses:', error);
    }
  };

  const loadDrivers = async () => {
    try {
      console.log('Loading drivers...');
      const response = await axiosInstance.get('/admin/available-drivers/');
      console.log('Full drivers response:', response);
      console.log('Drivers data:', response.data);
      
      if (response.data && response.data.available_drivers) {
        const driversList = response.data.available_drivers;
        console.log('Drivers list:', driversList);
        setDrivers(driversList);
      } else {
        console.error('No available_drivers in response');
        setDrivers([]);
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
      console.error('Error response:', error.response);
      setDrivers([]);
    }
  };

  const loadStudents = async () => {
    try {
      console.log('Loading students...');
      const response = await axiosInstance.get('/admin/students/');
      console.log('Students response:', response);
      console.log('Students data:', response.data);
      
      if (response.data && response.data.students) {
        const studentsList = response.data.students;
        console.log('Students list:', studentsList);
        setStudents(studentsList);
      } else {
        console.error('No students in response');
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      console.error('Error response:', error.response);
      setStudents([]);
    }
  };

  // Filter students based on fee payment status
  const getFilteredStudents = () => {
    if (feeFilter === 'all') {
      return students;
    } else if (feeFilter === 'paid') {
      return students.filter(student => !student.has_unpaid_fees);
    } else if (feeFilter === 'unpaid') {
      return students.filter(student => student.has_unpaid_fees);
    }
    return students;
  };

  // Group students by college
  const getStudentsByCollege = () => {
    const filteredStudents = getFilteredStudents();
    const grouped = {};
    
    filteredStudents.forEach(student => {
      const college = student.college_name || 'Unknown';
      if (!grouped[college]) {
        grouped[college] = [];
      }
      grouped[college].push(student);
    });
    
    return grouped;
  };

  const loadBusSeats = async (bus) => {
    setSelectedBus(bus);
    try {
      const response = await axiosInstance.get(`/seats/?bus=${bus.id}`);
      setBusSeats(response.data);
    } catch (error) {
      console.error('Error loading seats:', error);
    }
  };

  const handleAutoAssignStudents = async () => {
    if (!selectedBus) return;

    setAssigningStudents(true);
    try {
      const response = await axiosInstance.post('/admin/auto-assign-bus/', {
        bus_id: selectedBus.id
      });

      const locationMatched = response.data.location_matched || 0;
      const totalAssigned = response.data.total_assigned || 0;
      
      alert(`✅ ${response.data.message}\n\n📍 Location Matched: ${locationMatched}/${totalAssigned} students\n\nAssigned students:\n${response.data.assignments.map(a => `${a.student} → Seat ${a.seat} (${a.section}) ${a.location_matched ? '✓' : ''}`).join('\n')}`);

      // Reload bus seats to show updated assignments
      loadBusSeats(selectedBus);
      loadBuses();
      loadDashboard();
    } catch (error) {
      console.error('Error auto-assigning students:', error);
      alert(error.response?.data?.error || 'Error auto-assigning students');
    } finally {
      setAssigningStudents(false);
    }
  };

  const handleRemoveSeat = async (seatId) => {
    try {
      const response = await axiosInstance.post(`/admin/unassign-seat/${seatId}/`);
      alert(`✅ ${response.data.message}`);
      
      // Reload bus seats to show updated assignments
      if (selectedBus) {
        loadBusSeats(selectedBus);
        loadBuses();
        loadDashboard();
      }
    } catch (error) {
      console.error('Error removing seat:', error);
      alert(error.response?.data?.error || 'Error removing student from seat');
    }
  };

  const handleAssignDriver = async (e) => {
    e.preventDefault();
    if (!selectedBus || !selectedDriverId) return;

    setAssigningDriver(true);
    try {
      await axiosInstance.post(`/buses/${selectedBus.id}/assign_driver/`, {
        driver_id: parseInt(selectedDriverId)
      });

      alert('Driver assigned successfully!');
      setShowDriverForm(false);
      setSelectedDriverId('');
      
      // Reload data
      const updatedBus = await axiosInstance.get(`/buses/${selectedBus.id}/`);
      setSelectedBus(updatedBus.data);
      loadBuses();
      loadDashboard();
    } catch (error) {
      console.error('Error assigning driver:', error);
      alert(error.response?.data?.error || 'Error assigning driver');
    } finally {
      setAssigningDriver(false);
    }
  };

  const handleUpdateDriverSalary = async () => {
    if (!selectedDriver) return;
    
    try {
      const updateData = {
        salary: parseFloat(driverEditForm.salary)
      };
      
      // Include location if provided
      if (driverEditForm.home_location) {
        updateData.home_location = driverEditForm.home_location;
      }
      if (driverEditForm.home_latitude) {
        updateData.home_latitude = parseFloat(driverEditForm.home_latitude);
      }
      if (driverEditForm.home_longitude) {
        updateData.home_longitude = parseFloat(driverEditForm.home_longitude);
      }
      
      const response = await axiosInstance.patch(`/admin/update-driver/${selectedDriver.id}/`, updateData);
      
      alert('✅ Driver details updated successfully!');
      setEditingDriver(false);
      
      // Update selectedDriver with new data
      if (response.data.driver) {
        setSelectedDriver(response.data.driver);
      }
      
      loadDrivers();
    } catch (error) {
      console.error('Error updating driver:', error);
      alert('❌ Error updating driver details');
    }
  };

  const handleDeleteDriver = async (driverId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this driver? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axiosInstance.delete(`/admin/delete-driver/${driverId}/`);
      alert('✅ Driver deleted successfully!');
      setSelectedDriver(null);
      loadDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert(error.response?.data?.error || '❌ Error deleting driver');
    }
  };

  const handleCreateBus = async (e) => {
    e.preventDefault();
    try {
      const busData = {
        bus_number: parseInt(busForm.bus_number),
        source: busForm.source,
        destination: busForm.destination,
        capacity: parseInt(busForm.capacity)
      };

      await axiosInstance.post('/buses/', busData);
      setShowBusForm(false);
      setBusForm({ bus_number: '', source: '', destination: '', capacity: '' });
      loadBuses();
      loadDashboard();
      alert('Bus created successfully!');
    } catch (error) {
      console.error('Error creating bus:', error.response?.data);
      const errorMsg = error.response?.data?.error ||
        error.response?.data?.bus_number?.[0] ||
        error.response?.data?.capacity?.[0] ||
        'Error creating bus. Please check all fields.';
      alert(errorMsg);
    }
  };

  const StatCard = ({ icon: Icon, label, value, variant }) => (
    <Card hoverEffect className="relative overflow-hidden">
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

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage buses, drivers, students, and staff</p>
          
          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              variant={currentView === 'buses' ? 'primary' : 'outline'}
              onClick={() => setCurrentView('buses')}
              leftIcon={<Bus className="h-4 w-4" />}
            >
              Bus Management
            </Button>
            <Button
              variant={currentView === 'drivers' ? 'primary' : 'outline'}
              onClick={() => setCurrentView('drivers')}
              leftIcon={<Users className="h-4 w-4" />}
            >
              Drivers
            </Button>
            <Button
              variant={currentView === 'students' ? 'primary' : 'outline'}
              onClick={() => setCurrentView('students')}
              leftIcon={<GraduationCap className="h-4 w-4" />}
            >
              Students
            </Button>
            <Button
              variant={currentView === 'alerts' ? 'error' : 'outline'}
              onClick={() => setCurrentView('alerts')}
              leftIcon={<AlertTriangle className={`h-4 w-4 ${activeAlertsCount > 0 ? 'text-red-500 animate-pulse' : ''}`} />}
              className={activeAlertsCount > 0 ? 'relative' : ''}
            >
              Emergency Alerts
              {activeAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {activeAlertsCount}
                </span>
              )}
            </Button>
            <Button
              variant={currentView === 'leaves' ? 'warning' : 'outline'}
              onClick={() => setCurrentView('leaves')}
              leftIcon={<Calendar className="h-4 w-4" />}
            >
              Leave Requests
            </Button>
            <Button
              variant={currentView === 'queries' ? 'primary' : 'outline'}
              onClick={() => setCurrentView('queries')}
              leftIcon={<MessageSquare className="h-4 w-4" />}
            >
              Student Queries
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Bus} label="Total Buses" value={stats.total_buses} variant="emerald" />
            <StatCard icon={Users} label="Total Drivers" value={stats.total_drivers} variant="blue" />
            <StatCard icon={UserCheck} label="Students" value={stats.total_students} variant="purple" />
            <StatCard icon={AlertTriangle} label="Pending Attendance" value={stats.pending_attendance} variant="amber" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentView === 'buses' && !selectedBus ? (
            /* Bus List View */
            <motion.div
              key="bus-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Bus Management</h2>
                    <p className="text-sm text-gray-400">Click on a bus to view and manage seat assignments</p>
                  </div>
                  <Button
                    onClick={() => setShowBusForm(!showBusForm)}
                    leftIcon={showBusForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    variant={showBusForm ? 'secondary' : 'primary'}
                  >
                    {showBusForm ? 'Cancel' : 'Add Bus'}
                  </Button>
                </div>

                {/* Bus Form */}
                {showBusForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <form onSubmit={handleCreateBus} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        type="number"
                        placeholder="Bus Number"
                        value={busForm.bus_number}
                        onChange={(e) => setBusForm({ ...busForm, bus_number: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Source"
                        value={busForm.source}
                        onChange={(e) => setBusForm({ ...busForm, source: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Destination"
                        value={busForm.destination}
                        onChange={(e) => setBusForm({ ...busForm, destination: e.target.value })}
                        required
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Capacity"
                          value={busForm.capacity}
                          onChange={(e) => setBusForm({ ...busForm, capacity: e.target.value })}
                          required
                        />
                        <Button type="submit" className="whitespace-nowrap">
                          Create
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Bus Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {buses.map((bus) => (
                    <motion.button
                      key={bus.id}
                      onClick={() => loadBusSeats(bus)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-lg bg-gray-800/50 border-2 border-gray-700 hover:border-emerald-500 transition-all text-left group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                            <Bus className="h-6 w-6 text-emerald-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">Bus {bus.bus_number}</h3>
                            <Badge variant={getBusStatusVariant(bus.status)} dot size="sm">
                              {bus.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="text-gray-400 w-16">Route:</span>
                          <span className="text-white font-medium">
                            {bus.source} <span className="text-emerald-500">→</span> {bus.destination}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-gray-400 w-16">Driver:</span>
                          <span className="text-white">
                            {bus.driver_details?.username || <span className="text-gray-500">Not assigned</span>}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-gray-400 w-16">Seats:</span>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full transition-all duration-300"
                                  style={{
                                    width: `${(bus.assigned_seats_count / bus.capacity) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-400 whitespace-nowrap font-medium">
                                {bus.assigned_seats_count}/{bus.capacity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {buses.length === 0 && (
                  <div className="text-center py-12">
                    <Bus className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No buses yet. Create your first bus!</p>
                  </div>
                )}
              </Card>
            </motion.div>
          ) : currentView === 'buses' && selectedBus ? (
            /* Bus Detail View with Seat Map */
            <motion.div
              key="bus-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={() => {
                        setSelectedBus(null);
                        setBusSeats([]);
                        setShowDriverForm(false);
                      }}
                      variant="outline"
                      leftIcon={<ArrowLeft className="h-4 w-4" />}
                    >
                      Back to Buses
                    </Button>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Bus {selectedBus.bus_number}</h2>
                      <p className="text-sm text-gray-400">
                        {selectedBus.source} → {selectedBus.destination}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowDriverForm(!showDriverForm)}
                      variant="outline"
                      leftIcon={<UserPlus className="h-4 w-4" />}
                    >
                      {selectedBus.driver_details ? 'Change Driver' : 'Assign Driver'}
                    </Button>
                    <Button
                      onClick={handleAutoAssignStudents}
                      variant="primary"
                      leftIcon={<Zap className="h-4 w-4" />}
                      isLoading={assigningStudents}
                      className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
                    >
                      Auto Assign Students
                    </Button>
                  </div>
                </div>

                {/* Driver Assignment Form */}
                {showDriverForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <h3 className="text-sm font-medium text-white mb-3">Assign Driver to Bus</h3>
                    
                    {/* Debug info */}
                    <div className="mb-3 p-2 bg-gray-900 rounded text-xs text-gray-400">
                      <p>Drivers loaded: {drivers.length}</p>
                      <p>Driver IDs: {drivers.map(d => d.id).join(', ')}</p>
                    </div>
                    
                    {drivers.length === 0 ? (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">No drivers found in the system.</p>
                        <p className="text-xs text-gray-500">Make sure you have created driver accounts with role='DRIVER'</p>
                      </div>
                    ) : (
                      <form onSubmit={handleAssignDriver} className="space-y-3">
                        <select
                          value={selectedDriverId}
                          onChange={(e) => setSelectedDriverId(e.target.value)}
                          className="w-full rounded-md bg-gray-900 border border-gray-800 text-gray-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-200 px-3 py-2 text-sm"
                          required
                        >
                          <option value="">Select a driver...</option>
                          {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>
                              {driver.username} - {driver.name} 
                              {driver.assigned_bus ? ` (Currently on Bus ${driver.assigned_bus})` : ' (Available)'}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <Button type="submit" isLoading={assigningDriver}>
                            Assign
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowDriverForm(false);
                              setSelectedDriverId('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </motion.div>
                )}

                <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Driver</p>
                    <p className="text-sm font-bold text-white">
                      {selectedBus.driver_details?.username || <span className="text-gray-500">Not assigned</span>}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Capacity</p>
                    <p className="text-lg font-bold text-white">{selectedBus.capacity} seats</p>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Assigned</p>
                    <p className="text-lg font-bold text-emerald-500">{selectedBus.assigned_seats_count}</p>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Available</p>
                    <p className="text-lg font-bold text-blue-500">
                      {selectedBus.capacity - selectedBus.assigned_seats_count}
                    </p>
                  </div>
                </div>

                <RealisticBusMap 
                  busId={selectedBus.id} 
                  seats={busSeats} 
                  showNames={true} 
                  userRole="ADMIN"
                  onRemoveSeat={handleRemoveSeat}
                />

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Zap className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-400 mb-1">Smart Auto-Assignment</p>
                      <p className="text-xs text-gray-400">
                        Click "Auto Assign Students" to automatically assign unassigned students to this bus.
                        The system will place female students in the front rows and male students in the back rows.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : currentView === 'drivers' ? (
            /* Drivers List View */
            <motion.div
              key="drivers-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <h2 className="text-xl font-bold text-white mb-4">Drivers Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drivers.map((driver) => (
                    <motion.button
                      key={driver.id}
                      onClick={() => setSelectedDriver(driver)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-lg bg-gray-800/50 border-2 border-gray-700 hover:border-blue-500 transition-all text-left"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{driver.name}</h3>
                          <Badge variant={driver.status === 'AVAILABLE' ? 'success' : 'warning'} size="sm">
                            {driver.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-400">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {driver.home_location || 'N/A'}
                        </p>
                        <p className="text-gray-400">
                          <Bus className="h-3 w-3 inline mr-1" />
                          Bus: {driver.assigned_bus || 'Not assigned'}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          ) : currentView === 'alerts' ? (
            /* Emergency Alerts View */
            <motion.div
              key="alerts-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Emergency Alerts</h2>
                    <p className="text-sm text-gray-400">Breakdown alerts from drivers</p>
                  </div>
                  <Badge variant="error" size="lg">
                    {alerts.filter(a => a.status === 'ACTIVE').length} Active
                  </Badge>
                </div>

                {alerts.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No emergency alerts</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border-2 ${
                          alert.status === 'ACTIVE'
                            ? 'bg-red-500/10 border-red-500/50'
                            : 'bg-gray-800/50 border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              alert.status === 'ACTIVE'
                                ? 'bg-red-500/20 border border-red-500/30'
                                : 'bg-gray-700/50 border border-gray-600'
                            }`}>
                              <AlertTriangle className={`h-5 w-5 ${
                                alert.status === 'ACTIVE' ? 'text-red-500' : 'text-gray-500'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-white">
                                  Bus {alert.bus_details?.bus_number || 'N/A'}
                                </h3>
                                <Badge variant={alert.status === 'ACTIVE' ? 'error' : 'neutral'} size="sm">
                                  {alert.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400 mb-2">
                                Driver: {alert.driver_details?.username || 'Unknown'}
                              </p>
                              <p className="text-sm text-white bg-gray-900/50 p-2 rounded mb-2">
                                {alert.message}
                              </p>
                              {alert.location && (
                                <p className="text-xs text-gray-400">
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  Location: {alert.location}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Reported: {new Date(alert.created_at).toLocaleString()}
                              </p>
                              {alert.resolved_at && (
                                <p className="text-xs text-emerald-400 mt-1">
                                  ✓ Resolved: {new Date(alert.resolved_at).toLocaleString()} by {alert.resolved_by_details?.username}
                                </p>
                              )}
                            </div>
                          </div>
                          {alert.status === 'ACTIVE' && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={async () => {
                                if (window.confirm('Mark this alert as resolved?')) {
                                  try {
                                    await axiosInstance.patch(`/emergency-alerts/${alert.id}/resolve/`);
                                    window.alert('✅ Alert resolved successfully');
                                    loadAlerts();
                                  } catch (error) {
                                    console.error('Error resolving alert:', error);
                                    window.alert('❌ Error resolving alert');
                                  }
                                }
                              }}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          ) : currentView === 'leaves' ? (
            /* Leave Requests View */
            <motion.div
              key="leaves-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Driver Leave Requests</h2>
                    <p className="text-sm text-gray-400">Approve or reject driver leave applications</p>
                  </div>
                  <Badge variant="warning" size="lg">
                    {leaveRequests.filter(l => l.status === 'PENDING').length} Pending
                  </Badge>
                </div>

                {leaveRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No leave requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaveRequests.map((leave) => (
                      <motion.div
                        key={leave.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border-2 ${
                          leave.status === 'PENDING'
                            ? 'bg-amber-500/10 border-amber-500/50'
                            : leave.status === 'APPROVED'
                            ? 'bg-emerald-500/10 border-emerald-500/50'
                            : 'bg-red-500/10 border-red-500/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              leave.status === 'PENDING'
                                ? 'bg-amber-500/20 border border-amber-500/30'
                                : leave.status === 'APPROVED'
                                ? 'bg-emerald-500/20 border border-emerald-500/30'
                                : 'bg-red-500/20 border border-red-500/30'
                            }`}>
                              <Calendar className={`h-5 w-5 ${
                                leave.status === 'PENDING'
                                  ? 'text-amber-500'
                                  : leave.status === 'APPROVED'
                                  ? 'text-emerald-500'
                                  : 'text-red-500'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-white">
                                  {leave.driver_details?.username || 'Unknown Driver'}
                                </h3>
                                <Badge 
                                  variant={
                                    leave.status === 'PENDING' ? 'warning' :
                                    leave.status === 'APPROVED' ? 'success' : 'error'
                                  } 
                                  size="sm"
                                >
                                  {leave.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400 mb-2">
                                {leave.start_date} to {leave.end_date}
                              </p>
                              <div className="mb-2">
                                <p className="text-xs text-gray-400 mb-1">Reason:</p>
                                <p className="text-sm text-white bg-gray-900/50 p-2 rounded">
                                  {leave.reason}
                                </p>
                              </div>
                              {leave.substitute_driver_details && (
                                <p className="text-xs text-emerald-400 mt-1">
                                  Substitute: {leave.substitute_driver_details.username}
                                </p>
                              )}
                              {leave.admin_remarks && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Admin remarks: {leave.admin_remarks}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Requested: {new Date(leave.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {leave.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => {
                                  setSelectedLeaveForApproval(leave);
                                  setSubstituteDriverId('');
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={async () => {
                                  const remarks = prompt('Enter rejection reason:');
                                  if (remarks) {
                                    try {
                                      await axiosInstance.patch(`/driver-leaves/${leave.id}/reject/`, {
                                        admin_remarks: remarks
                                      });
                                      window.alert('✅ Leave rejected successfully');
                                      loadLeaveRequests();
                                    } catch (error) {
                                      console.error('Error rejecting leave:', error);
                                      window.alert('❌ Error rejecting leave');
                                    }
                                  }
                                }}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          ) : currentView === 'queries' ? (
            /* Student Queries View */
            <motion.div
              key="queries-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Student Queries</h2>
                    <p className="text-sm text-gray-400">View and respond to student questions</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="warning" size="lg">
                      {studentQueries.filter(q => q.status === 'OPEN').length} Open
                    </Badge>
                    <Badge variant="info" size="lg">
                      {studentQueries.filter(q => q.status === 'REPLIED').length} Replied
                    </Badge>
                  </div>
                </div>

                {studentQueries.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No student queries</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentQueries.map((query) => (
                      <motion.div
                        key={query.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border-2 ${
                          query.status === 'OPEN'
                            ? 'bg-amber-500/10 border-amber-500/50'
                            : query.status === 'REPLIED'
                            ? 'bg-blue-500/10 border-blue-500/50'
                            : query.status === 'REOPENED'
                            ? 'bg-red-500/10 border-red-500/50'
                            : 'bg-gray-800/50 border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-white">{query.subject}</h3>
                              <Badge 
                                variant={
                                  query.status === 'OPEN' ? 'warning' :
                                  query.status === 'REPLIED' ? 'info' :
                                  query.status === 'REOPENED' ? 'error' : 'success'
                                } 
                                size="sm"
                              >
                                {query.status}
                              </Badge>
                              {query.anonymous && (
                                <Badge variant="neutral" size="sm">Anonymous</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                              <span>
                                {query.anonymous ? 'Anonymous Student' : query.student_details?.username}
                              </span>
                              <span>Bus {query.bus_details?.bus_number}</span>
                              <span>Seat {query.seat_number}</span>
                            </div>
                            <p className="text-sm text-white bg-gray-900/50 p-3 rounded mb-2">
                              {query.message}
                            </p>
                            {query.admin_reply && (
                              <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded">
                                <p className="text-xs text-emerald-400 mb-1">
                                  Your Reply ({query.replied_by_details?.username}):
                                </p>
                                <p className="text-sm text-white">{query.admin_reply}</p>
                              </div>
                            )}
                            {query.satisfaction_feedback && (
                              <div className="mt-2 p-2 bg-gray-900/50 rounded">
                                <p className="text-xs text-gray-400">Student Feedback:</p>
                                <p className="text-sm text-white">{query.satisfaction_feedback}</p>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Submitted: {new Date(query.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {(query.status === 'OPEN' || query.status === 'REOPENED') && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={async () => {
                                  const reply = prompt('Enter your reply to the student:');
                                  if (reply) {
                                    try {
                                      await axiosInstance.post(`/student-queries/${query.id}/reply/`, {
                                        admin_reply: reply
                                      });
                                      alert('✅ Reply sent successfully');
                                      loadStudentQueries();
                                    } catch (error) {
                                      console.error('Error replying to query:', error);
                                      alert('❌ Error sending reply');
                                    }
                                  }
                                }}
                              >
                                Reply
                              </Button>
                            )}
                            {query.status !== 'CLOSED' && (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={async () => {
                                  if (window.confirm('Close this query?')) {
                                    try {
                                      await axiosInstance.post(`/student-queries/${query.id}/close/`);
                                      alert('✅ Query closed');
                                      loadStudentQueries();
                                    } catch (error) {
                                      console.error('Error closing query:', error);
                                      alert('❌ Error closing query');
                                    }
                                  }
                                }}
                              >
                                Close
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          ) : currentView === 'students' ? (
            /* Students List View */
            <motion.div
              key="students-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Students Management</h2>
                    <p className="text-sm text-gray-400">Filter by fee payment status and view by college</p>
                  </div>
                  {selectedCollege && (
                    <Button
                      onClick={() => setSelectedCollege(null)}
                      variant="outline"
                      leftIcon={<ArrowLeft className="h-4 w-4" />}
                    >
                      Back to Colleges
                    </Button>
                  )}
                </div>

                {/* Fee Filter Buttons */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  <Button
                    variant={feeFilter === 'all' ? 'primary' : 'outline'}
                    onClick={() => {
                      setFeeFilter('all');
                      setSelectedCollege(null);
                    }}
                    size="sm"
                  >
                    All Students ({students.length})
                  </Button>
                  <Button
                    variant={feeFilter === 'paid' ? 'success' : 'outline'}
                    onClick={() => {
                      setFeeFilter('paid');
                      setSelectedCollege(null);
                    }}
                    size="sm"
                  >
                    ✓ Fees Paid ({students.filter(s => !s.has_unpaid_fees).length})
                  </Button>
                  <Button
                    variant={feeFilter === 'unpaid' ? 'error' : 'outline'}
                    onClick={() => {
                      setFeeFilter('unpaid');
                      setSelectedCollege(null);
                    }}
                    size="sm"
                  >
                    ⚠ Fees Not Paid ({students.filter(s => s.has_unpaid_fees).length})
                  </Button>
                  
                  {/* Bulk Reminder Button for Unpaid Students */}
                  {feeFilter === 'unpaid' && students.filter(s => s.has_unpaid_fees).length > 0 && (
                    <Button
                      variant="warning"
                      onClick={async () => {
                        if (window.confirm(`Send fee reminder to all ${students.filter(s => s.has_unpaid_fees).length} students with unpaid fees?`)) {
                          try {
                            const response = await axiosInstance.post('/admin/send-bulk-fee-reminder/', {
                              filter: 'all_unpaid'
                            });
                            alert(`✅ ${response.data.message}\n\nReminders sent: ${response.data.reminders_sent}`);
                          } catch (error) {
                            console.error('Error sending bulk reminder:', error);
                            alert(error.response?.data?.error || '❌ Error sending reminders');
                          }
                        }
                      }}
                      size="sm"
                      leftIcon={<Bell className="h-4 w-4" />}
                      className="ml-auto"
                    >
                      Send Reminder to All Unpaid
                    </Button>
                  )}
                </div>

                {students.length === 0 ? (
                  <div className="text-center py-12">
                    <GraduationCap className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No students found. Add students to the system first.</p>
                  </div>
                ) : !selectedCollege ? (
                  /* College List View */
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {feeFilter === 'all' ? 'All Colleges' : feeFilter === 'paid' ? 'Colleges - Fees Paid Students' : 'Colleges - Fees Not Paid Students'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(getStudentsByCollege()).map(([college, collegeStudents]) => (
                        <motion.button
                          key={college}
                          onClick={() => setSelectedCollege(college)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-6 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-2 border-gray-700 hover:border-emerald-500 transition-all text-left"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="h-14 w-14 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                              <GraduationCap className="h-7 w-7 text-emerald-500" />
                            </div>
                            <Badge variant="primary" size="lg">
                              {collegeStudents.length}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{college}</h3>
                          <p className="text-sm text-gray-400">
                            {collegeStudents.length} {collegeStudents.length === 1 ? 'student' : 'students'}
                          </p>
                          {feeFilter === 'unpaid' && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <p className="text-xs text-red-400">
                                ⚠ Pending fee payments
                              </p>
                            </div>
                          )}
                          {feeFilter === 'paid' && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <p className="text-xs text-emerald-400">
                                ✓ All fees paid
                              </p>
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                    {Object.keys(getStudentsByCollege()).length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-400">
                          No students found with {feeFilter === 'paid' ? 'paid' : 'unpaid'} fees.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Student List for Selected College */
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {selectedCollege} - {feeFilter === 'all' ? 'All Students' : feeFilter === 'paid' ? 'Fees Paid' : 'Fees Not Paid'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getStudentsByCollege()[selectedCollege]?.map((student) => (
                        <motion.button
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-4 rounded-lg bg-gray-800/50 border-2 border-gray-700 hover:border-emerald-500 transition-all text-left"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                              <User className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white">{student.name}</h3>
                              <p className="text-xs text-gray-400">{student.username}</p>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-400">Year: {student.year}</p>
                            <p className="text-gray-400">
                              <Bus className="h-3 w-3 inline mr-1" />
                              Bus: {student.seat_details?.bus_number || 'Not assigned'}
                            </p>
                            {student.has_unpaid_fees ? (
                              <Badge variant="error" size="sm">Fees Pending</Badge>
                            ) : (
                              <Badge variant="success" size="sm">Fees Paid</Badge>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Detail Modals */}
        <AnimatePresence>
          {selectedDriver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => {
                setSelectedDriver(null);
                setEditingDriver(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Driver Management</h2>
                  <div className="flex gap-2">
                    {!editingDriver && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setEditingDriver(true);
                            setDriverEditForm({
                              salary: selectedDriver.salary || '',
                              home_location: selectedDriver.home_location || '',
                              home_latitude: selectedDriver.home_latitude || '',
                              home_longitude: selectedDriver.home_longitude || ''
                            });
                          }}
                        >
                          Edit Details
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteDriver(selectedDriver.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setSelectedDriver(null);
                        setEditingDriver(false);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Driver Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Name</p>
                      <p className="text-white font-medium">{selectedDriver.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Username</p>
                      <p className="text-white">{selectedDriver.username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Status</p>
                      <Badge variant={selectedDriver.status === 'AVAILABLE' ? 'success' : 'warning'}>
                        {selectedDriver.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Home Location</p>
                      <p className="text-white">{selectedDriver.home_location || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Assigned Bus</p>
                      <p className="text-white">{selectedDriver.assigned_bus || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">License Number</p>
                      <p className="text-white">{selectedDriver.license_number || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="pt-4 border-t border-gray-800">
                    <h3 className="text-lg font-bold text-white mb-4">Driver Information</h3>
                    {editingDriver ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Monthly Salary (₹)</label>
                          <Input
                            type="number"
                            value={driverEditForm.salary}
                            onChange={(e) => setDriverEditForm({ ...driverEditForm, salary: e.target.value })}
                            placeholder="Enter salary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Home Location</label>
                          <Input
                            type="text"
                            value={driverEditForm.home_location}
                            onChange={(e) => setDriverEditForm({ ...driverEditForm, home_location: e.target.value })}
                            placeholder="Enter home location"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-400 mb-2">Latitude</label>
                            <Input
                              type="number"
                              step="0.000001"
                              value={driverEditForm.home_latitude}
                              onChange={(e) => setDriverEditForm({ ...driverEditForm, home_latitude: e.target.value })}
                              placeholder="e.g., 11.0168"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-2">Longitude</label>
                            <Input
                              type="number"
                              step="0.000001"
                              value={driverEditForm.home_longitude}
                              onChange={(e) => setDriverEditForm({ ...driverEditForm, home_longitude: e.target.value })}
                              placeholder="e.g., 76.9558"
                            />
                          </div>
                        </div>
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <p className="text-xs text-blue-400">
                            💡 Salary will be auto-calculated based on assigned bus route distance when location is updated
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleUpdateDriverSalary} variant="primary">
                            Save Changes
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingDriver(false);
                              setDriverEditForm({ 
                                salary: '', 
                                home_location: '', 
                                home_latitude: '', 
                                home_longitude: '' 
                              });
                            }}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Monthly Salary</p>
                          <p className="text-white font-medium">₹{selectedDriver.salary || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Experience (Auto-calculated)</p>
                          <p className="text-white font-medium">{selectedDriver.driving_experience || 0} years</p>
                          <p className="text-xs text-gray-500 mt-1">Updates automatically each year</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {selectedStudent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedStudent(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Student Details</h2>
                  <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-white">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Name</p>
                      <p className="text-white font-medium">{selectedStudent.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Username</p>
                      <p className="text-white">{selectedStudent.username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">College</p>
                      <p className="text-white">{selectedStudent.college_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Year</p>
                      <p className="text-white">{selectedStudent.year ? `${selectedStudent.year} Year` : 'N/A'}</p>
                    </div>
                  </div>

                  {/* Transport Info */}
                  <div className="pt-4 border-t border-gray-800">
                    <h3 className="text-lg font-bold text-white mb-4">Transport Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Assigned Bus</p>
                        <p className="text-white font-medium">{selectedStudent.seat_details?.bus_number || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Seat Number</p>
                        <p className="text-white font-medium">{selectedStudent.seat_details?.seat_number || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Fee Status */}
                  <div className="pt-4 border-t border-gray-800">
                    <h3 className="text-lg font-bold text-white mb-4">Fee Payment Status</h3>
                    {selectedStudent.unpaid_fees && selectedStudent.unpaid_fees.length > 0 ? (
                      <div className="space-y-3">
                        {selectedStudent.unpaid_fees.map((fee) => (
                          <div key={fee.id} className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-white font-medium">₹{fee.amount}</p>
                                <p className="text-xs text-gray-400">{fee.description}</p>
                              </div>
                              <Badge variant="error">{fee.payment_status}</Badge>
                            </div>
                            <div className="text-sm text-gray-400 mb-3">
                              <p>Due Date: {fee.due_date}</p>
                              {fee.payment_status === 'OVERDUE' && (
                                <p className="text-red-400 font-medium mt-1">⚠️ Payment Overdue!</p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={async () => {
                                try {
                                  await axiosInstance.post(`/admin/send-fee-reminder/${selectedStudent.id}/`, {
                                    fee_id: fee.id
                                  });
                                  alert('✅ Fee reminder sent to student');
                                } catch (error) {
                                  alert('❌ Error sending reminder');
                                }
                              }}
                            >
                              Send Payment Reminder
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                        <p className="text-emerald-400 font-medium">✓ All fees paid</p>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="pt-4 border-t border-gray-800">
                    <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Email</p>
                        <p className="text-white">{selectedStudent.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Phone</p>
                        <p className="text-white">{selectedStudent.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Home Location</p>
                        <p className="text-white">{selectedStudent.home_location || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Gender</p>
                        <p className="text-white">{selectedStudent.gender || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Substitute Driver Selection Modal */}
          {selectedLeaveForApproval && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedLeaveForApproval(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Approve Leave Request</h3>
                  <button
                    onClick={() => setSelectedLeaveForApproval(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Driver</p>
                    <p className="text-white font-medium">
                      {selectedLeaveForApproval.driver_details?.username}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Leave Period</p>
                    <p className="text-white">
                      {selectedLeaveForApproval.start_date} to {selectedLeaveForApproval.end_date}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Select Substitute Driver <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={substituteDriverId}
                      onChange={(e) => setSubstituteDriverId(e.target.value)}
                      className="w-full rounded-md bg-gray-900 border border-gray-800 text-gray-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-200 px-3 py-2 text-sm"
                    >
                      <option value="">-- Select a driver --</option>
                      {drivers
                        .filter(d => d.id !== selectedLeaveForApproval.driver && d.status === 'AVAILABLE')
                        .map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name} ({driver.username})
                            {driver.assigned_bus ? ` - Currently on Bus ${driver.assigned_bus}` : ' - Available'}
                          </option>
                        ))}
                    </select>
                    {drivers.filter(d => d.status === 'AVAILABLE').length === 0 && (
                      <p className="text-xs text-amber-400 mt-2">
                        ⚠ No available drivers found
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={async () => {
                        if (!substituteDriverId) {
                          window.alert('Please select a substitute driver');
                          return;
                        }
                        try {
                          await axiosInstance.patch(`/driver-leaves/${selectedLeaveForApproval.id}/approve/`, {
                            substitute_driver: parseInt(substituteDriverId),
                            admin_remarks: 'Approved'
                          });
                          window.alert('✅ Leave approved successfully');
                          setSelectedLeaveForApproval(null);
                          setSubstituteDriverId('');
                          loadLeaveRequests();
                        } catch (error) {
                          console.error('Error approving leave:', error);
                          window.alert(error.response?.data?.error || '❌ Error approving leave');
                        }
                      }}
                      variant="success"
                      className="flex-1"
                    >
                      Approve Leave
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedLeaveForApproval(null);
                        setSubstituteDriverId('');
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
