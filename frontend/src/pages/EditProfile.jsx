import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Save, UserCog, Link as LinkIcon, Command, Plus, Send, Code } from 'lucide-react';

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    bio: '',
    github_url: '',
    linkedin_url: '',
    leetcode_url: '',
    availability_status: 'available',
    skills: '',
    avatar: null
  });
  
  const [pastProject, setPastProject] = useState({
    title: '', role: '', description: '', tech_stack: '', github_url: ''
  });
  const [addedProjects, setAddedProjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/${user.id}/profile`);
      if (res.data.success) {
        const { user: p, skills, past_projects } = res.data.data;
        setProfile({
          ...p,
          skills: skills ? skills.map(s => s.name).join(', ') : '',
          avatar: null
        });
        setAddedProjects(past_projects || []);
      }
    } catch (err) { }
  };

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handlePastProjectChange = (e) => setPastProject({ ...pastProject, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setProfile({ ...profile, avatar: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleAddProject = async () => {
    if (!pastProject.title || !pastProject.role) return;
    try {
      const payload = {
        title: pastProject.title,
        role: pastProject.role,
        description: pastProject.description,
        tech_stack: pastProject.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
        github_url: pastProject.github_url
      };
      const res = await api.post(`/users/${user.id}/past-projects`, payload);
      if (res.data.success) {
        setAddedProjects([...addedProjects, { ...payload, id: res.data.data.id }]);
        setPastProject({ title: '', role: '', description: '', tech_stack: '', github_url: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.put(`/users/${user.id}/profile`, {
        bio: profile.bio,
        github_url: profile.github_url,
        linkedin_url: profile.linkedin_url,
        leetcode_url: profile.leetcode_url,
        availability_status: profile.availability_status,
        avatar_base64: profile.avatar
      });

      const skillsArray = profile.skills.split(',').map(s => s.trim()).filter(s => s);
      await api.post(`/users/${user.id}/skills`, { skills: skillsArray });
      
      setMessage('Telemetry configuration saved securely.');
      setTimeout(() => navigate(`/profile/${user.id}`), 1000);
    } catch (err) {
      setMessage('Error updating metadata.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="mb-10 text-center flex flex-col items-center">
         <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-4 rounded-3xl border border-white/5 shadow-2xl mb-6">
           <UserCog className="h-10 w-10 text-indigo-400" />
         </div>
         <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">Configure Node Ident</h1>
         <p className="text-slate-400 mt-3 text-lg font-light max-w-xl">Update your telemetry and network protocols.</p>
      </motion.div>

      {message && (
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="mb-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl font-mono text-sm shadow-inner text-center">
          {message}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1, transition: { delay: 0.1 }}}>
          <Card className="shadow-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
            <CardHeader className="border-b border-white/5 pb-4 bg-slate-950/30">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <UserCog className="w-5 h-5 text-indigo-400" /> Identity Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-4 md:px-8 bg-slate-900/20">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 blur-sm opacity-50"></div>
                  {profile.avatar || profile.avatar_url ? (
                    <img src={profile.avatar || (profile.avatar_url?.startsWith('/uploads') ? `http://localhost:8000${profile.avatar_url}` : profile.avatar_url)} alt="Avatar" className="w-24 h-24 rounded-3xl object-cover border border-white/10 relative z-10" />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-slate-950 border border-indigo-500/30 flex items-center justify-center font-black text-4xl text-indigo-500/50 relative z-10">U</div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs">Visual Hash (Avatar)</Label>
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="bg-slate-950/50 border-white/10 text-white focus-visible:ring-indigo-500 transition-all hover:bg-slate-900/80 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs">Biography / Status Log</Label>
                <Textarea name="bio" value={profile.bio || ''} onChange={handleChange} placeholder="Transmit your background log..." className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 min-h-[120px] transition-all hover:bg-slate-900/80 rounded-xl" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs flex items-center gap-1"><LinkIcon className="w-3 h-3"/> GitHub Beacon</Label>
                  <Input name="github_url" value={profile.github_url || ''} onChange={handleChange} placeholder="https://github.com/your-handle" className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 h-12 transition-all hover:bg-slate-900/80 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs flex items-center gap-1"><LinkIcon className="w-3 h-3"/> LinkedIn Protocol</Label>
                  <Input name="linkedin_url" value={profile.linkedin_url || ''} onChange={handleChange} placeholder="https://linkedin.com/in/your-handle" className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 h-12 transition-all hover:bg-slate-900/80 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs flex items-center gap-1"><Code className="w-3 h-3"/> Leetcode</Label>
                  <Input name="leetcode_url" value={profile.leetcode_url || ''} onChange={handleChange} placeholder="https://leetcode.com/u/handle" className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 h-12 transition-all hover:bg-slate-900/80 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2 pb-2">
                <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs">Network Availability</Label>
                <select name="availability_status" value={profile.availability_status} onChange={handleChange} className="flex h-12 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 transition-all hover:bg-slate-900/80 outline-none">
                  <option value="available" className="bg-slate-900 text-emerald-400">Available for Dispatch</option>
                  <option value="busy" className="bg-slate-900 text-amber-400">Mission Active (Busy)</option>
                  <option value="not_looking" className="bg-slate-900 text-rose-400">Offline</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1, transition: { delay: 0.2 }}}>
          <Card className="shadow-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
            <CardHeader className="border-b border-white/5 pb-4 bg-slate-950/30">
               <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                 <Command className="w-5 h-5 text-violet-400" /> Hardware & Protocols
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-4 md:px-8 bg-slate-900/20">
               <div className="space-y-2">
                 <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs">Installed Protocols (CSV)</Label>
                 <Input name="skills" value={profile.skills || ''} onChange={handleChange} placeholder="React, Python, Ansible..." className="bg-slate-950/50 border-white/10 text-white focus-visible:ring-violet-500 h-12 transition-all hover:bg-slate-900/80 rounded-xl" />
                 <p className="text-xs text-slate-500 mt-2 font-mono">Used for project skill match metrics.</p>
               </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1, transition: { delay: 0.3 }}}>
          <Card className="shadow-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-emerald-500"></div>
            <CardHeader className="border-b border-white/5 pb-4 bg-slate-950/30 flex flex-row items-center justify-between">
               <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                 <Send className="w-5 h-5 text-cyan-400" /> Mission Log
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-4 md:px-8 bg-slate-900/20">
               {addedProjects.length > 0 && (
                 <div className="space-y-4 mb-6">
                   <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs">Transmitted Missions</Label>
                   <div className="space-y-3">
                     {addedProjects.map((p, idx) => (
                       <div key={idx} className="bg-slate-950/40 border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                         <div className="flex justify-between items-start">
                           <span className="font-bold text-white">{p.title}</span>
                           <span className="text-xs font-mono text-cyan-400 border border-cyan-500/30 px-2 py-1 bg-cyan-500/10 rounded">{p.role}</span>
                         </div>
                         <p className="text-sm text-slate-400 font-light">{p.description}</p>
                         <p className="text-xs text-slate-500 font-mono mt-1">Tech: {(Array.isArray(p.tech_stack) ? p.tech_stack : []).join(', ')}</p>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               <div className="border border-white/10 bg-slate-950/30 p-5 rounded-2xl relative shadow-inner space-y-4">
                 <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-600 tracking-widest uppercase">New Log Entry</div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <Label className="text-slate-400 text-xs">Mission Title</Label>
                     <Input name="title" value={pastProject.title} onChange={handlePastProjectChange} placeholder="E.g. Nexus Firewall" className="bg-slate-900/50 border-white/5 text-white h-10 text-sm" />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-slate-400 text-xs">Your Designation (Role)</Label>
                     <Input name="role" value={pastProject.role} onChange={handlePastProjectChange} placeholder="Lead Engineer" className="bg-slate-900/50 border-white/5 text-white h-10 text-sm" />
                   </div>
                   <div className="space-y-2 md:col-span-2">
                     <Label className="text-slate-400 text-xs">Tech Stack (CSV)</Label>
                     <Input name="tech_stack" value={pastProject.tech_stack} onChange={handlePastProjectChange} placeholder="React, Python, AWS" className="bg-slate-900/50 border-white/5 text-white h-10 text-sm" />
                   </div>
                   <div className="space-y-2 md:col-span-2">
                     <Label className="text-slate-400 text-xs">Mission Summary</Label>
                     <Textarea name="description" value={pastProject.description} onChange={handlePastProjectChange} placeholder="Summarize the objective..." className="bg-slate-900/50 border-white/5 text-white min-h-[80px] text-sm" />
                   </div>
                 </div>
                 
                 <Button type="button" onClick={handleAddProject} className="w-full h-12 mt-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-white/5">
                   <Plus className="w-4 h-4 mr-2" /> Add to Log
                 </Button>
               </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0, transition:{delay:0.3}}} className="flex justify-end gap-4 pb-12">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="h-14 px-8 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            Abort
          </Button>
          <Button type="submit" disabled={loading} className="h-14 px-10 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.7)] transition-all border-0 text-lg flex items-center gap-2">
            {loading ? 'Transmitting...' : <><Save className="w-5 h-5"/> Save Core</>}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
