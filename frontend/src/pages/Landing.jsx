import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Sparkles, Target, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] relative z-10 w-full">
      {/* Hero Section */}
      <section className="flex-1 flex w-full flex-col justify-center items-center px-4 py-24 text-center">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto flex flex-col items-center">
          
          <motion.div variants={itemVariants} className="inline-flex items-center rounded-full border border-indigo-500/30 px-5 py-2 mb-8 text-sm bg-indigo-500/10 backdrop-blur-sm shadow-[0_0_20px_rgba(79,70,229,0.15)]">
            <Sparkles className="h-4 w-4 mr-2 text-indigo-400" />
            <span className="text-indigo-200 font-medium tracking-wide">Intelligent matchmaking engine</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[1.1] mb-8 drop-shadow-md">
            Forge Your <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 drop-shadow-[0_0_30px_rgba(79,70,229,0.3)]">Dream Team</span> Faster.
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-2xl text-slate-400 max-w-3xl mb-12 leading-relaxed font-light">
            Stop guessing who to work with. TeamForge analyzes skills, experience, and peer ratings to scout the perfect engineering peers for your next big vision.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5">
            <Link to="/register">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_30px_rgba(79,70,229,0.8)] transition-all hover:-translate-y-1 border-0">
                Start Building <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold rounded-full bg-slate-900/50 backdrop-blur-md hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-t border-white/5 bg-slate-950/40 backdrop-blur-sm relative z-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">How it works</h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">Three simple steps stringing together advanced AI workflows behind the scenes.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-slate-900/60 p-8 rounded-[2rem] border border-white/10 hover:bg-slate-800/60 transition-colors group shadow-lg"
            >
              <div className="bg-cyan-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="text-cyan-400 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-200 group-hover:text-cyan-400 transition-colors">1. Define Roles</h3>
              <p className="text-slate-400 leading-relaxed">Post your project idea and specify the exact skills and roles you need filled to succeed.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bg-slate-900/60 p-8 rounded-[2rem] border border-white/10 hover:bg-slate-800/60 transition-colors group shadow-[0_0_30px_rgba(79,70,229,0.1)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[50px] pointer-events-none" />
              <div className="bg-indigo-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-indigo-400 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-200 group-hover:text-indigo-400 transition-colors">2. AI Suggestions</h3>
              <p className="text-slate-400 leading-relaxed">Our N8N agent continuously scores and shortlists the best community profiles for your exact roles.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="bg-slate-900/60 p-8 rounded-[2rem] border border-white/10 hover:bg-slate-800/60 transition-colors group shadow-lg"
            >
              <div className="bg-violet-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="text-violet-400 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-200 group-hover:text-violet-400 transition-colors">3. Assemble</h3>
              <p className="text-slate-400 leading-relaxed">Review the AI reasoning logic, send invitations with a click, and launch your project.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
