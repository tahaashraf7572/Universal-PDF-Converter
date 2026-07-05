import React from 'react';
import { Languages } from 'lucide-react';
import { UserLanguage } from '../types';

interface LanguageSelectorProps {
  language: UserLanguage;
  setLanguage: (lang: UserLanguage) => void;
}

export default function LanguageSelector({ language, setLanguage }: LanguageSelectorProps) {
  const options = [
    { code: 'en', label: 'English' },
    { code: 'ur', label: 'اردو / Urdu' },
    { code: 'es', label: 'Español' },
    { code: 'de', label: 'Deutsch' }
  ];

  return (
    <div id="language-selector-wrapper" className="flex items-center gap-2 bg-slate-50 dark:bg-[#16161a] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300">
      <Languages className="w-4 h-4 text-slate-400" />
      <select
        id="app-language-select"
        value={language}
        onChange={e => setLanguage(e.target.value as UserLanguage)}
        className="bg-transparent border-none outline-none font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
        title="Change application language"
      >
        {options.map(opt => (
          <option key={opt.code} value={opt.code} className="dark:bg-[#16161a]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
