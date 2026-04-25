import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { LoanApplication, UserProfile } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface LoanApplicationTableProps {
  loans: LoanApplication[];
  profile: UserProfile;
  formatCurrency: (amount: number) => string;
  translations: any;
  onViewDetails: (loan: LoanApplication) => void;
}

export const LoanApplicationTable: React.FC<LoanApplicationTableProps> = ({ 
  loans, 
  profile, 
  formatCurrency, 
  translations: t,
  onViewDetails
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {(profile.role === 'admin' || profile.role === 'monitor') && <TableHead>{t.borrower}</TableHead>}
          <TableHead>{t.amount}</TableHead>
          <TableHead>{t.riskScore}</TableHead>
          <TableHead>{t.qualification}</TableHead>
          <TableHead>{t.status}</TableHead>
          <TableHead>{t.date}</TableHead>
          <TableHead className="text-right">{t.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loans.map((loan) => (
          <TableRow key={loan.id}>
            {(profile.role === 'admin' || profile.role === 'monitor') && (
              <TableCell className="font-medium">{loan.userName || 'Unknown'}</TableCell>
            )}
            <TableCell>{formatCurrency(loan.amount)}</TableCell>
            <TableCell>
              <Badge variant={
                loan.riskScore === 'Low' ? 'secondary' : 
                loan.riskScore === 'Medium' ? 'outline' : 
                'destructive'
              }>
                {loan.riskScore}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {loan.qualificationStatus === 'Qualified' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : 
                   loan.qualificationStatus === 'Conditional' ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : 
                   <XCircle className="w-4 h-4 text-red-500" />}
                  <span className="text-xs">{loan.qualificationStatus}</span>
                </div>
                {loan.qualificationStatus === 'Not Qualified' && (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-500 italic max-w-[120px] line-clamp-1">
                      See details for reason
                    </span>
                    {loan.suggestedAmount && (
                      <span className="text-[10px] text-green-600 font-bold">
                        Qualifies for: {formatCurrency(loan.suggestedAmount)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <Badge variant={
                  loan.status === 'approved' ? 'secondary' : 
                  loan.status === 'rejected' ? 'destructive' : 
                  'outline'
                }>
                  {loan.status}
                </Badge>
                {loan.status === 'rejected' && (
                  <span className="text-[10px] text-red-500 font-medium line-clamp-1 max-w-[120px]" title={loan.riskJustification}>
                    {loan.riskJustification.split('.')[0]}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-xs text-neutral-500">
              {new Date(loan.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => onViewDetails(loan)}>
                {t.details}
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {loans.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-10 text-neutral-500">
              No applications found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
