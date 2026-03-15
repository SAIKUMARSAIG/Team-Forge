import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, User as UserIcon, LayoutDashboard, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030712]/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex">
            <Link to="/" className="flex flex-shrink-0 items-center gap-3 group">
              <img src="/logo.svg" alt="logo" className="h-9 w-9 group-hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.8)] transition-all duration-300" />
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                TeamForge
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-white/5 text-slate-300 hover:text-white transition-colors">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-400" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/projects/new">
                  <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-white/5 text-slate-300 hover:text-white transition-colors">
                    <PlusCircle className="mr-2 h-4 w-4 text-cyan-400" />
                    New Project
                  </Button>
                </Link>
                <div className="h-6 w-px bg-white/10 hidden sm:block mx-2"></div>
                <Link to={`/profile/${user.id}`}>
                  <Button variant="ghost" size="sm" className="hover:bg-white/5 text-slate-300 hover:text-white">
                    <UserIcon className="h-4 w-4 sm:mr-2 text-violet-400" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="border-white/10 hover:bg-white/5 text-slate-300 hover:text-white">
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="hover:bg-white/5 text-slate-300 hover:text-white transition-colors">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.6)] border-0">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
