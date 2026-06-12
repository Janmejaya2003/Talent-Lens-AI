import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Zap, Shield, Crown, Loader2, Sparkles, Star } from 'lucide-react';
import { BackButton } from '../BackButton';
import { updateUserPlan, PLAN_TOKENS } from '../../lib/tokenService';
import { User } from '@supabase/supabase-js';
import { PaymentModal } from '../payment/PaymentModal';
import { Toast } from '../Toast';

const tiers = [
  {
    name: 'Free' as keyof typeof PLAN_TOKENS,
    price: '₹0',
    tokens: 100,
    description: 'Perfect for individual hiring',
    features: ['100 Tokens included', '5 JD Analyses', 'Basic Insights', 'Email Support'],
    icon: Zap,
    color: 'bg-slate-100',
    textColor: 'text-slate-900',
    btnColor: 'bg-slate-900'
  },
  {
    name: 'Basic' as keyof typeof PLAN_TOKENS,
    price: '₹99',
    tokens: 500,
    description: 'For growing startups',
    features: ['500 Tokens included', '25 JD Analyses', 'Advanced Match Logic', 'Priority Support'],
    icon: Shield,
    color: 'bg-blue-50',
    textColor: 'text-blue-600',
    btnColor: 'bg-blue-600'
  },
  {
    name: 'Pro' as keyof typeof PLAN_TOKENS,
    price: '₹199',
    tokens: 1000,
    description: 'For corporate teams',
    features: ['1000 Tokens included', 'Unlimited JDs', 'Market Analytics', 'Dedicated Account Manager'],
    icon: Crown,
    color: 'bg-slate-900',
    textColor: 'text-white',
    btnColor: 'bg-white',
    btnTextColor: 'text-slate-900',
    isPopular: true
  },
  {
    name: 'Premium' as keyof typeof PLAN_TOKENS,
    price: '₹299',
    tokens: 3000,
    description: 'For enterprise scaling',
    features: ['3000 Tokens included', 'Enterprise API Access', 'Custom AI Training', '24/7 Phone Support'],
    icon: Sparkles,
    color: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    btnColor: 'bg-indigo-600'
  }
];

interface PricingSectionProps {
  user: User | null;
  onPlanSelected: () => void;
  onLoginRequest: () => void;
}

export function PricingSection({ user, onPlanSelected, onLoginRequest }: PricingSectionProps) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof tiers[0] | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  const handlePlanSelection = async (planName: keyof typeof PLAN_TOKENS) => {
    if (!user) {
      onLoginRequest();
      return;
    }

    const plan = tiers.find(t => t.name === planName);
    if (plan) {
      if (plan.name === 'Free') {
        setLoadingPlan(plan.name);
        await activatePlan(plan.name);
        setLoadingPlan(null);
      } else {
        setSelectedPlan(plan);
        setIsPaymentOpen(true);
      }
    }
  };

  const activatePlan = async (planName: keyof typeof PLAN_TOKENS) => {
    if (!user) return;
    try {
      const success = await updateUserPlan(user.id, planName);
      if (success) {
        setToast({
          isOpen: true,
          message: `Your ${planName} plan has been activated successfully!`,
          type: 'success'
        });
        // Wait a bit for feedback
        await new Promise(resolve => setTimeout(resolve, 800));
        onPlanSelected();
      }
    } catch (err) {
      console.error('Plan activation error:', err);
      setToast({
        isOpen: true,
        message: 'Failed to activate plan. Please try again.',
        type: 'error'
      });
    }
  };

  const handlePaymentSuccess = async () => {
    if (selectedPlan && user) {
      await activatePlan(selectedPlan.name);
      setIsPaymentOpen(false);
    }
  };

  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="flex justify-start">
          <BackButton />
        </div>

        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Star className="w-3 h-3 fill-current" />
            Flexible Infrastructure
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">Simple, Token-Based Pricing</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">Choose the plan that's right for your hiring volume. High-performance AI analysis, instantly accessible.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative p-8 rounded-[3rem] flex flex-col items-start text-left border border-slate-100 ${tier.color} ${tier.isPopular ? 'shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500' : 'shadow-xl shadow-slate-200/50'}`}
            >
              {tier.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${tier.name === 'Pro' ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                <tier.icon className={`w-7 h-7 ${tier.textColor}`} />
              </div>

              <h3 className={`text-2xl font-black ${tier.textColor}`}>{tier.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className={`text-4xl font-black ${tier.textColor}`}>{tier.price}</span>
                <span className={`text-sm font-bold opacity-60 ${tier.textColor}`}> / month</span>
              </div>
              <p className={`mt-6 text-sm font-medium opacity-70 ${tier.textColor} leading-relaxed`}>{tier.description}</p>

              <div className="w-full h-px bg-current opacity-10 my-8" />

              <ul className="space-y-4 flex-grow w-full">
                {tier.features.map(f => (
                  <li key={f} className={`flex items-center gap-3 text-[13px] font-bold ${tier.textColor}`}>
                    <Check className="w-4 h-4 shrink-0 transition-opacity opacity-60" />
                    {f}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handlePlanSelection(tier.name)}
                disabled={!!loadingPlan}
                className={`w-full mt-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${tier.btnColor} ${tier.btnTextColor || 'text-white shadow-lg shadow-current/10'} disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
              >
                {loadingPlan === tier.name ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  tier.name === 'Free' ? 'Activate Now' : 'Purchase Plan'
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isPaymentOpen && selectedPlan && (
          <PaymentModal 
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            plan={selectedPlan}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>

      <Toast 
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
