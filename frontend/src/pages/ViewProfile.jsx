import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Github, Linkedin, Briefcase, Mail, Sparkles, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ViewProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/${id}/profile`);
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) { }
    finally { setLoading(false); }
  };

  const isOwner = user?.id === parseInt(id);

  const getAvatar = (url) => url?.startsWith('/uploads') ? `http://localhost:8000${url}` : url;

  if (loading) return (
    <div className="flex items-center justify-center p-20 min-h-[50vh]">
      <div className="w-8 h-8 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
    </div>
  );
  if (!profile) return <div className="p-20 text-center text-slate-400">Node trace lost.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 relative z-10">
      <div className="absolute top-[20%] right-[-20%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0, transition:{duration:0.6}}}>
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden mb-8 relative">
          <div className="h-48 bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] mix-blend-overlay opacity-30"></div>
          </div>
          
          <div className="px-6 md:px-12 pb-10 flex flex-col sm:flex-row items-center sm:items-end -mt-20 gap-8 relative z-10">
            <div className="p-1.5 rounded-3xl bg-slate-950/80 backdrop-blur-md shadow-2xl relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400 to-indigo-500 opacity-30 blur-sm -z-10"></div>
              {profile.user.avatar_url ? (
                 <img src={getAvatar(profile.user.avatar_url)} alt="Profile" className="w-40 h-40 rounded-2xl object-cover border border-white/10" />
              ) : (
                 <div className="w-40 h-40 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-6xl text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-indigo-500 border border-white/5">
                   {profile.user.full_name?.charAt(0)}
                 </div>
              )}
            </div>
            
            <div className="flex-1 pb-2 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start w-full gap-4">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">{profile.user.full_name}</h1>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                     <span className="flex items-center gap-2 text-indigo-300 font-mono text-sm bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20"><Mail className="w-4 h-4" /> {profile.user.email}</span>
                     <Badge className={`px-3 py-1 text-xs tracking-widest font-bold uppercase ${profile.user.availability_status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                       {profile.user.availability_status.replace('_', ' ')}
                     </Badge>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link to={`/profile/${id}/analysis`}>
                    <Button variant="outline" className="bg-white/5 hover:bg-white/10 border-indigo-500/30 text-indigo-300 rounded-xl h-11 px-6 font-semibold shadow-[0_0_15px_rgba(79,70,229,0.2)] backdrop-blur-md transition-all">
                      Analysis Board
                    </Button>
                  </Link>
                  {isOwner && (
                    <Link to="/profile/edit">
                      <Button variant="outline" className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl h-11 px-6 font-semibold shadow-lg backdrop-blur-md transition-all">
                        Configure Ident
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-12 pb-12 pt-6 border-t border-white/5">
            <h3 className="text-sm uppercase tracking-widest font-black text-slate-500 mb-4 bg-slate-950 px-3 py-1 rounded-lg inline-block shadow-inner">Biography</h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg font-light max-w-3xl">
              {profile.user.bio || 'Node has not supplied initialization telemetry.'}
            </p>
            
            <div className="flex flex-wrap gap-4 mt-8">
              {profile.user.github_url && (
                <a href={profile.user.github_url} target="_blank" rel="noreferrer" className="flex items-center px-4 py-2 rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all border border-white/5 font-semibold group flex-1 sm:flex-none justify-center">
                   <Github className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform"/> GitHub
                </a>
              )}
              {profile.user.linkedin_url && (
                <a href={profile.user.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center px-4 py-2 rounded-xl bg-slate-800/50 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-all border border-white/5 font-semibold group flex-1 sm:flex-none justify-center">
                   <Linkedin className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform"/> LinkedIn
                </a>
              )}
              {profile.user.leetcode_url && (
                <a href={profile.user.leetcode_url} target="_blank" rel="noreferrer" className="flex items-center px-4 py-2 rounded-xl bg-slate-800/50 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 transition-all border border-white/5 font-semibold group flex-1 sm:flex-none justify-center">
                   <Terminal className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform"/> LeetCode
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0, transition:{delay:0.2}}}>
          <Card className="h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] -z-10 rounded-full"></div>
            <CardHeader className="border-b border-white/5 bg-slate-950/30">
               <CardTitle className="flex items-center gap-3 text-xl text-white font-bold tracking-tight">
                 <Terminal className="w-6 h-6 text-cyan-400" /> Competency Matrix
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 flex-1">
               <div className="flex flex-wrap gap-3">
                 {profile.skills?.length > 0 ? profile.skills.map(s => (
                   <span key={s.id} className="px-4 py-2 rounded-lg font-mono text-sm bg-slate-950 text-slate-300 border border-slate-700/50 shadow-inner group">
                     {s.name}
                   </span>
                 )) : <span className="text-slate-500 text-sm font-mono">NO PROTOCOLS INSTALLED</span>}
               </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0, transition:{delay:0.3}}}>
          <Card className="h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-32 h-32 bg-violet-500/10 blur-[50px] -z-10 rounded-full"></div>
            <CardHeader className="border-b border-white/5 bg-slate-950/30">
               <CardTitle className="flex items-center gap-3 text-xl text-white font-bold tracking-tight">
                 <Briefcase className="w-6 h-6 text-violet-400" /> Mission Log
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 flex-1">
               {profile.past_projects?.length > 0 ? (
                 <div className="space-y-6">
                   {profile.past_projects.map((p, idx) => (
                     <div key={p.id || idx} className="relative pl-6 py-2 border-l-2 border-white/10 hover:border-violet-500/50 transition-colors group">
                       <div className="absolute top-4 -left-[9px] w-4 h-4 bg-slate-950 border-2 border-violet-500/50 rounded-full group-hover:border-violet-400 group-hover:bg-violet-500/20 transition-all"></div>
                       <h4 className="font-bold text-lg text-white group-hover:text-violet-300 transition-colors">{p.title}</h4>
                       <p className="text-sm font-mono text-violet-400 mb-3">{p.role}</p>
                       <p className="text-[15px] font-light text-slate-400 leading-relaxed mb-4">{p.description}</p>
                       <div className="flex flex-wrap gap-2">
                         {Array.isArray(p.tech_stack) && p.tech_stack.map((tech, i) => (
                           <span key={i} className="text-xs font-mono px-2 py-1 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300">
                             {tech}
                           </span>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <span className="text-slate-500 text-sm font-mono">NO MISSION TELEMETRY</span>
               )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
