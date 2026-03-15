import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Hammer, Plus, Shield, Network } from 'lucide-react';

export default function CreateProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    deadline: '',
    roles: [{ role_title: '', required_skills: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleChange = (index, field, value) => {
    const roles = [...formData.roles];
    roles[index][field] = value;
    setFormData({ ...formData, roles });
  };

  const addRole = () => setFormData({ ...formData, roles: [...formData.roles, { role_title: '', required_skills: '' }] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        requirements: formData.roles.map(r => ({
          role_title: r.role_title,
          required_skills: r.required_skills.split(',').map(s => s.trim()).filter(Boolean)
        }))
      };
      
      const res = await api.post('/projects', payload);
      if (res.data.success) {
        navigate(`/projects/${res.data.data.id}`);
      } else {
        setError(res.data.error || 'Ignition sequence failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'System anomaly detected');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="mb-10 text-center flex flex-col items-center">
        <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-4 rounded-3xl border border-white/5 shadow-2xl mb-6">
          <Hammer className="h-10 w-10 text-indigo-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">Ignite New Forge</h1>
        <p className="text-slate-400 mt-3 text-lg font-light max-w-xl">Configure your project metadata and define the blueprint for your required team nodes.</p>
      </motion.div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1, transition: { delay: 0.1 }}}>
          <Card className="shadow-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
            <CardHeader className="border-b border-white/5 pb-4 bg-slate-950/30">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" /> Core Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-4 md:px-8">
              {error && <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl font-mono text-sm shadow-inner">{error}</div>}
              
              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs">Project Title</Label>
                <Input name="title" value={formData.title} onChange={handleChange} required placeholder="E.g. Nexus Core Migration" className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 h-12 transition-all hover:bg-slate-900/80 rounded-xl" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs">Mission Brief</Label>
                <Textarea name="description" value={formData.description} onChange={handleChange} required placeholder="What are the coordinates of this mission?" className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 min-h-[120px] transition-all hover:bg-slate-900/80 rounded-xl" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs">Sector / Domain</Label>
                  <Input name="domain" value={formData.domain} onChange={handleChange} required placeholder="E.g. Cybersecurity, Web3" className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 h-12 transition-all hover:bg-slate-900/80 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs">Target Deadline</Label>
                  <Input name="deadline" type="date" value={formData.deadline} onChange={handleChange} required className="bg-slate-950/50 border-white/10 text-slate-300 focus-visible:ring-indigo-500 h-12 transition-all hover:bg-slate-900/80 rounded-xl color-scheme-dark" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1, transition: { delay: 0.2 }}}>
          <Card className="shadow-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
            <CardHeader className="border-b border-white/5 pb-4 bg-slate-950/30">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Network className="w-5 h-5 text-violet-400" /> Network Roles
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addRole} className="bg-slate-800/50 border-white/10 text-indigo-300 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all rounded-lg h-10 px-4">
                  <Plus className="w-4 h-4 mr-2" /> Add Node
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-4 md:px-8 bg-slate-900/20">
              {formData.roles.map((role, idx) => (
                <div key={idx} className="p-6 border border-white/5 rounded-2xl bg-slate-950/40 relative group hover:border-white/10 transition-colors shadow-inner">
                  <div className="absolute top-4 right-6 text-xs font-mono text-slate-600 font-bold group-hover:text-violet-500/50 transition-colors">NODE 0{idx+1}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs">Role Title</Label>
                      <Input value={role.role_title} onChange={(e) => handleRoleChange(idx, 'role_title', e.target.value)} placeholder="e.g. Protocol Engineer" required className="bg-slate-900/80 border-white/5 text-white placeholder:text-slate-600 focus-visible:ring-violet-500 h-12 transition-all hover:bg-slate-800/80 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-semibold uppercase tracking-wider text-xs">Required Protocols (CSV)</Label>
                      <Input value={role.required_skills} onChange={(e) => handleRoleChange(idx, 'required_skills', e.target.value)} placeholder="Rust, Solidity, React" required className="bg-slate-900/80 border-white/5 text-white placeholder:text-slate-600 focus-visible:ring-violet-500 h-12 transition-all hover:bg-slate-800/80 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0, transition:{delay:0.3}}} className="flex justify-end gap-4 pb-12">
          <Button type="button" variant="ghost" onClick={() => navigate('/dashboard')} className="h-14 px-8 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            Abort
          </Button>
          <Button type="submit" className="h-14 px-10 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.7)] transition-all border-0 text-lg" disabled={loading}>
            {loading ? 'Executing...' : 'Initialize Forge'}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
