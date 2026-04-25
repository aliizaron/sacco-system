import React, { useState } from 'react';
import { Plus, Upload, X, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LoanApplication, UserProfile } from '../types';

interface LoanApplicationFormProps {
  profile: UserProfile;
  onSubmit: (data: {
    amount: number;
    purpose: string;
    collateralType: LoanApplication['collateral']['type'];
    collateralDescription: string;
    collateralValue?: number;
    disbursementMethod: LoanApplication['disbursementMethod'];
    disbursementAccount: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  translations: any;
  compact?: boolean;
}

export const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ 
  profile, 
  onSubmit, 
  isSubmitting,
  translations: t,
  compact = false
}) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'details' | 'disbursement' | 'review'>('details');
  const [form, setForm] = useState({
    amount: '',
    purpose: '',
    collateralType: 'Property' as LoanApplication['collateral']['type'],
    collateralDescription: '',
    collateralValue: '',
    disbursementMethod: 'MTN' as LoanApplication['disbursementMethod'],
    disbursementAccount: ''
  });

  const handleSubmit = async () => {
    if (!form.amount || !form.purpose) {
      toast.error("Please fill all required fields.");
      return;
    }

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    await onSubmit({
      amount,
      purpose: form.purpose,
      collateralType: form.collateralType,
      collateralDescription: form.collateralDescription,
      collateralValue: form.collateralValue ? parseFloat(form.collateralValue) : undefined,
      disbursementMethod: form.disbursementMethod,
      disbursementAccount: form.disbursementAccount
    });

    setForm({
      amount: '',
      purpose: '',
      collateralType: 'Property',
      collateralDescription: '',
      collateralValue: '',
      disbursementMethod: 'MTN',
      disbursementAccount: ''
    });
    setStep('details');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <Button className="bg-neutral-900 text-white gap-2" size="sm">
            <Plus className="w-4 h-4" />
            Apply for Loan
          </Button>
        ) : (
          <Button className="w-full h-full py-8 text-lg gap-2" variant="outline">
            <Plus className="w-6 h-6" />
            {t.apply}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Loan Application</DialogTitle>
          <DialogDescription>Submit your request for AI risk assessment.</DialogDescription>
        </DialogHeader>
        <form 
          onSubmit={(e) => { e.preventDefault(); if (step === 'review') handleSubmit(); }}
          className="space-y-4 py-4"
        >
          {step === 'details' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
              <div className="space-y-2">
                <Label>Loan Amount (UGX)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 5000000" 
                  value={form.amount} 
                  onChange={e => setForm({...form, amount: e.target.value})} 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Purpose of Loan</Label>
                <Input 
                  placeholder="e.g. Business expansion" 
                  value={form.purpose} 
                  onChange={e => setForm({...form, purpose: e.target.value})} 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Collateral Type</Label>
                <Select 
                  value={form.collateralType} 
                  onValueChange={(v) => setForm({...form, collateralType: v as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Property">Property / Land</SelectItem>
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="Business">Business Assets</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Collateral Description</Label>
                <Input 
                  placeholder="e.g. Plot 45, Kampala" 
                  value={form.collateralDescription} 
                  onChange={e => setForm({...form, collateralDescription: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Estimated Collateral Value (UGX)</Label>
                <Input 
                  type="number"
                  placeholder="e.g. 50000000" 
                  value={form.collateralValue} 
                  onChange={e => setForm({...form, collateralValue: e.target.value})} 
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  className="flex-1 bg-neutral-900" 
                  onClick={() => {
                    if (!form.amount || !form.purpose) {
                      toast.error("Please fill required fields.");
                      return;
                    }
                    setStep('disbursement');
                  }}
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {step === 'disbursement' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
              <div className="space-y-2">
                <Label>Where should we place the money?</Label>
                <Select 
                  value={form.disbursementMethod} 
                  onValueChange={(v) => setForm({...form, disbursementMethod: v as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                    <SelectItem value="Airtel">Airtel Money</SelectItem>
                    <SelectItem value="Bank">Bank Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  {form.disbursementMethod === 'Bank' ? 'Account Number' : 'Phone Number'}
                </Label>
                <Input 
                  placeholder={form.disbursementMethod === 'Bank' ? 'e.g. 0123456789' : 'e.g. 0771234567'} 
                  value={form.disbursementAccount} 
                  onChange={e => setForm({...form, disbursementAccount: e.target.value})} 
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('details')}>
                  Back
                </Button>
                <Button 
                  type="button" 
                  className="flex-1 bg-neutral-900" 
                  onClick={() => {
                    if (!form.disbursementAccount) {
                      toast.error("Please enter disbursement details.");
                      return;
                    }
                    setStep('review');
                  }}
                >
                  Confirm Details
                </Button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
              <div className="bg-neutral-50 p-4 rounded-lg space-y-3 border">
                <h3 className="font-bold text-sm uppercase text-neutral-500">Review Your Application</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-neutral-500">Amount:</span>
                  <span className="font-medium">UGX {parseFloat(form.amount).toLocaleString()}</span>
                  <span className="text-neutral-500">Purpose:</span>
                  <span className="font-medium">{form.purpose}</span>
                  <span className="text-neutral-500">Disbursement:</span>
                  <span className="font-medium">{form.disbursementMethod} - {form.disbursementAccount}</span>
                  <span className="text-neutral-500">Collateral:</span>
                  <span className="font-medium">{form.collateralType}</span>
                </div>
                {parseFloat(form.amount) > 10000000 && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-700 font-medium">
                    ⚠️ Amounts above 10M UGX require manual human verification from a SACCO officer after AI assessment.
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('disbursement')}>
                  Edit
                </Button>
                <Button type="submit" className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white h-12 shadow-lg transition-all active:scale-95" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Processing AI Analysis...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Submit Application
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
