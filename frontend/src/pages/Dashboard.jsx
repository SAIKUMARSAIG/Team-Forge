import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderPlus, Clock, ArrowRight, BellRing, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectsAndInvites = async () => {
      try {
        const [projRes, invRes] = await Promise.all([
          api.get('/projects'),
          api.get('/users/me/invitations')
        ]);
        if (projRes.data.success) {
          setProjects(projRes.data.data);
        }
        if (invRes.data?.success) {
          setInvitations(invRes.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectsAndInvites();
  }, []);

  const handleInviteResponse = async (id, action) => {
    try {
      await api.post(`/invitations/${id}/respond`, { action });
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      // Re-fetch projects if they accepted, so it appears in their forge list
      if (action === 'accept') {
        const projRes = await api.get('/projects');
        if (projRes.data.success) setProjects(projRes.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20 min-h-[50vh]">
      <div className="w-8 h-8 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">My Forges</h1>
          <p className="text-slate-400">Manage your active projects and build your teams.</p>
        </div>
        <Link to="/projects/new">
          <Button className="h-11 px-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all flex items-center gap-2 border-0">
            <FolderPlus className="h-5 w-5" /> Ignite New Forge
          </Button>
        </Link>
      </div>

      {invitations.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold tracking-tight text-white mb-4 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-400" /> Pending Mission Invites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitations.map(inv => (
              <Card key={inv.id} className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-white leading-tight">
                    {inv.project_title}
                  </CardTitle>
                  <CardDescription className="text-amber-400/80 font-semibold text-sm mt-1">
                    Role Needed: {inv.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-3 border-t border-white/5 pt-4">
                  <Button variant="outline" size="sm" onClick={() => handleInviteResponse(inv.id, 'decline')} className="flex-1 rounded-lg border-white/10 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400">
                    <X className="w-4 h-4 mr-2" /> Decline
                  </Button>
                  <Button size="sm" onClick={() => handleInviteResponse(inv.id, 'accept')} className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-[0_4px_15px_rgba(79,70,229,0.3)] border-0">
                    <Check className="w-4 h-4 mr-2" /> Accept
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="text-center py-24 bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
          <div className="bg-indigo-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FolderPlus className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Your forge is cold</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">Create your first project to start finding and recruiting intelligent matches for your tech team.</p>
          <Link to="/projects/new">
            <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white">Get Started</Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="block h-full outline-none">
              <motion.div variants={item} className="h-full">
                <Card className="h-full bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-300 group shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden">
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity blur-xl rounded-[2rem]" />
                  
                  <CardHeader className="flex-1 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className={`py-1 ${p.status === 'active' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-slate-500/30 text-slate-400 bg-slate-500/10'} uppercase tracking-wider text-[10px]`}>
                        {p.status}
                      </Badge>
                      <ArrowRight className="text-slate-600 group-hover:text-indigo-400 transition-colors w-5 h-5 -rotate-45 group-hover:rotate-0 duration-300" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-indigo-400 transition-colors line-clamp-1 mb-2">
                      {p.title}
                    </CardTitle>
                    <CardDescription className="text-slate-400 line-clamp-3 text-base font-light leading-relaxed">
                      {p.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 pb-6 border-t border-white/5 mt-4">
                    <div className="flex items-center text-sm font-medium text-slate-500 mt-4">
                      <Clock className="w-4 h-4 mr-2 text-indigo-400/70" />
                      Due: {new Date(p.deadline).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
}
