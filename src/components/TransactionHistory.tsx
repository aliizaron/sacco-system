import React from 'react';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Banknote, 
  CreditCard, 
  Smartphone 
} from 'lucide-react';
import { Transaction } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface TransactionHistoryProps {
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
  translations: any;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions, 
  formatCurrency, 
  translations: t 
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.status}</TableHead>
          <TableHead>{t.method}</TableHead>
          <TableHead>{t.amount}</TableHead>
          <TableHead>{t.status}</TableHead>
          <TableHead>{t.date}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t_item) => (
          <TableRow key={t_item.id}>
            <TableCell className="font-medium capitalize">
              <div className="flex items-center gap-2">
                {t_item.type === 'deposit' ? <ArrowDownCircle className="w-4 h-4 text-green-500" /> : 
                 t_item.type === 'withdrawal' ? <ArrowUpCircle className="w-4 h-4 text-red-500" /> : 
                 <Banknote className="w-4 h-4 text-blue-500" />}
                {t_item.type.replace('_', ' ')}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {t_item.method === 'Bank' ? <CreditCard className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                {t_item.method} {t_item.bankName && `(${t_item.bankName})`}
              </div>
            </TableCell>
            <TableCell className={t_item.type === 'deposit' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
              {t_item.type === 'deposit' ? '+' : '-'}{formatCurrency(t_item.amount)}
            </TableCell>
            <TableCell>
              <Badge variant={t_item.status === 'completed' ? 'secondary' : 'outline'}>{t_item.status}</Badge>
            </TableCell>
            <TableCell className="text-xs text-neutral-500">
              {new Date(t_item.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
        {transactions.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-10 text-neutral-500">
              No transactions found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
