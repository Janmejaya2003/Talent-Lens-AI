import React, { useState, useEffect } from 'react';
import { CreditCard, User, Calendar, Lock } from 'lucide-react';

interface CardFormProps {
  onValidate: (isValid: boolean, data: any) => void;
}

export function CardForm({ onValidate }: CardFormProps) {
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') formattedValue = formatCardNumber(value).substring(0, 19);
    if (name === 'expiry') formattedValue = formatExpiry(value).substring(0, 5);
    if (name === 'cvv') formattedValue = value.replace(/[^0-9]/gi, '').substring(0, 3);
    if (name === 'name') formattedValue = value.replace(/[^a-zA-Z\s]/gi, '');

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.number.replace(/\s/g, '').length !== 16) {
      newErrors.number = 'Enter a valid 16-digit card number';
    }
    
    if (formData.name.length < 3) {
      newErrors.name = 'Enter full card holder name';
    }

    const expiryMatch = formData.expiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/);
    if (!expiryMatch) {
      newErrors.expiry = 'Invalid expiry (MM/YY)';
    }

    if (formData.cvv.length !== 3) {
      newErrors.cvv = 'CVV must be 3 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const isValid = validate();
    onValidate(isValid, formData);
  }, [formData]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Card Number</label>
        <div className="relative group">
          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            name="number"
            placeholder="0000 0000 0000 0000"
            value={formData.number}
            onChange={handleChange}
            className={`w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 transition-all font-medium ${
              errors.number ? 'focus:ring-red-500 border-red-100' : 'focus:ring-blue-500'
            }`}
          />
        </div>
        {errors.number && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.number}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Card Holder Name</label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            name="name"
            placeholder="FULL NAME"
            value={formData.name}
            onChange={handleChange}
            className={`w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 transition-all font-medium uppercase ${
              errors.name ? 'focus:ring-red-500 border-red-100' : 'focus:ring-blue-500'
            }`}
          />
        </div>
        {errors.name && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expiry Date</label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              name="expiry"
              placeholder="MM/YY"
              value={formData.expiry}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 transition-all font-medium ${
                errors.expiry ? 'focus:ring-red-500 border-red-100' : 'focus:ring-blue-500'
              }`}
            />
          </div>
          {errors.expiry && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.expiry}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CVV</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="password"
              name="cvv"
              placeholder="***"
              value={formData.cvv}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 transition-all font-medium ${
                errors.cvv ? 'focus:ring-red-500 border-red-100' : 'focus:ring-blue-500'
              }`}
            />
          </div>
          {errors.cvv && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.cvv}</p>}
        </div>
      </div>
    </div>
  );
}
