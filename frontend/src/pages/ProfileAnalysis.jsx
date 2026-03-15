import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Terminal, ArrowLeft, Loader2, GitCommit, GitPullRequest, LayoutDashboard } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const CircularProgress = ({ easy, medium, hard, total, bgLabel }) => {
  const unsolved = Math.max(0, total - easy - medium - hard);
  const data = [
    { name: 'Unsolved', value: unsolved, color: 'transparent' },
    { name: 'Easy', value: easy, color: '#10b981' },
    { name: 'Medium', value: medium, color: '#eab308' },
    { name: 'Hard', value: hard, color: '#ef4444' }
  ];

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative flex items-center justify-center w-48 h-48 drop-shadow-lg">
        {/* Full background base ring */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle cx="96" cy="96" r="79" stroke="#1e293b" strokeWidth="8" fill="transparent" />
        </svg>

        {/* Foreground dynamic arcs */}
        <ResponsiveContainer width="100%" height="100%" className="relative z-10">
          <PieChart>
            <Pie
              data={data}
              innerRadius={75}
              outerRadius={83}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              startAngle={90}
              endAngle={-270}
              cornerRadius={10}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute flex flex-col items-center justify-center z-20">
          <span className="text-4xl font-bold text-white tracking-widest leading-tight">{easy + medium + hard}</span>
          <span className="text-base font-medium text-slate-400 tracking-wider -mt-1">{bgLabel}</span>
        </div>
      </div>
      
      <div className="flex justify-center gap-8 mt-6 w-full">
        <div className="flex items-center gap-2">
           <span className="text-slate-400 font-medium text-sm">Easy</span>
           <span className="text-white font-bold">{easy}</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-slate-400 font-medium text-sm">Medium</span>
           <span className="text-white font-bold">{medium}</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-slate-400 font-medium text-sm">Hard</span>
           <span className="text-white font-bold">{hard}</span>
        </div>
      </div>
    </div>
  );
};

