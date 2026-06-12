import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  MessageCircle, 
  Link as LinkIcon, 
  Check, 
  Share2,
  Phone,
  MessageSquare
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageTitle: string;
  pageUrl: string;
  onShareSuccess: (platform: string) => void;
}

export function ShareModal({ isOpen, onClose, pageTitle, pageUrl, onShareSuccess }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareItems = [
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366]',
      onClick: () => {
        const text = encodeURIComponent(`Check this page from TalentLens AI: ${pageTitle} - ${pageUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
        onShareSuccess('whatsapp');
      }
    },
    {
      label: 'Email',
      icon: Mail,
      color: 'bg-blue-500',
      onClick: () => {
        const subject = encodeURIComponent(`TalentLens AI Page: ${pageTitle}`);
        const body = encodeURIComponent(`Check this page: ${pageUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        onShareSuccess('email');
      }
    },
    {
      label: 'SMS / Phone',
      icon: MessageSquare,
      color: 'bg-slate-900',
      onClick: () => {
        const body = encodeURIComponent(`Check this page from TalentLens AI: ${pageUrl}`);
        window.location.href = `sms:?body=${body}`;
        onShareSuccess('sms');
      }
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      onShareSuccess('copy_link');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Share Page</h3>
                    <p className="text-xs text-slate-500">Spread the knowledge</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 mb-8">
                {shareItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.onClick();
                      // We don't close immediately so user sees the action?
                      // Actually closing is usually better UX
                    }}
                    className="w-full p-4 flex items-center gap-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group active:scale-95"
                  >
                    <div className={`w-12 h-12 ${item.color} text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-700">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="relative pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Or copy link</p>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex-1 truncate px-3 py-1 text-xs text-slate-500 font-medium">
                    {pageUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                      copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white text-slate-900 shadow-sm border border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
