import React, { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';

interface UPIFormProps {
  onValidate: (isValid: boolean, data: any) => void;
}

export function UPIForm({ onValidate }: UPIFormProps) {
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');

  const validateUpi = (value: string) => {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!value) {
      setError('UPI ID is required');
      return false;
    }
    if (!upiRegex.test(value)) {
      setError('Invalid UPI ID format (e.g. user@bank)');
      return false;
    }
    setError('');
    return true;
  };

  useEffect(() => {
    const isValid = validateUpi(upiId);
    onValidate(isValid, { upiId });
  }, [upiId]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enter UPI ID</label>
        <div className="relative group">
          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="example@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className={`w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 transition-all font-medium ${
              error ? 'focus:ring-red-500 border-red-100' : 'focus:ring-blue-500'
            }`}
          />
        </div>
        {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
      </div>

      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-blue-100">
             <span className="text-[10px] font-black text-blue-600">🛡️</span>
          </div>
          <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
            A payment request will be sent to your UPI app. Please verify the amount and complete the transaction.
          </p>
        </div>
      </div>
    </div>
  );
}
