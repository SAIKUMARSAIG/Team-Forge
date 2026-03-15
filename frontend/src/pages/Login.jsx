import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.user, res.data.access_token);
        navigate('/dashboard');
      } else {
        setError(res.data.error || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-violet-500 opacity-20 blur-xl"></div>
        <Card className="relative shadow-2xl border-white/10 bg-slate-900/60 backdrop-blur-2xl rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500"></div>
          
          <CardHeader className="space-y-3 text-center pt-10 pb-6">
            <div className="mx-auto w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-2">
               <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-white">Welcome back</CardTitle>
            <CardDescription className="text-slate-400 text-base">Enter your credentials to access TeamForge</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-8">
              {error && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm font-medium">
                  {error}
                </motion.div>
              )}
              
              <div className="space-y-2 relative group">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 h-12 transition-all hover:bg-slate-900/80"
                  required
                />
              </div>

              <div className="space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 h-12 transition-all hover:bg-slate-900/80"
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 px-8 pb-10 pt-4">
              <Button 
                className="w-full h-12 text-md font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all rounded-xl" 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Sign in'}
              </Button>
              <div className="text-sm text-center text-slate-400 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
