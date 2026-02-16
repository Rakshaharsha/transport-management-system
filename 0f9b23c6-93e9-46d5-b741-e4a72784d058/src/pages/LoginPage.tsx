import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Bus, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const user = await login(email);
      if (user.role === 'admin') navigate('/admin');else
      if (user.role === 'driver') navigate('/driver');else
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Try admin@transport.com');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95
        }}
        animate={{
          opacity: 1,
          scale: 1
        }}
        transition={{
          duration: 0.3
        }}
        className="w-full max-w-md relative z-10">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Bus className="h-6 w-6 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
            Transport<span className="text-emerald-500">OS</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Enter your credentials to access the command center
          </p>
        </div>

        <Card className="border-gray-800 bg-gray-900/80 backdrop-blur-sm shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@transport.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              required
              autoFocus />


            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              required />


            {error &&
            <motion.div
              initial={{
                opacity: 0,
                y: -10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">

                {error}
              </motion.div>
            }

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}>

              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs text-center text-gray-500">Demo Accounts:</p>
            <div className="mt-2 flex justify-center gap-2">
              <button
                onClick={() => setEmail('admin@transport.com')}
                className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">

                Admin
              </button>
              <button
                onClick={() => setEmail('driver@transport.com')}
                className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">

                Driver
              </button>
              <button
                onClick={() => setEmail('student@transport.com')}
                className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">

                Student
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>);

}