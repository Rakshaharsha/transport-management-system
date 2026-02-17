import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { User, Mail, Phone, MapPin, Save, CheckCircle, Edit, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    user?.profile_photo ? `http://127.0.0.1:8000${user.profile_photo}` : null
  );
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (profilePhoto) {
        formDataToSend.append('profile_photo', profilePhoto);
      }

      const response = await axiosInstance.patch('/auth/profile/update/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update user context with new data
      setUser(response.data);
      
      setMessage('Profile updated successfully');
      setIsEditing(false);
      
      // Update photo preview with new URL
      if (response.data.profile_photo) {
        setPhotoPreview(`http://127.0.0.1:8000${response.data.profile_photo}`);
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'DRIVER':
        return 'warning';
      case 'TEACHER':
        return 'info';
      case 'STUDENT':
        return 'success';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-gray-400">Manage your account information</p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit className="h-4 w-4" />}
            >
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <Card className="lg:col-span-1">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover border-2 border-emerald-500/20"
                  />
                ) : (
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20">
                    <User className="h-10 w-10 text-emerald-500" />
                  </div>
                )}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-1">{user?.username}</h2>
              <Badge variant={getRoleBadgeVariant(user?.role)} className="mb-4">
                {user?.role}
              </Badge>
              
              {!isEditing && (
                <div className="space-y-3 mt-6 text-left">
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm text-white break-all">{user?.email}</p>
                  </div>
                  
                  {user?.phone && (
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-sm text-white">{user.phone}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Edit/View Profile Form */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {isEditing ? 'Edit Profile' : 'Profile Information'}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {isEditing ? 'Update your personal information' : 'Your account details'}
                  </p>
                </div>
              </div>
              {isEditing && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      first_name: user?.first_name || '',
                      last_name: user?.last_name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      address: user?.address || '',
                    });
                    setPhotoPreview(user?.profile_photo ? `http://127.0.0.1:8000${user.profile_photo}` : null);
                    setProfilePhoto(null);
                  }}
                  leftIcon={<X className="h-4 w-4" />}
                >
                  Cancel
                </Button>
              )}
            </div>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-4 p-3 rounded-md flex items-center space-x-2 ${
                    message.includes('success')
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  {message.includes('success') && <CheckCircle className="h-4 w-4" />}
                  <span className="text-sm">{message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Username"
                    type="text"
                    value={user?.username}
                    disabled
                    icon={<User className="h-4 w-4" />}
                  />

                  <div className="w-full">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                      Role
                    </label>
                    <div className="flex items-center h-10 px-3 rounded-md bg-gray-900 border border-gray-800">
                      <Badge variant={getRoleBadgeVariant(user?.role)}>
                        {user?.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    type="text"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />

                  <Input
                    label="Last Name"
                    type="text"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  icon={<Mail className="h-4 w-4" />}
                />

                <Input
                  label="Phone"
                  type="text"
                  placeholder="1234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  icon={<Phone className="h-4 w-4" />}
                />

                <div className="w-full">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-2 pointer-events-none text-gray-500">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <textarea
                      className="block w-full rounded-md bg-gray-900 border border-gray-800 text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-200 pl-10 pr-3 py-2 text-sm"
                      placeholder="Enter your address"
                      rows="3"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Changes
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">First Name</p>
                    <p className="text-white">{user?.first_name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Last Name</p>
                    <p className="text-white">{user?.last_name || 'Not set'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-white">{user?.email}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-white">{user?.phone || 'Not set'}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Address</p>
                  <p className="text-white">{user?.address || 'Not set'}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
