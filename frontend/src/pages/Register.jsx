import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        navigate('/login');
      } else {
        setError(res.data.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-500 opacity-20 blur-xl"></div>
        <Card className="relative shadow-2xl border-white/10 bg-slate-900/60 backdrop-blur-2xl rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 via-indigo-500 to-cyan-500"></div>
          
          <CardHeader className="space-y-3 text-center pt-8 pb-5">
            <CardTitle className="text-3xl font-black tracking-tight text-white mb-2">Create Account</CardTitle>
            <CardDescription className="text-slate-400 text-base">Join the network to forge your dream team</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-8">
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm font-medium">
                  {error}
                </motion.div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-slate-300">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 h-12 transition-all hover:bg-slate-900/80"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 h-12 transition-all hover:bg-slate-900/80"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </Button>
              <div className="text-sm text-center text-slate-400 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                  Log in here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
