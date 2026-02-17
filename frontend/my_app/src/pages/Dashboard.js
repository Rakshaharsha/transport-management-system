import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import DriverDashboard from './DriverDashboard';
import UserDashboard from './UserDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'DRIVER':
      return <DriverDashboard />;
    case 'TEACHER':
    case 'STUDENT':
      return <UserDashboard />;
    default:
      return <div>Invalid role</div>;
  }
};

export default Dashboard;
