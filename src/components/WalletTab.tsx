import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Banknote 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionHistory } from './TransactionHistory';
import { UserProfile, Transaction, Currency } from '../types';

interface WalletTabProps {
  profile: UserProfile;
  transactions: Transaction[];
  currency: Currency;
  formatCurrency: (amount: number) => string;
  translations: any;
  onTransaction: (data: {
    type: Transaction['type'];
    amount: number;
    method: Transaction['method'];
    bankName?: string;
    accountNumber: string;
  }) => Promise<void>;
  isTransacting: boolean;
}

export const WalletTab: React.FC<WalletTabProps> = ({
  profile,
  transactions,
  currency,
  formatCurrency,
  translations: t,
  onTransaction,
  isTransacting
}) => {
  const [form, setForm] = useState({
    type: 'deposit' as Transaction['type'],
    amount: '',
    method: 'MTN' as Transaction['method'],
    bankName: '',
    accountNumber: ''
  });

  const handleSubmit = async () => {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return;
    
    await onTransaction({
      type: form.type,
      amount,
      method: form.method,
      bankName: form.bankName,
      accountNumber: form.accountNumber
    });

    setForm(prev => ({ ...prev, amount: '', accountNumber: '' }));
  };

  const totalIn = transactions
    .filter(t => t.type === 'deposit')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalOut = transactions
    .filter(t => t.type !== 'deposit')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-neutral-900 text-white border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
          <CardHeader>
            <CardDescription className="text-neutral-400">{t.balance}</CardDescription>
            <CardTitle className="text-4xl font-bold">{formatCurrency(profile.balance || 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 p-3 bg-white/10 rounded-xl">
                <p className="text-[10px] text-neutral-400 uppercase font-bold">Total In</p>
                <p className="text-sm font-bold text-green-400">+{formatCurrency(totalIn)}</p>
              </div>
              <div className="flex-1 p-3 bg-white/10 rounded-xl">
                <p className="text-[10px] text-neutral-400 uppercase font-bold">Total Out</p>
                <p className="text-sm font-bold text-red-400">-{formatCurrency(totalOut)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Deposit, Withdraw or Pay Loans</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={form.type === 'deposit' ? 'default' : 'outline'} 
                className="flex-col h-20 gap-1 text-xs"
                onClick={() => setForm({...form, type: 'deposit'})}
              >
                <ArrowDownCircle className="w-5 h-5" />
                {t.deposit}
              </Button>
              <Button 
                variant={form.type === 'withdrawal' ? 'default' : 'outline'} 
                className="flex-col h-20 gap-1 text-xs"
                onClick={() => setForm({...form, type: 'withdrawal'})}
              >
                <ArrowUpCircle className="w-5 h-5" />
                {t.withdraw}
              </Button>
              <Button 
                variant={form.type === 'loan_payment' ? 'default' : 'outline'} 
                className="flex-col h-20 gap-1 text-xs"
                onClick={() => setForm({...form, type: 'loan_payment'})}
              >
                <Banknote className="w-5 h-5" />
                {t.payLoan}
              </Button>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={form.method} onValueChange={(v) => setForm({...form, method: v as any})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                    <SelectItem value="Airtel">Airtel Money</SelectItem>
                    <SelectItem value="Bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.method === 'Bank' && (
                <div className="space-y-2">
                  <Label>Select Bank</Label>
                  <Select value={form.bankName} onValueChange={(v) => setForm({...form, bankName: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stanbic">Stanbic Bank</SelectItem>
                      <SelectItem value="Centenary">Centenary Bank</SelectItem>
                      <SelectItem value="Equity">Equity Bank</SelectItem>
                      <SelectItem value="Absa">Absa Bank</SelectItem>
                      <SelectItem value="Standard Chartered">Standard Chartered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>{form.method === 'Bank' ? 'Account Number' : 'Phone Number'}</Label>
                <Input 
                  placeholder={form.method === 'Bank' ? "0123456789" : "07XX XXXXXX"} 
                  value={form.accountNumber}
                  onChange={(e) => setForm({...form, accountNumber: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>{t.amount} ({currency})</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={form.amount}
                  onChange={(e) => setForm({...form, amount: e.target.value})}
                />
              </div>

              <Button className="w-full bg-neutral-900" onClick={handleSubmit} disabled={isTransacting}>
                {isTransacting ? t.processing : `Confirm ${form.type.replace('_', ' ')}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{t.history}</CardTitle>
            <CardDescription>Your recent financial activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistory 
              transactions={transactions} 
              formatCurrency={formatCurrency} 
              translations={t} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
