import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import ProjectDetail from './pages/ProjectDetail';
import ProjectSuggestions from './pages/ProjectSuggestions';
import EditProfile from './pages/EditProfile';
import ViewProfile from './pages/ViewProfile';
import ProfileAnalysis from './pages/ProfileAnalysis';

// Protective Wrapper
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative min-h-screen flex flex-col font-sans text-slate-100 overflow-x-hidden selection:bg-indigo-500/30">
          {/* Ambient Background Glows */}
          <div className="fixed inset-0 pointer-events-none -z-10 bg-[#030712]">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/15 blur-[120px]" />
            <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px]" />
          </div>

          <Navbar />
          <main className="flex-1 w-full flex flex-col items-center">
            <div className="w-full h-full flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/projects/new" element={<PrivateRoute><CreateProject /></PrivateRoute>} />
                <Route path="/projects/:id" element={<PrivateRoute><ProjectDetail /></PrivateRoute>} />
                <Route path="/projects/:id/suggestions" element={<PrivateRoute><ProjectSuggestions /></PrivateRoute>} />
                <Route path="/profile/edit" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
                <Route path="/profile/:id" element={<PrivateRoute><ViewProfile /></PrivateRoute>} />
                <Route path="/profile/:id/analysis" element={<PrivateRoute><ProfileAnalysis /></PrivateRoute>} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
