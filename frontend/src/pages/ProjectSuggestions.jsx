import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, UserPlus, FileSearch, X, Check, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectSuggestions() {
  const { id } = useParams();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, [id]);

  const fetchSuggestions = async () => {
    try {
      const res = await api.get(`/projects/${id}/suggestions`);
      if (res.data.success) {
        setSuggestions(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSuggestion = async (sid, action) => {
    try {
      await api.put(`/projects/${id}/suggestions/${sid}`, { action });
      fetchSuggestions();
    } catch (err) { }
  };

  const inviteUser = async (user_id) => {
    try {
      await api.post(`/projects/${id}/invite/${user_id}`);
      alert("Invitation dispatched to user!");
    } catch (err) { }
  };

  const getScoreColor = (score) => {
    if (score > 0.75) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score > 0.5)  return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getScorePercentage = (score) => {
    return Math.round(score * 100) + '%';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      <div className="absolute top-0 right-[-100px] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} className="mb-8">
        <Link to={`/projects/${id}`} className="text-slate-400 hover:text-white flex items-center gap-2 mb-8 transition-colors text-sm font-semibold tracking-wide uppercase">
          <ArrowLeft className="h-4 w-4" /> Return to Blueprint
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 p-3 rounded-2xl border border-white/5 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
            <Users className="h-8 w-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">Suggested Candidates</h1>
            <p className="text-slate-400 text-lg mt-1 font-light">Profiles matching project skill requirements.</p>
          </div>
        </div>
      </motion.div>

      {suggestions.length === 0 ? (
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="text-center py-24 bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-slate-500/5 rounded-full blur-[80px]" />
          <FileSearch className="h-12 w-12 text-slate-500 outline-none mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-3">No profiles detected</h3>
          <p className="text-slate-400 max-w-md mx-auto">Use "Find Matches" from the Blueprint page to begin scanning the network for skill matches.</p>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {suggestions.map(s => (
            <motion.div variants={item} key={s.id}>
              <Card className="h-full bg-slate-900/60 backdrop-blur-md border-white/10 hover:bg-slate-800/80 transition-all duration-300 flex flex-col relative overflow-hidden group shadow-lg">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      {s.user?.avatar_url ? (
                        <img src={s.user.avatar_url?.startsWith('/uploads') ? `http://localhost:8000${s.user.avatar_url}` : s.user.avatar_url} alt="avatar" className="w-14 h-14 rounded-2xl border border-white/10 shadow-lg object-cover" />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300 rounded-2xl flex items-center justify-center font-black text-xl border border-indigo-500/20 shadow-inner">
                          {s.user?.full_name?.charAt(0) || 'Ø'}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-xl font-bold">
                          <Link to={`/profile/${s.user_id}`} className="text-white hover:text-cyan-400 transition-colors">
                            {s.user?.full_name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-indigo-300/80 mt-1 font-semibold text-sm tracking-wide">
                          Target: {s.role_title}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={`ml-2 text-sm font-black shadow-lg py-1 px-3 ${getScoreColor(s.match_score)}`}>
                      {getScorePercentage(s.match_score)} MATCH
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 relative z-10 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 mb-6 uppercase">
                    Status <Badge variant="outline" className="ml-2 border-slate-600 text-slate-300 bg-slate-800/50">{s.status.replace('_', ' ')}</Badge>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-between h-12 bg-slate-950/50 border-white/10 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300 group transition-all rounded-xl">
                        <span className="flex items-center gap-2 font-semibold">
                          <FileSearch className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" /> 
                          View Match Details
                        </span>
                        <span className="text-xs font-mono text-slate-500 group-hover:text-indigo-400">READ</span>
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="bg-slate-900 border border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.2)] text-white sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                          <FileSearch className="h-5 w-5 text-indigo-400" />
                          Match Reasoning
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Why this user is recommended for {s.role_title}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 bg-slate-950/80 p-5 rounded-2xl border border-white/5 text-sm text-slate-300 leading-relaxed max-h-96 overflow-y-auto font-mono">
                         <span className="text-indigo-400">&gt; MATCHING SKILLS...</span><br/><br/>
                         {s.reasoning}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>

                <CardFooter className="pt-4 border-t border-white/5 flex gap-3 relative z-10 bg-slate-950/20">
                  {s.status === 'pending_review' && (
                    <>
                      <Button variant="outline" className="flex-1 h-12 rounded-xl bg-slate-950/50 hover:bg-rose-500/10 hover:text-rose-400 border-white/10 hover:border-rose-500/30 transition-all text-slate-400 font-semibold" onClick={() => updateSuggestion(s.id, 'reject')}>
                        <X className="h-4 w-4 mr-2" /> Pass
                      </Button>
                      <Button className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all font-semibold" onClick={() => updateSuggestion(s.id, 'shortlist')}>
                        <Check className="h-4 w-4 mr-2" /> Shortlist
                      </Button>
                    </>
                  )}
                  {s.status === 'shortlisted' && (
                    <Button className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] font-semibold text-md transition-all border-0" onClick={() => inviteUser(s.user_id)}>
                      <UserPlus className="h-5 w-5 mr-2" /> Transmit Invite
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
