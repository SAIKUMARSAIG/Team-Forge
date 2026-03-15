import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Users, Clock, Settings, ArrowRight, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [members, setMembers] = useState([]);
  const [jobStatus, setJobStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.data.project);
        setRequirements(res.data.data.requirements || []);
        setMembers(res.data.data.members || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAI = async () => {
    try {
      setJobStatus('running');
      const res = await api.post(`/projects/${id}/publish`);
      if (res.data.success) {
        setJobStatus('completed');
        navigate(`/projects/${id}/suggestions`);
      }
    } catch (err) {
      setJobStatus(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20 min-h-[50vh]">
      <div className="w-8 h-8 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
    </div>
  );
  if (!project) return <div className="p-20 text-center text-slate-400">Project not found</div>;

  const isOwner = user?.id === project.owner_id;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
        <div className="flex-1">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
            <Badge className="mb-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20">
              {project.status.toUpperCase()}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4 tracking-tight">
              {project.title}
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl leading-relaxed font-light">{project.description}</p>
          </motion.div>
        </div>
        
        {isOwner && (
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="flex flex-col gap-4 w-full md:w-auto mt-4 md:mt-0">
            <Button 
              size="lg"
              onClick={triggerAI} 
              disabled={jobStatus === 'running'} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all relative overflow-hidden group h-14 rounded-2xl border-0"
            >
              {jobStatus === 'running' && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-50 animate-pulse"></div>
              )}
              <span className="flex items-center gap-2 relative z-10 font-bold text-lg">
                <Users className={`h-5 w-5 ${jobStatus === 'running' ? 'animate-bounce' : ''}`} />
                {jobStatus === 'running' ? 'Finding Matches...' : 'Find Matches'}
              </span>
            </Button>
            
            <Link to={`/projects/${id}/suggestions`} className="block w-full">
              <Button size="lg" variant="outline" className="w-full bg-slate-900/50 backdrop-blur-md hover:bg-slate-800 border-white/10 text-slate-300 h-14 rounded-2xl font-semibold">
                View Suggestions <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0, transition:{delay:0.1}}} className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
             <Target className="text-cyan-400 h-6 w-6"/> Team Blueprints
          </h3>
          <div className="space-y-4">
            {requirements.map(req => (
              <Card key={req.id} className="bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-lg relative overflow-hidden group">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-xl text-white tracking-tight mb-3">{req.role_title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {req.required_skills?.map(s => (
                          <span key={s} className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 tracking-wider">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      {req.is_filled ? 
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 text-xs tracking-wider">SECURED</Badge> : 
                        <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 text-xs tracking-wider">OPEN SLOT</Badge>
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
        
        <div className="space-y-8">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0, transition:{delay:0.2}}}>
            <Card className="bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-lg">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg font-bold text-white tracking-tight">Project Metadata</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3">
                    <Settings className="h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-slate-300 font-medium">Domain: <span className="text-white ml-1">{project.domain}</span></span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3">
                    <Clock className="h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-slate-300 font-medium">Deadline: <span className="text-white ml-1">{new Date(project.deadline).toLocaleDateString()}</span></span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0, transition:{delay:0.3}}}>
            <Card className="bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-lg">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" /> Current Team
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {members.length === 0 ? (
                  <div className="text-sm text-slate-500 font-medium p-4 bg-slate-800/50 rounded-lg text-center border border-slate-700/50 border-dashed">
                    No members connected. Find matching profiles to invite members!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map(m => (
                      <div key={m.id} className="flex flex-col p-3 border border-white/5 rounded-xl bg-slate-800/30 hover:bg-slate-800/70 transition-colors group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-300 group-hover:text-white transition-colors text-sm">{m.role}</span>
                          <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm ${m.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {m.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
