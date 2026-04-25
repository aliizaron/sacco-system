import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { LoanApplication, UserProfile } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LoanApplicationDetailsProps {
  loan: LoanApplication;
  profile: UserProfile;
  formatCurrency: (amount: number) => string;
  onAction: (loanId: string, status: 'approved' | 'rejected') => void;
}

export const LoanApplicationDetails: React.FC<LoanApplicationDetailsProps> = ({ 
  loan, 
  profile, 
  formatCurrency,
  onAction
}) => {
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Application Details</DialogTitle>
        <DialogDescription>Risk Analysis & Justification</DialogDescription>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-neutral-50 rounded-lg border">
            <p className="text-xs text-neutral-500 uppercase font-bold">Risk Level</p>
            <p className="text-lg font-bold">{loan.riskScore}</p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-lg border">
            <p className="text-xs text-neutral-500 uppercase font-bold">Qualification</p>
            <p className={`text-lg font-bold ${
              loan.qualificationStatus === 'Qualified' ? 'text-green-600' : 
              loan.qualificationStatus === 'Not Qualified' ? 'text-red-600' : 
              'text-amber-600'
            }`}>{loan.qualificationStatus}</p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-lg border">
            <p className="text-xs text-neutral-500 uppercase font-bold">Amount</p>
            <p className="text-lg font-bold">{formatCurrency(loan.amount)}</p>
          </div>
        </div>

        <div className="p-4 bg-neutral-900 text-white rounded-lg border shadow-lg">
          <p className="text-xs text-neutral-400 uppercase font-bold mb-1">Disbursement Destination</p>
          <p className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-400" />
            {loan.disbursementMethod} - {loan.disbursementAccount}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1 italic">Funds will be sent here automatically upon approval.</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-bold">Verification Checks</p>
          <div className="grid grid-cols-1 gap-2">
            {loan.verificationChecks?.map((check, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-lg text-sm">
                <div className="flex flex-col">
                  <span className="font-medium">{check.check}</span>
                  <span className="text-xs text-neutral-500">{check.reason}</span>
                </div>
                <Badge variant={
                  check.status === 'Passed' ? 'secondary' : 
                  check.status === 'Failed' ? 'destructive' : 
                  'outline'
                }>
                  {check.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold">Comparative Analysis & AI Justification</p>
          <div className="text-sm text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-lg border whitespace-pre-wrap">
            {loan.riskJustification}
          </div>
          {loan.suggestedAmount && loan.qualificationStatus !== 'Qualified' && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-in fade-in slide-in-from-top duration-500">
              <p className="text-xs text-green-700 font-bold uppercase">AI Qualified Amount Suggestion</p>
              <p className="text-lg font-bold text-green-900">
                {formatCurrency(loan.suggestedAmount)}
              </p>
              <p className="text-[10px] text-green-600 italic">
                Based on your current transaction history and collateral, you would successfully qualify for this amount.
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t space-y-4">
          <p className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Collateral Evaluation
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-neutral-500 uppercase font-bold">Type & Description</p>
              <p className="text-sm font-medium">{loan.collateral.type}: {loan.collateral.description}</p>
              {loan.collateral.value && (
                <p className="text-xs text-neutral-500 mt-1 italic">
                  Estimated Value: UGX {loan.collateral.value.toLocaleString()}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-neutral-500 uppercase font-bold">AI Evaluation</p>
              <p className="text-sm text-neutral-600 italic leading-relaxed">
                "{loan.collateral.evaluation || "Evaluation pending..."}"
              </p>
            </div>
          </div>
        </div>
        {(profile.role === 'admin' || profile.role === 'monitor') && loan.status === 'pending' && (
          <div className="flex gap-4 pt-4">
            <Button onClick={() => onAction(loan.id, 'approved')} className="flex-1 bg-green-600 hover:bg-green-700">Approve</Button>
            <Button onClick={() => onAction(loan.id, 'rejected')} variant="destructive" className="flex-1">Reject</Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
};
