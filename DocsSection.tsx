import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Book, 
  ChevronRight, 
  Terminal, 
  Zap, 
  Shield, 
  Code, 
  Database,
  Cpu,
  MessageSquare,
  ArrowRight,
  Search
} from 'lucide-react';
import { BackButton } from '../BackButton';
import { SupportModal } from '../SupportModal';

const sections = [
  {
    title: 'Getting Started',
    description: 'Learn how to set up your recruiter profile and start analyzing JDs.',
    icon: Zap,
    links: [
      { label: 'Quick Start Guide', id: 'quick-start' },
      { label: 'Account Configuration', id: 'account' },
      { label: 'Managing Teams', id: 'teams' }
    ]
  },
  {
    title: 'AI Analysis Engine',
    description: 'Technical overview of our semantic matching and Scoring logic.',
    icon: Cpu,
    links: [
      { label: 'Understanding Match Scores', id: 'match-scores' },
      { label: 'Skill Extraction Logic', id: 'skills' },
      { label: 'Experience Level Mapping', id: 'experience' }
    ]
  },
  {
    title: 'Token Economy',
    description: 'Details on how tokens are consumed and how to manage your balance.',
    icon: Database,
    links: [
      { label: 'Token Consumption Table', id: 'tokens' },
      { label: 'Billing Information', id: 'billing' },
      { label: 'Auto-Reload Setup', id: 'reload' }
    ]
  },
  {
    title: 'API & Integrations',
    description: 'Integrate TalentLens AI directly into your existing ATS workflow.',
    icon: Terminal,
    links: [
      { label: 'REST API Reference', id: 'api' },
      { label: 'Webhooks Documentation', id: 'webhooks' },
      { label: 'Custom Field Mapping', id: 'mapping' }
    ]
  }
];

export function DocsSection() {
  const navigate = useNavigate();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredSections = sections.filter(section => 
    section.title.toLowerCase().includes(search.toLowerCase()) ||
    section.description.toLowerCase().includes(search.toLowerCase()) ||
    section.links.some(link => link.label.toLowerCase().includes(search.toLowerCase()))
  ).map(section => ({
    ...section,
    links: section.links.filter(link => 
      link.label.toLowerCase().includes(search.toLowerCase()) || 
      section.title.toLowerCase().includes(search.toLowerCase())
    )
  }));

  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="flex justify-start">
          <BackButton />
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Book className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Documentation Hub</h2>
            <p className="text-slate-500 max-w-xl">Comprehensive guides and and API references to master AI-driven recruitment.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
              <input 
                type="text"
                placeholder="Search documentation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
              />
            </div>
            <div className="hidden lg:flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
               <Code className="w-4 h-4 text-slate-400" />
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Market Version 2.4.0</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredSections.length > 0 ? (
            filteredSections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-blue-200 hover:shadow-blue-900/5 transition-all"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <section.icon className="w-7 h-7" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                     <ChevronRight className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-2">{section.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">{section.description}</p>

                <div className="space-y-3">
                  {section.links.map(link => (
                    <button 
                      key={link.id}
                      onClick={() => navigate(`/docs/${link.id}`)}
                      className="w-full text-left px-4 py-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 flex items-center justify-between group/link"
                    >
                      {link.label}
                      <ChevronRight className="w-3 h-3 transition-transform group-hover/link:translate-x-1" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-slate-300 shadow-sm">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-lg">No documentation found for "{search}"</p>
                <p className="text-slate-500 text-sm">Try searching for tokens, API, integration, or setup.</p>
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

        {/* Support Section */}
        <div className="rounded-[3rem] bg-slate-900 p-12 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -ml-32 -mb-32" />
          
          <div className="max-w-2xl mx-auto space-y-4 relative">
            <h3 className="text-3xl font-black text-white px-6">Still have questions?</h3>
            <p className="text-slate-400 font-medium">Our expert support team is available 24/7 to help you optimize your hiring workflow.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
            <button 
              onClick={() => setIsSupportOpen(true)}
              className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-xl active:scale-95"
            >
              <Shield className="w-5 h-5" />
              Contact Support
            </button>
            <button 
              onClick={() => navigate('/community')}
              className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-all border border-white/5 active:scale-95"
            >
              <MessageSquare className="w-5 h-5" />
              Community Forum
            </button>
          </div>
        </div>
      </div>

      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  );
}
