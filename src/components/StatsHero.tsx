import React from 'react';
import { TrendingUp, Wallet, Plus } from 'lucide-react';
import { UserProfile, LoanApplication, Transaction } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

interface StatsHeroProps {
  profile: UserProfile;
  loans: LoanApplication[];
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
  translations: any;
  onApplyClick: React.ReactNode;
}

export const StatsHero: React.FC<StatsHeroProps> = ({ 
  profile, 
  loans, 
  transactions, 
  formatCurrency, 
  translations: t,
  onApplyClick
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-neutral-900 text-white border-none">
        <CardHeader className="pb-2">
          <CardDescription className="text-neutral-400">{t.balance}</CardDescription>
          <CardTitle className="text-3xl font-bold">
            {formatCurrency(profile.balance || 0)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Wallet className="w-4 h-4" />
            <span>Total Transactions: {transactions.length}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>{t.borrowed}</CardDescription>
          <CardTitle className="text-3xl font-bold">
            {formatCurrency(loans.filter(l => l.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0))}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <TrendingUp className="w-4 h-4" />
            <span>Active Loans: {loans.filter(l => l.status === 'approved').length}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col justify-center items-center p-6 bg-neutral-100 border-dashed border-2 border-neutral-300">
        {onApplyClick}
      </Card>
    </div>
  );
};
