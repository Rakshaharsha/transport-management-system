import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const DriverAttendance = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({
    status: 'PRESENT',
    km_driven: '',
    remarks: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axiosInstance.get('/driver/dashboard-stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axiosInstance.post('/driver/mark-attendance/', {
        status: attendanceForm.status,
        km_driven: parseFloat(attendanceForm.km_driven) || 0,
        remarks: attendanceForm.remarks
      });

      alert(`✅ ${response.data.message}`);
      setAttendanceForm({
        status: 'PRESENT',
        km_driven: '',
        remarks: ''
      });
      loadStats();
      
      // Navigate back to dashboard after 1 second to show updated stats
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert(error.response?.data?.error || '❌ Error marking attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'success';
      case 'ABSENT':
        return 'error';
      case 'LEAVE':
        return 'warning';
      case 'HALF_DAY':
        return 'info';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="mb-4"
          >
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">Mark Attendance</h1>
          <p className="text-gray-400">Record your daily attendance and kilometers driven</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card hoverEffect>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    Attendance Rate
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {stats.stats?.attendance_percentage || 0}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </Card>

            <Card hoverEffect>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    Total KM Driven
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {stats.stats?.total_km_driven || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card hoverEffect>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    Today's Status
                  </p>
                  {stats.stats?.today_marked ? (
                    <Badge variant={getStatusColor(stats.stats?.today_status)} size="lg">
                      {stats.stats?.today_status}
                    </Badge>
                  ) : (
                    <p className="text-sm text-gray-400">Not marked yet</p>
                  )}
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Attendance Form */}
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Mark Today's Attendance</h2>
              <p className="text-sm text-gray-400">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">
                Attendance Status
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['PRESENT', 'ABSENT', 'LEAVE', 'HALF_DAY'].map((status) => (
                  <motion.button
                    key={status}
                    type="button"
                    onClick={() => setAttendanceForm({ ...attendanceForm, status })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      attendanceForm.status === status
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <p className={`text-sm font-medium ${
                      attendanceForm.status === status ? 'text-emerald-400' : 'text-gray-300'
                    }`}>
                      {status.replace('_', ' ')}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* KM Driven */}
            <Input
              label="Kilometers Driven Today"
              type="number"
              step="0.1"
              min="0"
              placeholder="Enter KM driven (e.g., 45.5)"
              value={attendanceForm.km_driven}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, km_driven: e.target.value })}
              required={attendanceForm.status === 'PRESENT' || attendanceForm.status === 'HALF_DAY'}
            />

            {/* Remarks */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Remarks (Optional)
              </label>
              <textarea
                className="block w-full rounded-md bg-gray-900 border border-gray-800 text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-200 px-3 py-2 text-sm"
                placeholder="Any additional notes..."
                rows="3"
                value={attendanceForm.remarks}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, remarks: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              isLoading={submitting}
              leftIcon={<CheckCircle className="h-4 w-4" />}
            >
              Mark Attendance
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-400 mb-1">Attendance Guidelines</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Mark attendance once per day</li>
                  <li>• Enter accurate KM driven for PRESENT and HALF_DAY status</li>
                  <li>• Use LEAVE status if you have approved leave</li>
                  <li>• Add remarks for any special circumstances</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DriverAttendance;
