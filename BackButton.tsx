import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
  fallbackPath?: string;
}

export function BackButton({ onClick, className, fallbackPath = "/" }: BackButtonProps) {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = React.useState(false);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isNavigating) return;
    
    // Prevent double clicking
    setIsNavigating(true);
    setTimeout(() => setIsNavigating(false), 500);

    if (onClick) {
      onClick();
      return;
    }

    // Advanced history logic
    const lastPage = localStorage.getItem('lastPage');
    
    // If we have history, use it. 
    // Otherwise use our tracked lastPage or the specified fallback
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(lastPage || fallbackPath);
    }
  };

  return (
    <motion.button
      whileHover={{ x: -4, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleBack}
      disabled={isNavigating}
      className={`
        inline-flex items-center gap-2 px-5 py-2.5 
        bg-white hover:bg-slate-50 
        text-slate-900 hover:text-blue-600 
        font-bold text-sm 
        rounded-2xl border border-slate-200 
        shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-blue-500/10 
        transition-all group z-50
        cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
      Back
    </motion.button>
  );
}
