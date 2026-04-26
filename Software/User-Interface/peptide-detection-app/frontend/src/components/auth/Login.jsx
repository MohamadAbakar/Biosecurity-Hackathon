import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { YellowGlowBackground } from '../ui/background-components';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Signed in successfully');
    } catch (err) {
      toast.error(err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <YellowGlowBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm">

          {/* Brand mark */}
          <div className="text-center mb-7">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">PepTrace</h1>
            <p className="text-xs text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          {/* Card */}
          <div className="bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-card-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md
                             text-foreground placeholder:text-muted-foreground
                             focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
                             transition-shadow"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md
                             text-foreground placeholder:text-muted-foreground
                             focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
                             transition-shadow"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground text-sm font-medium
                           py-2 rounded-md hover:opacity-90 disabled:opacity-50
                           transition-opacity mt-1"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </YellowGlowBackground>
  );
};

export default Login;
