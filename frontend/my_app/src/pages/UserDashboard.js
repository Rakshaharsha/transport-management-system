import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Bus, Bell, MessageSquare, MapPin, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [queries, setQueries] = useState([]);
  const [showQueryForm, setShowQueryForm] = useState(false);
  const [queryForm, setQueryForm] = useState({
    subject: '',
    message: '',
    anonymous: false,
  });

  useEffect(() => {
    loadDashboard();
    loadNotifications();
    loadQueries();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await axiosInstance.get('/dashboard/user/');
      setDashboard(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await axiosInstance.get('/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadQueries = async () => {
    try {
      const response = await axiosInstance.get('/student-queries/');
      setQueries(response.data);
    } catch (error) {
      console.error('Error loading queries:', error);
    }
  };

  const markNotificationSeen = async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/mark_seen/`);
      loadNotifications();
      loadDashboard();
    } catch (error) {
      console.error('Error marking notification:', error);
    }
  };

  const submitQuery = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/student-queries/submit/', queryForm);
      setShowQueryForm(false);
      setQueryForm({ subject: '', message: '', anonymous: false });
      loadQueries();
      loadDashboard();
      alert('Query submitted successfully');
    } catch (error) {
      alert(error.response?.data?.error || 'Error submitting query');
    }
  };

  const getQueryStatusVariant = (status) => {
    switch (status) {
      case 'CLOSED':
        return 'success';
      case 'REPLIED':
        return 'info';
      case 'REOPENED':
        return 'warning';
      case 'OPEN':
        return 'neutral';
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
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">View your transport information</p>
        </div>

        {/* Top Section - Seat Info & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Seat Information */}
          <Card>
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Bus className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">My Seat Information</h2>
                <p className="text-sm text-gray-400">Your assigned bus and seat</p>
              </div>
            </div>

            {dashboard?.assigned_seat ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Bus Number</p>
                  <p className="text-lg font-semibold text-white">
                    {dashboard.assigned_seat.bus_details.bus_number}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Seat Number</p>
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-xl font-bold text-emerald-500">
                      {dashboard.assigned_seat.seat_number}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Route</p>
                  <div className="flex items-center space-x-2 text-white">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>
                      {dashboard.assigned_seat.bus_details.source}
                      <span className="text-emerald-500 mx-2">→</span>
                      {dashboard.assigned_seat.bus_details.destination}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Bus className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No seat assigned yet</p>
              </div>
            )}
          </Card>

          {/* Quick Stats */}
          <Card>
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Quick Stats</h2>
                <p className="text-sm text-gray-400">Your activity overview</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">Unread Notifications</span>
                </div>
                <Badge variant="info">{dashboard?.unread_notifications || 0}</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-emerald-400" />
                  <span className="text-gray-300">Total Queries</span>
                </div>
                <Badge variant="success">{dashboard?.total_queries || 0}</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Section - Notifications & Queries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Notifications</h2>
                  <p className="text-sm text-gray-400">Recent updates</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border transition-colors ${
                      notif.is_seen
                        ? 'bg-gray-800/30 border-gray-800'
                        : 'bg-blue-500/5 border-blue-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-300 mb-2">{notif.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notif.is_seen && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markNotificationSeen(notif.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No notifications</p>
                </div>
              )}
            </div>
          </Card>

          {/* Queries */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">My Queries</h2>
                  <p className="text-sm text-gray-400">Support requests</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setShowQueryForm(!showQueryForm)}
                leftIcon={showQueryForm ? <X className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              >
                {showQueryForm ? 'Cancel' : 'New Query'}
              </Button>
            </div>

            <AnimatePresence>
              {showQueryForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={submitQuery}
                  className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3"
                >
                  <Input
                    placeholder="Subject"
                    value={queryForm.subject}
                    onChange={(e) => setQueryForm({ ...queryForm, subject: e.target.value })}
                    required
                  />
                  <textarea
                    className="block w-full rounded-md bg-gray-900 border border-gray-800 text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-200 px-3 py-2 text-sm"
                    placeholder="Describe your issue..."
                    rows="3"
                    value={queryForm.message}
                    onChange={(e) => setQueryForm({ ...queryForm, message: e.target.value })}
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={queryForm.anonymous}
                      onChange={(e) => setQueryForm({ ...queryForm, anonymous: e.target.checked })}
                      className="rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500"
                    />
                    <label htmlFor="anonymous" className="text-sm text-gray-400">
                      Submit anonymously
                    </label>
                  </div>
                  <Button type="submit" size="sm" className="w-full">
                    Submit Query
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {queries.length > 0 ? (
                queries.map((query) => (
                  <motion.div
                    key={query.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-800"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white">{query.subject}</h4>
                      <Badge variant={getQueryStatusVariant(query.status)}>
                        {query.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{query.message}</p>
                    {query.admin_reply && (
                      <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded">
                        <p className="text-xs text-emerald-400 mb-1">Admin Reply:</p>
                        <p className="text-sm text-white">{query.admin_reply}</p>
                      </div>
                    )}
                    {query.status === 'REPLIED' && !query.is_satisfied && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={async () => {
                            try {
                              await axiosInstance.post(`/student-queries/${query.id}/satisfaction/`, {
                                is_satisfied: true,
                                satisfaction_feedback: 'Satisfied with the response'
                              });
                              alert('✅ Thank you for your feedback!');
                              loadQueries();
                            } catch (error) {
                              alert('Error submitting feedback');
                            }
                          }}
                        >
                          Satisfied
                        </Button>
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={async () => {
                            const feedback = prompt('Please tell us why you are not satisfied:');
                            if (feedback) {
                              try {
                                await axiosInstance.post(`/student-queries/${query.id}/satisfaction/`, {
                                  is_satisfied: false,
                                  satisfaction_feedback: feedback
                                });
                                alert('Query reopened. Admin will review it again.');
                                loadQueries();
                              } catch (error) {
                                alert('Error submitting feedback');
                              }
                            }
                          }}
                        >
                          Not Satisfied
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(query.created_at).toLocaleString()}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No queries submitted</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
