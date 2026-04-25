import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Currency } from '../types';

interface CurrencySelectorProps {
  value: Currency;
  onChange: (value: Currency) => void;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2 border rounded-lg px-2 py-1 bg-neutral-50">
      <RefreshCw className="w-4 h-4 text-neutral-500" />
      <select 
        className="text-xs bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value as Currency)}
      >
        <option value="UGX">UGX</option>
        <option value="USD">USD</option>
        <option value="KES">KES</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
      </select>
    </div>
  );
};
