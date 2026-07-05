import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  Lock, 
  UserCheck, 
  Cpu, 
  ArrowRight, 
  ArrowLeft, 
  X,
  Languages
} from 'lucide-react';
import { AppTranslation } from '../types';

interface OnboardingProps {
  t: AppTranslation;
  onClose: () => void;
}

export default function Onboarding({ t, onClose }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to the Vault 🌟',
      description: 'The secure solution to easily convert multiple file formats into pristine PDF documents. Drag and drop images, raw text files, or markdown, and manage them instantly.',
      icon: <Sparkles className="w-12 h-12 text-indigo-500 animate-pulse" />,
    },
    {
      title: 'Bulk Processing Queue ⚡',
      description: 'Upload and convert dozens of files at the same time. Monitor conversion progress in real-time with automatic status indicators, bytes processed, and detailed success logs.',
      icon: <Layers className="w-12 h-12 text-indigo-500" />,
    },
    {
      title: 'Military-Grade Encryption 🔒',
      description: 'Protect sensitive reports and digital assets. Double-lock any document with custom passwords. Encrypted files can only be previewed, edited, or downloaded by entering the exact security key.',
      icon: <Lock className="w-12 h-12 text-indigo-500" />,
    },
    {
      title: 'Granular User Permissions 👥',
      description: 'Simulate secure workspace collaboration! Assign custom access roles—Owner, Editor, or Viewer—to folders and files. Restrict access and control who can read or alter secure documents.',
      icon: <UserCheck className="w-12 h-12 text-indigo-500" />,
    },
    {
      title: 'Offline Sync & Battery Optimization 🔋',
      description: 'Designed for field environments and laptops. Toggle Battery Saver Mode to disable heavy background tasks and reduce rendering cycles. Offline support keeps your secure files accessible without an internet connection.',
      icon: <Cpu className="w-12 h-12 text-indigo-500" />,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div id="onboarding-overlay" className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div 
        id="onboarding-modal" 
        className="bg-white dark:bg-[#16161a]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative transition-all duration-300 transform scale-100"
      >
        {/* Close Button */}
        <button 
          id="close-onboarding-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          title={t.tutorialSkip}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Progress indicator bar */}
        <div id="onboarding-progress-bar" className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 flex">
          {steps.map((_, idx) => (
            <div 
              key={idx}
              className={`h-full transition-all duration-300 ${
                idx <= currentStep 
                  ? 'bg-indigo-600 dark:bg-indigo-500' 
                  : 'bg-transparent'
              }`}
              style={{ width: `${100 / steps.length}%` }}
            />
          ))}
        </div>

        {/* Content Box */}
        <div className="p-8 flex flex-col items-center text-center">
          <div id="onboarding-step-icon" className="mb-6 p-4 bg-slate-50 dark:bg-[#09090b]/50 rounded-2xl border border-slate-100 dark:border-white/10">
            {steps[currentStep].icon}
          </div>

          <h3 id="onboarding-step-title" className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
            {steps[currentStep].title}
          </h3>

          <p id="onboarding-step-desc" className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8 text-sm md:text-base min-h-[80px]">
            {steps[currentStep].description}
          </p>

          {/* Controls */}
          <div id="onboarding-controls" className="flex items-center justify-between w-full pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              id="onboarding-prev-btn"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStep === 0 
                  ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              {t.tutorialPrev}
            </button>

            <span id="onboarding-step-number" className="text-xs text-slate-400 font-mono">
              {t.tutorialStep} {currentStep + 1} / {steps.length}
            </span>

            <button
              id="onboarding-next-btn"
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/10 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {currentStep === steps.length - 1 ? t.tutorialDone : t.tutorialNext}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
