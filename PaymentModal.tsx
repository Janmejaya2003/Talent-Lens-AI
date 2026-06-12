import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowLeft, 
  Check, 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  Loader2,
  CheckCircle2,
  Lock,
  Zap,
  ChevronRight
} from 'lucide-react';
import { CardForm } from './CardForm';
import { UPIForm } from './UPIForm';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    price: string;
    tokens: number;
    description: string;
  };
  onSuccess: () => void;
}

type PaymentMethod = 'gpay' | 'phonepe' | 'upi' | 'credit' | 'debit';

export function PaymentModal({ isOpen, onClose, plan, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<'checkout' | 'processing' | 'success'>('checkout');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('checkout');
      setSelectedMethod(null);
      setIsAgreed(false);
      setIsFormValid(false);
    }
  }, [isOpen]);

  const handlePayNow = async () => {
    if (!isAgreed || (selectedMethod && !isFormValid && ['upi', 'credit', 'debit'].includes(selectedMethod))) return;
    
    setStep('processing');
    
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setStep('success');
    
    // Auto-redirect after success
    setTimeout(() => {
      onSuccess();
    }, 3000);
  };

  const methods = [
    { id: 'gpay', name: 'Google Pay', icon: Smartphone, color: 'text-blue-500' },
    { id: 'phonepe', name: 'PhonePe', icon: Smartphone, color: 'text-purple-600' },
    { id: 'upi', name: 'BHIM UPI', icon: Zap, color: 'text-orange-500' },
    { id: 'credit', name: 'Credit Card', icon: CreditCard, color: 'text-slate-600' },
    { id: 'debit', name: 'Debit Card', icon: CreditCard, color: 'text-slate-600' },
  ] as const;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step === 'checkout' && (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col md:flex-row h-full max-h-[90vh]"
            >
              {/* Left Side: Summary */}
              <div className="w-full md:w-5/12 bg-slate-50 p-8 md:p-10 border-r border-slate-100 flex flex-col justify-between">
                <div>
                  <button onClick={onClose} className="mb-8 p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">You're getting</span>
                      <h3 className="text-3xl font-black text-slate-900 mt-1">{plan.name} Plan</h3>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                       <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500">Duration</span>
                          <span className="text-xs font-black text-slate-900">Per Month</span>
                       </div>
                       <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500">Tokens</span>
                          <span className="text-xs font-black text-slate-900">{plan.tokens.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center pt-2">
                          <span className="text-sm font-black text-slate-900">Total Price</span>
                          <span className="text-xl font-black text-blue-600">{plan.price}</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-500">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Secure 256-bit SSL encrypted payment</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-slate-400">
                     <Lock className="w-3 h-3" />
                     <span className="text-[9px] font-bold uppercase tracking-widest">Guaranteed Safe Checkout</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Payment Methods */}
              <div className="flex-1 p-8 md:p-10 overflow-y-auto">
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">Payment Method</h4>
                    <p className="text-slate-500 text-sm">Choose your preferred way to pay</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {methods.map((method) => (
                      <button 
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`group p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          selectedMethod === method.id 
                            ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' 
                            : 'bg-white border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            selectedMethod === method.id ? 'bg-white' : 'bg-slate-50'
                          }`}>
                            <method.icon className={`w-5 h-5 ${method.color}`} />
                          </div>
                          <span className={`text-sm font-bold ${
                            selectedMethod === method.id ? 'text-blue-900' : 'text-slate-600'
                          }`}>{method.name}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedMethod === method.id 
                            ? 'border-blue-600 bg-blue-600' 
                            : 'border-slate-200'
                        }`}>
                          {selectedMethod === method.id && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Form Area */}
                  <AnimatePresence mode="wait">
                    {['upi', 'gpay', 'phonepe'].includes(selectedMethod || '') && (
                      <motion.div
                        key="upi-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <UPIForm onValidate={(valid, data) => {
                          setIsFormValid(valid);
                          setPaymentData(data);
                        }} />
                      </motion.div>
                    )}
                    {['credit', 'debit'].includes(selectedMethod || '') && (
                      <motion.div
                        key="card-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <CardForm onValidate={(valid, data) => {
                          setIsFormValid(valid);
                          setPaymentData(data);
                        }} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Terms Checkbox */}
                  <div className="space-y-6 pt-4 border-t border-slate-100">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative pt-1">
                        <input 
                          type="checkbox" 
                          checked={isAgreed}
                          onChange={(e) => setIsAgreed(e.target.checked)}
                          className="peer w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed group-hover:text-slate-900 transition-colors">
                        I agree to the <span className="font-bold text-blue-600 underline">Terms of Service</span> and <span className="font-bold text-blue-600 underline">Privacy Policy</span>. I understand this is a non-refundable digital transaction.
                      </p>
                    </label>

                    <button 
                      onClick={handlePayNow}
                      disabled={!isAgreed || !selectedMethod || (!isFormValid && ['upi', 'credit', 'debit'].includes(selectedMethod))}
                      className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                    >
                      <span>Pay Now · {plan.price}</span>
                      <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-20 text-center space-y-8"
            >
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse" />
                <div className="absolute inset-2 bg-blue-50 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Verifying Transaction</h3>
                <p className="text-slate-500">Contacting payment gateway... please do not close this window.</p>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-16 md:p-24 text-center space-y-8"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">Payment Successful 🎉</h3>
                <p className="text-slate-500 text-lg">Your account has been upgraded to <span className="font-bold text-slate-900">{plan.name}</span>. Dashboard features are now unlocked.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 inline-block px-8">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Transaction ID</p>
                 <p className="text-sm font-black text-slate-900 font-mono tracking-wider">#{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              </div>
              <div className="pt-4">
                 <p className="text-xs text-slate-400 italic">Redirecting to your dashboard in a moment...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Close Button (Top Right) */}
        {step !== 'processing' && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </motion.div>
    </div>
  );
}
