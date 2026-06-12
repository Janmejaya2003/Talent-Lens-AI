import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, Github, Search, Loader2, AlertCircle } from 'lucide-react';
import { signInWithGithub, signInWithGoogle } from '../lib/authService';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, type: initialType }: AuthModalProps) {
  const [type, setType] = useState(initialType);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: role,
            },
          },
        });
        if (error) throw error;
        alert('Verification email sent! Please check your inbox.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    setLoading(true);
    setError(null);
    try {
      if (provider === 'github') {
        await signInWithGithub();
      } else {
        await signInWithGoogle();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100"
          >
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {type === 'login' ? 'Welcome back' : 'Create account'}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    {type === 'login' ? 'Enter your credentials to access your account' : 'Start your free trial today'}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {type === 'signup' && (
                  <>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Full Name" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent transition-all text-sm text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-2">
                       <button 
                         type="button"
                         onClick={() => setRole('candidate')}
                         className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${role === 'candidate' ? 'bg-accent/10 border-accent text-accent' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                       >
                         I'm a Candidate
                       </button>
                       <button 
                         type="button"
                         onClick={() => setRole('recruiter')}
                         className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${role === 'recruiter' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                       >
                         I'm a Recruiter
                       </button>
                    </div>
                  </>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-accent text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-accent/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {type === 'login' ? 'Sign in' : 'Create account'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-xs text-slate-400 uppercase font-bold"><span className="bg-white px-4">or continue with</span></div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  disabled={loading}
                  className="flex-1 w-full flex items-center justify-center gap-3 px-6 py-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm active:scale-[0.98] transition-all font-bold text-sm text-slate-700 min-h-[48px] disabled:opacity-50"
                >
                  <Github className="w-5 h-5 text-slate-900" />
                  <span>GitHub</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                  className="flex-1 w-full flex items-center justify-center gap-3 px-6 py-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm active:scale-[0.98] transition-all font-bold text-sm text-slate-700 min-h-[48px] disabled:opacity-50"
                >
                  <Search className="w-5 h-5 text-slate-900" />
                  <span>Google</span>
                </button>
              </div>

              <p className="mt-8 text-center text-sm text-slate-500">
                {type === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                <button 
                  onClick={() => setType(type === 'login' ? 'signup' : 'login')}
                  className="text-accent font-bold hover:underline"
                >
                  {type === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
