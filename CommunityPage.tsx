import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Users, TrendingUp, Search, Plus, ThumbsUp, MessageCircle, ChevronRight } from 'lucide-react';
import { BackButton } from './BackButton';

const mockPosts = [
  {
    id: 1,
    title: 'How to best map technical skills for Senior Dev roles?',
    author: 'Alex (Recruiter @ TechFlow)',
    category: 'Best Practices',
    likes: 24,
    comments: 8,
    time: '2 hours ago'
  },
  {
    id: 2,
    title: 'Understanding the semantic fallback in v2.4 API',
    author: 'Sarah (DevOps Engineer)',
    category: 'API & Dev',
    likes: 42,
    comments: 15,
    time: '5 hours ago'
  },
  {
    id: 3,
    title: 'Does TalentLens support bulk resume parsing via webhooks?',
    author: 'Michael (HR Lead)',
    category: 'Integrations',
    likes: 12,
    comments: 4,
    time: '1 day ago'
  }
];

export function CommunityPage() {
  const [search, setSearch] = useState('');

  const filteredPosts = mockPosts.filter(post => 
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.category.toLowerCase().includes(search.toLowerCase()) ||
    post.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <div className="flex justify-start">
          <BackButton />
        </div>

        {/* Hero Section */}
        <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
          
          <div className="max-w-2xl space-y-6 relative">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-400">
               <Users className="w-3 h-3" />
               Join 12,000+ Recruiters
             </div>
             <h1 className="text-5xl font-black tracking-tight leading-tight">TalentLens Community</h1>
             <p className="text-slate-400 text-lg">Share insights, ask technical questions, and learn from hiring experts around the world.</p>
          </div>

          <div className="mt-12 flex flex-col md:flex-row gap-4 relative">
             <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400" />
                <input 
                  type="text"
                  placeholder="Search discussions, questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500 transition-all font-medium"
                />
             </div>
             <button className="px-8 py-5 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
               <Plus className="w-5 h-5" />
               New discussion
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Discussions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-4">
               <h3 className="font-bold text-slate-900 text-xl tracking-tight">
                {search ? `Search Results (${filteredPosts.length})` : 'Recent Discussions'}
               </h3>
               <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest uppercase">Trending now</span>
               </div>
            </div>

            <div className="space-y-4">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1 pr-8">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{post.category}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{post.time}</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{post.title}</h4>
                        <p className="text-xs text-slate-400 font-medium">Started by <span className="text-slate-600 font-bold">{post.author}</span></p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>

                    <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-50">
                       <div className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group/btn">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-xs font-bold">{post.likes}</span>
                       </div>
                       <div className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group/btn">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs font-bold">{post.comments}</span>
                       </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center space-y-4 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                    <Search className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-lg">No results found for "{search}"</p>
                    <p className="text-slate-500 text-sm">Try using different keywords or categories.</p>
                  </div>
                  <button 
                    onClick={() => setSearch('')}
                    className="text-blue-600 font-bold text-sm hover:underline"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
               <h3 className="font-bold text-slate-900 tracking-tight">Community Leaders</h3>
               <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-400">U{i}</div>
                     <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 leading-none">Power User {i}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{200 * (4-i)} Points</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/20 space-y-4">
               <MessageSquare className="w-10 h-10 text-white/40" />
               <h3 className="text-xl font-black leading-tight">Need 1-on-1 Help?</h3>
               <p className="text-blue-100 text-sm leading-relaxed">Our support team is 5 minutes away for Pro members. Skip the queue.</p>
               <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-all shadow-lg active:scale-95">
                 Upgrade to Pro
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
