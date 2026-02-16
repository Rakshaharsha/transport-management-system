import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Bus,
  Users,
  LogOut,
  Bell,
  Settings,
  Menu,
  X,
  MapPin,
  FileText } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
interface LayoutProps {
  children: React.ReactNode;
}
export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
        {
          name: 'Overview',
          path: '/admin',
          icon: LayoutDashboard
        },
        {
          name: 'Fleet',
          path: '/admin/fleet',
          icon: Bus
        },
        {
          name: 'Drivers',
          path: '/admin/drivers',
          icon: Users
        },
        {
          name: 'Salary',
          path: '/admin/salary',
          icon: FileText
        }];

      case 'driver':
        return [
        {
          name: 'My Route',
          path: '/driver',
          icon: MapPin
        },
        {
          name: 'Schedule',
          path: '/driver/schedule',
          icon: FileText
        }];

      case 'user':
        return [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard
        },
        {
          name: 'Bus Status',
          path: '/dashboard/status',
          icon: Bus
        }];

      default:
        return [];
    }
  };
  const navItems = getNavItems();
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>

              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Bus className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="text-lg font-bold tracking-tight hidden md:inline-block">
                Transport<span className="text-emerald-500">OS</span>
              </span>
            </div>

            {/* Breadcrumbs / Page Title */}
            <div className="hidden md:flex items-center ml-6 pl-6 border-l border-gray-800">
              <span className="text-sm text-gray-400">
                {navItems.find((i) => i.path === location.pathname)?.name ||
                'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-white relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-gray-950" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-medium text-gray-300">
              {user?.name.charAt(0)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="hidden md:flex">

              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex w-64 flex-col border-r border-gray-800 bg-gray-950/50">
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                    ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'}
                  `}>

                  <item.icon
                    className={`mr-3 h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-gray-500'}`} />

                  {item.name}
                </Link>);

            })}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <div className="rounded-md bg-gray-900 p-3 border border-gray-800">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                System Status
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                All Systems Operational
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen &&
          <motion.div
            initial={{
              opacity: 0,
              x: -280
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            exit={{
              opacity: 0,
              x: -280
            }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-950 border-r border-gray-800 p-4 md:hidden">

              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) =>
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-md
                      ${location.pathname === item.path ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:bg-gray-900'}
                    `}>

                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Link>
              )}
                <button
                onClick={logout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-900 rounded-md mt-4">

                  <LogOut className="mr-3 h-4 w-4" />
                  Logout
                </button>
              </nav>
            </motion.div>
          }
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 relative">
          <div className="absolute inset-0 grid-bg pointer-events-none opacity-[0.3]" />
          <div className="relative z-10 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  y: -10
                }}
                transition={{
                  duration: 0.2
                }}>

                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>);

}