export default function ProfileAnalysis() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [lcStats, setLcStats] = useState(null);
  const [lcLoading, setLcLoading] = useState(false);
  const [ghStats, setGhStats] = useState(null);
  const [ghLoading, setGhLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/${id}/profile`);
      if (res.data.success) {
        setProfile(res.data.data);
        if (res.data.data.user.leetcode_url) fetchLeetcode(res.data.data.user.leetcode_url);
        if (res.data.data.user.github_url) fetchGithub(res.data.data.user.github_url);
      }
    } catch (err) {} 
    finally { setLoading(false); }
  };

  const extractUsername = (url) => {
    if (!url) return null;
    try {
       const parts = url.replace(/\/$/, '').split('/');
       return parts[parts.length - 1];
    } catch { return null; }
  };

  const fetchLeetcode = async (url) => {
    const username = extractUsername(url);
    if (!username) return;
    setLcLoading(true);
    try {
      // Using public proxy for Leetcode Stats
      const res = await fetch(`https://leetcode-stats.tashif.codes/${username}`);
      const data = await res.json();
      if (data.status === 'success') {
         setLcStats(data);
      }
    } catch (err) { console.error('LC Error', err); }
    finally { setLcLoading(false); }
  };

  const fetchGithub = async (url) => {
    const username = extractUsername(url);
    if (!username) return;
    setGhLoading(true);
    try {
      const res = await fetch(`https://api.github.com/users/${username}`);
      const data = await res.json();
      setGhStats(data);
    } catch (err) { console.error('GH Error', err); }
    finally { setGhLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20 min-h-[50vh]">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
    </div>
  );
  if (!profile) return <div className="p-20 text-center text-slate-400">Node trace lost.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative z-10 w-full">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-4">
           <Link to={`/profile/${id}`}>
             <Button variant="ghost" className="rounded-full w-12 h-12 p-0 hover:bg-white/10 text-white">
               <ArrowLeft className="w-6 h-6" />
             </Button>
           </Link>
           <h1 className="text-3xl font-black text-white tracking-tight">Diagnostics & Analysis</h1>
         </div>
         <Link to="/dashboard">
           <Button className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-xl">
             <LayoutDashboard className="w-4 h-4 mr-2" /> Global Dashboard
           </Button>
         </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEETCODE TERMINAL */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0, transition:{duration:0.4}}}>
          <Card className="h-full bg-[#0b0f19] border border-white/5 shadow-2xl overflow-hidden relative group">
            <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-3 font-semibold">
                 <Terminal className="text-amber-500 w-5 h-5" /> DSA Progress
              </CardTitle>
              <div className="flex bg-[#0f1524] rounded-lg p-1 border border-white/5 shadow-inner">
                <div className="px-4 py-1.5 text-xs font-semibold text-amber-500 rounded bg-[#1e293b]/50 border border-amber-500/20 shadow-md">LeetCode</div>
              </div>
            </CardHeader>
            <CardContent className="pt-10 pb-8 relative z-10 flex flex-col items-center justify-center min-h-[300px]">
               {lcLoading ? (
                 <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
               ) : lcStats ? (
                 <CircularProgress 
                   easy={lcStats.easySolved} 
                   medium={lcStats.mediumSolved} 
                   hard={lcStats.hardSolved} 
                   total={lcStats.totalQuestions}
                   bgLabel={lcStats.totalQuestions}
                 />
               ) : (
                 <div className="text-center">
                   <p className="text-slate-500 mb-4 font-mono">No LeetCode telemetry available.</p>
                   {profile.user.leetcode_url ? (
                      <p className="text-rose-400 text-sm bg-rose-500/10 p-2 rounded">CORS block or invalid username.</p>
                   ) : (
                     <Link to="/profile/edit">
                       <Button variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/5 hover:bg-amber-500/20">Link Protocol</Button>
                     </Link>
                   )}
                 </div>
               )}
            </CardContent>
          </Card>
        </motion.div>

        {/* GITHUB TERMINAL */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0, transition:{duration:0.5}}}>
          <Card className="h-full bg-[#0b0f19] border border-white/5 shadow-2xl overflow-hidden relative group">
            <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-3 font-semibold">
                 <Github className="text-indigo-400 w-5 h-5" /> Repositories & Commits
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 relative z-10 flex flex-col min-h-[300px]">
               {ghLoading ? (
                 <div className="flex-1 flex items-center justify-center">
                   <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                 </div>
               ) : ghStats && ghStats.login ? (
                 <div className="space-y-6 w-full">
                    <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                      <img src={ghStats.avatar_url} alt="GH Avatar" className="w-16 h-16 rounded-full border-2 border-indigo-500/50" />
                      <div>
                        <h3 className="text-xl font-bold text-white">{ghStats.name || ghStats.login}</h3>
                        <a href={ghStats.html_url} target="_blank" rel="noreferrer" className="text-sm font-mono text-indigo-400 hover:text-indigo-300">@{ghStats.login}</a>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between group-hover:border-indigo-500/30 transition-colors">
                        <div>
                          <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Public Repos</p>
                          <p className="text-3xl font-black text-white">{ghStats.public_repos}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                           <LayoutDashboard className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between group-hover:border-indigo-500/30 transition-colors">
                        <div>
                          <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Followers</p>
                          <p className="text-3xl font-black text-white">{ghStats.followers}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                           <GitPullRequest className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {ghStats.bio && (
                       <p className="text-sm text-slate-400 font-light border-l-2 border-indigo-500/50 pl-3 italic">"{ghStats.bio}"</p>
                    )}
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center">
                   <p className="text-slate-500 mb-4 font-mono">No GitHub telemetry available.</p>
                   {profile.user.github_url ? (
                      <p className="text-rose-400 text-sm bg-rose-500/10 p-2 rounded">Invalid username or rate limit.</p>
                   ) : (
                     <Link to="/profile/edit">
                       <Button variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/20">Link Protocol</Button>
                     </Link>
                   )}
                 </div>
               )}
            </CardContent>
          </Card>
        </motion.div>
        
      </div>
    </div>
  );
}
