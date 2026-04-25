import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../types';

interface LanguageSelectorProps {
  value: Language;
  onChange: (value: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2 border rounded-lg px-2 py-1 bg-neutral-50">
      <Globe className="w-4 h-4 text-neutral-500" />
      <select 
        className="text-xs bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
      >
        <option value="en">English</option>
        <option value="sw">Kiswahili</option>
        <option value="lg">Luganda</option>
      </select>
    </div>
  );
};
