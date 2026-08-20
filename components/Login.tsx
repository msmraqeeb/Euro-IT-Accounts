
import React, { useState } from 'react';
import { User, UserRole, AppUser } from '../types';
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Footer } from './Footer';
import { dataService, DEFAULT_USERS } from '../services/dataService';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const users: AppUser[] = await dataService.getUsers();
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      // Find user
      const foundUser = users.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPass
      );

      if (foundUser) {
        onLogin({
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role
        });
      } else {
        // Fallback hardcoded super admin check in case of network issue
        const defUser = DEFAULT_USERS.find(
          (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPass
        );
        if (defUser) {
          onLogin({
            id: defUser.id,
            email: defUser.email,
            name: defUser.name,
            role: defUser.role
          });
        } else {
          setError('Invalid email or password. Please try again.');
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      // Fallback
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();
      const defUser = DEFAULT_USERS.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPass
      );
      if (defUser) {
        onLogin({
          id: defUser.id,
          email: defUser.email,
          name: defUser.name,
          role: defUser.role
        });
      } else {
        setError('Login failed. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <img 
            src="https://i.postimg.cc/59gXKDM0/Euro-IT-gold-Copy-1-06.png" 
            alt="Euro IT Logo" 
            className="h-20 w-auto object-contain" 
          />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Euro IT Accounts
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to access your business dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
