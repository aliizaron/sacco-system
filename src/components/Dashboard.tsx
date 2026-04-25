import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  UserCircle, 
  LogOut, 
  Plus, 
  MessageSquare, 
  ShieldAlert, 
  TrendingUp,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  Smartphone,
  Banknote,
  Upload,
  Search,
  Filter,
  Calendar as CalendarIcon,
  ShieldCheck,
  Send
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

import { analyzeLoanRisk, chatWithGemini } from '../lib/gemini';
import { 
  Language, 
  Currency, 
  UserProfile, 
  Transaction, 
  LoanApplication, 
  ChatMessage 
} from '../types';
import { EXCHANGE_RATES, TRANSLATIONS } from '../constants';
import { LanguageSelector } from './LanguageSelector';
import { CurrencySelector } from './CurrencySelector';
import { LoanApplicationTable } from './LoanApplicationTable';
import { LoanApplicationDetails } from './LoanApplicationDetails';
import { StatsHero } from './StatsHero';
import { LoanApplicationForm } from './LoanApplicationForm';
import { WalletTab } from './WalletTab';
import { AdvisorTab } from './AdvisorTab';
import { PresentationMode } from './PresentationMode';
import { Presentation } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  onSwitchRole?: (role: 'admin' | 'member' | 'monitor') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, onSwitchRole }) => {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Localization State
  const [lang, setLang] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('UGX');

  const t = TRANSLATIONS[lang];

  const formatCurrency = (amount: number) => {
    const converted = amount * EXCHANGE_RATES[currency];
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'UGX' ? 0 : 2
    }).format(converted);
  };

  useEffect(() => {
    if (profile.uid.startsWith('guest_')) return;

    const qLoans = profile.role === 'member' 
      ? query(collection(db, 'loans'), where('userId', '==', profile.uid), orderBy('createdAt', 'desc'))
      : query(collection(db, 'loans'), orderBy('createdAt', 'desc'));

    const unsubscribeLoans = onSnapshot(qLoans, (snapshot) => {
      setLoans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplication)));
    });

    const qTransactions = profile.role === 'member'
      ? query(collection(db, 'transactions'), where('userId', '==', profile.uid), orderBy('createdAt', 'desc'))
      : query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));

    const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    });

    if (profile.role === 'admin' || profile.role === 'monitor') {
      const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        setUsers(snapshot.docs.map(doc => doc.data() as UserProfile));
      });
      return () => {
        unsubscribeLoans();
        unsubscribeTransactions();
        unsubscribeUsers();
      };
    }

    return () => {
      unsubscribeLoans();
      unsubscribeTransactions();
    };
  }, [profile]);

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      (loan.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || loan.riskScore === riskFilter;
    
    const loanDate = new Date(loan.createdAt);
    const matchesDate = (!dateRange.start || loanDate >= new Date(dateRange.start)) &&
                        (!dateRange.end || loanDate <= new Date(dateRange.end));

    return matchesSearch && matchesStatus && matchesRisk && matchesDate;
  });

  const handleApply = async (data: {
    amount: number;
    purpose: string;
    collateralType: LoanApplication['collateral']['type'];
    collateralDescription: string;
    collateralValue?: number;
    disbursementMethod: LoanApplication['disbursementMethod'];
    disbursementAccount: string;
  }) => {
    setIsApplying(true);
    try {
      let riskResult = null;
      
      if (navigator.onLine) {
        // Calculate history stats
        const userLoans = loans.filter(l => l.userId === profile.uid);
        const history = {
          totalLoans: userLoans.length,
          paidOnTime: userLoans.filter(l => l.status === 'approved').length, // Simplified: assumes approved loans are being paid
          latePayments: 0, // Mock history for now
          activeLoansBalance: userLoans
            .filter(l => l.status === 'approved')
            .reduce((acc, curr) => acc + curr.amount, 0)
        };

        // Calculate transaction stats (last 30 days inflow/outflow)
        const userTransactions = transactions.filter(t => t.userId === profile.uid);
        const inflow = userTransactions
          .filter(t => t.type === 'deposit')
          .reduce((acc, curr) => acc + curr.amount, 0);
        const outflow = userTransactions
          .filter(t => t.type === 'withdrawal' || t.type === 'loan_payment')
          .reduce((acc, curr) => acc + curr.amount, 0);

        const transactionsData = {
          avgMonthlyInflow: inflow, // Simplified
          avgMonthlyOutflow: outflow,
          totalTransactionsCount: userTransactions.length,
          currentBalance: profile.balance || 0
        };

        try {
          riskResult = await analyzeLoanRisk({
            loanAmount: data.amount,
            loanPurpose: data.purpose,
            income: profile.income,
            collateral: {
              type: data.collateralType,
              description: data.collateralDescription,
              estimatedValue: data.collateralValue
            },
            history,
            transactions: transactionsData
          });
        } catch (aiError) {
          console.warn("AI Assessment failed, falling back to manual review", aiError);
        }
      }

      const newLoan: Omit<LoanApplication, 'id'> = {
        userId: profile.uid,
        userName: profile.name,
        amount: data.amount,
        purpose: data.purpose,
        status: data.amount > 10000000 ? 'pending' : 
                (riskResult?.qualificationStatus === 'Qualified' ? 'approved' : 
                 riskResult?.qualificationStatus === 'Not Qualified' ? 'rejected' : 'pending'),
        riskScore: riskResult?.riskScore || 'Medium',
        qualificationStatus: riskResult?.qualificationStatus || 'Conditional',
        riskJustification: riskResult?.justification || (navigator.onLine ? 'AI assessment failed. Pending manual review.' : 'Submitted offline. AI assessment will run when reconnected.'),
        suggestedAmount: riskResult?.suggestedAmount,
        verificationChecks: riskResult?.verificationChecks || [
          { check: 'Identity Verification', status: 'Warning', reason: 'Pending connection' },
          { check: 'Income Verification', status: 'Warning', reason: 'Pending connection' }
        ],
        collateral: {
          type: data.collateralType,
          description: data.collateralDescription,
          evaluation: riskResult?.collateralEvaluation || 'Pending evaluation',
          value: data.collateralValue
        },
        disbursementMethod: data.disbursementMethod,
        disbursementAccount: data.disbursementAccount,
        createdAt: new Date().toISOString()
      };

      if (profile.uid.startsWith('guest_')) {
        setLoans(prev => [{ id: Math.random().toString(), ...newLoan } as LoanApplication, ...prev]);
        toast.info("Guest mode: Loan simulated.");
      } else {
        await addDoc(collection(db, 'loans'), newLoan);
        if (newLoan.status === 'approved') {
          const userRef = doc(db, 'users', profile.uid);
          const currentBalance = profile.balance || 0;
          await setDoc(userRef, { balance: currentBalance + data.amount }, { merge: true });
          
          // Log as transaction
          await addDoc(collection(db, 'transactions'), {
            userId: profile.uid,
            userName: profile.name,
            type: 'deposit',
            amount: data.amount,
            method: data.disbursementMethod,
            accountNumber: data.disbursementAccount,
            status: 'completed',
            createdAt: new Date().toISOString(),
            description: `Auto-Approved Loan Disbursement`
          });
          
          toast.success("System automatically APPROVED and DISBURSED your loan!");
        } else if (newLoan.status === 'rejected') {
          toast.error(`Rejection Reason: ${newLoan.riskJustification.split('.')[0]}.`, {
            description: "Check 'Details' for full analysis.",
            duration: 6000
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit application.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleTransaction = async (data: {
    type: Transaction['type'];
    amount: number;
    method: Transaction['method'];
    bankName?: string;
    accountNumber: string;
  }) => {
    setIsTransacting(true);
    try {
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: profile.uid,
        userName: profile.name,
        type: data.type,
        amount: data.amount,
        method: data.method,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        status: 'completed',
        createdAt: new Date().toISOString()
      };

      if (profile.uid.startsWith('guest_')) {
        setTransactions(prev => [newTransaction, ...prev]);
      } else {
        await addDoc(collection(db, 'transactions'), newTransaction);
        const userRef = doc(db, 'users', profile.uid);
        const currentBalance = profile.balance || 0;
        const newBalance = data.type === 'deposit' ? currentBalance + data.amount : currentBalance - data.amount;
        await setDoc(userRef, { balance: newBalance }, { merge: true });
      }

      toast.success(`${data.type.replace('_', ' ')} of ${formatCurrency(data.amount)} successful via ${data.method}`);
    } catch (error) {
      console.error(error);
      toast.error("Transaction failed.");
    } finally {
      setIsTransacting(false);
    }
  };

  const seedSystemData = async () => {
    if (!confirm("This will add demonstration data of multiple applicants to the system. Proceed?")) return;
    
    try {
      const mockUsers = [
        { uid: 'mock_user_1', name: 'John Doe', income: 4500000, idNumber: 'UG12345678', role: 'member', balance: 500000, createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString() },
        { uid: 'mock_user_2', name: 'Sarah Namono', income: 1200000, idNumber: 'UG87654321', role: 'member', balance: 50000, createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
        { uid: 'mock_user_3', name: 'Robert Okello', income: 8000000, idNumber: 'UG45678912', role: 'member', balance: 2500000, createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString() },
        { uid: 'mock_user_4', name: 'Grace Akello', income: 2500000, idNumber: 'UG98765432', role: 'member', balance: 150000, createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString() },
        { uid: 'mock_user_5', name: 'David Ssali', income: 15000000, idNumber: 'UG11223344', role: 'member', balance: 12500000, createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
        { uid: 'mock_user_6', name: 'Mary Atieno', income: 3000000, idNumber: 'UG55667788', role: 'member', balance: 800000, createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString() },
      ];

      const mockLoans: Omit<LoanApplication, 'id'>[] = [
        {
          userId: profile.uid,
          userName: profile.name,
          amount: 5000000,
          purpose: 'Small Business Expansion',
          status: 'approved',
          riskScore: 'Low',
          qualificationStatus: 'Qualified',
          riskJustification: 'Excellent previous payment history and stable income from retail business.',
          suggestedAmount: 5000000,
          verificationChecks: [{ check: 'Income', status: 'Passed', reason: 'Verified via bank statements' }],
          collateral: { type: 'Property', description: 'Small Plot in Mukono', value: 15000000 },
          disbursementMethod: 'Bank',
          disbursementAccount: '0123456789',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          userId: 'mock_user_5',
          userName: 'David Ssali',
          amount: 25000000,
          purpose: 'Commercial Poultry Farm Setup',
          status: 'pending',
          riskScore: 'Low',
          qualificationStatus: 'Qualified',
          riskJustification: 'Even though AI marks this as Low Risk and Qualified, the amount exceeds 10M UGX and requires mandatory human verification. Cash flow from other ventures is strong.',
          suggestedAmount: 35000000,
          verificationChecks: [
            { check: 'Threshold Check', status: 'Warning', reason: 'Value > 10M requires Officer Audit' },
            { check: 'Collateral Registry', status: 'Passed', reason: 'Clean land title verified' }
          ],
          collateral: { type: 'Property', description: '2 Acres in Wakiso', value: 120000000 },
          disbursementMethod: 'Bank',
          disbursementAccount: '1122334455',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          userId: 'mock_user_1',
          userName: 'John Doe',
          amount: 15000000,
          purpose: 'Buy Delivery Van',
          status: 'pending',
          riskScore: 'Medium',
          qualificationStatus: 'Conditional',
          riskJustification: 'Applicant has sufficient income but the requested amount is significantly higher than previous loans. Manual verification of the business plan is recommended.',
          suggestedAmount: 10000000,
          verificationChecks: [
            { check: 'Business Plan', status: 'Warning', reason: 'Requires manual audit' },
            { check: 'Income', status: 'Passed', reason: 'Consistent monthly deposits' }
          ],
          collateral: { type: 'Vehicle', description: 'Toyota Hiace (Logbook)', value: 12000000 },
          disbursementMethod: 'Bank',
          disbursementAccount: '8877665544',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          userId: 'mock_user_2',
          userName: 'Sarah Namono',
          amount: 5000000,
          purpose: 'Emergency Medical Expenses',
          status: 'rejected',
          riskScore: 'Critical',
          qualificationStatus: 'Not Qualified',
          riskJustification: 'Loan amount exceeds 3x monthly income with zero collateral value provided. Repayment probability is critically low under current conditions.',
          suggestedAmount: 500000,
          verificationChecks: [
            { check: 'Collateral', status: 'Failed', reason: 'Insufficient value' },
            { check: 'Income-to-Debt', status: 'Failed', reason: 'Exceeds thresholds' }
          ],
          collateral: { type: 'Other', description: 'Household Goods', value: 300000 },
          disbursementMethod: 'MTN',
          disbursementAccount: '0775554443',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          userId: 'mock_user_3',
          userName: 'Robert Okello',
          amount: 25000000,
          purpose: 'Home Improvement',
          status: 'approved',
          riskScore: 'Low',
          qualificationStatus: 'Qualified',
          riskJustification: 'High net worth individual with significant cash flow surplus. Collateral coverage ratio is over 2.0x.',
          suggestedAmount: 40000000,
          verificationChecks: [{ check: 'Net Worth', status: 'Passed', reason: 'Verified assets' }],
          collateral: { type: 'Property', description: 'Commercial Unit in Kampala', value: 85000000 },
          disbursementMethod: 'Bank',
          disbursementAccount: '9988776655',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            userId: 'mock_user_6',
            userName: 'Mary Atieno',
            amount: 1500000,
            purpose: 'Produce Trading Stock',
            status: 'approved',
            riskScore: 'Low',
            qualificationStatus: 'Qualified',
            riskJustification: 'Consistent small-scale trader with excellent turnover. Small but reliable cash buffer.',
            suggestedAmount: 3000000,
            verificationChecks: [{ check: 'Trade License', status: 'Passed', reason: 'Valid KCCA permit' }],
            collateral: { type: 'Business', description: 'Market Stall Inventory', value: 2500000 },
            disbursementMethod: 'Airtel',
            disbursementAccount: '0701122334',
            createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
          }
      ];

      const mockTransactions: Omit<Transaction, 'id'>[] = [
        { userId: profile.uid, userName: profile.name, amount: 1000000, type: 'deposit', method: 'MTN', accountNumber: '0771234567', status: 'completed', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        { userId: 'mock_user_1', userName: 'John Doe', amount: 4500000, type: 'deposit', method: 'Bank', accountNumber: '8877665544', status: 'completed', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { userId: 'mock_user_3', userName: 'Robert Okello', amount: 15000000, type: 'deposit', method: 'Bank', accountNumber: '9988776655', status: 'completed', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { userId: 'mock_user_5', userName: 'David Ssali', amount: 35000000, type: 'deposit', method: 'Bank', accountNumber: '1122334455', status: 'completed', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        { userId: 'mock_user_6', userName: 'Mary Atieno', amount: 800000, type: 'deposit', method: 'Airtel', accountNumber: '0701122334', status: 'completed', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
      ];

      if (!profile.uid.startsWith('guest_')) {
        for (const user of mockUsers) await setDoc(doc(db, 'users', user.uid), user);
        for (const loan of mockLoans) await addDoc(collection(db, 'loans'), loan);
        for (const tx of mockTransactions) await addDoc(collection(db, 'transactions'), tx);
      } else {
        // Simulated local seed for guest demo
        setLoans(prev => [...mockLoans.map(l => ({ id: Math.random().toString(), ...l } as LoanApplication)), ...prev]);
        setTransactions(prev => [...mockTransactions.map(t => ({ id: Math.random().toString(), ...t } as Transaction)), ...prev]);
      }
      
      toast.success("Demonstration data for all offices seeded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to seed data.");
    }
  };

  const handleAction = async (loanId: string, status: 'approved' | 'rejected') => {
    try {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) return;

      if (profile.uid.startsWith('guest_')) {
        setLoans(prev => prev.map(l => l.id === loanId ? { ...l, status } : l));
        if (status === 'approved') {
          toast.success(`Guest mode: ${formatCurrency(loan.amount)} added to simulated balance.`);
        }
      } else {
        await setDoc(doc(db, 'loans', loanId), { status }, { merge: true });
        
        if (status === 'approved') {
          const userRef = doc(db, 'users', loan.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data() as UserProfile;
            const newBalance = (userData.balance || 0) + loan.amount;
            await setDoc(userRef, { balance: newBalance }, { merge: true });
            
            // Log as transaction
            await addDoc(collection(db, 'transactions'), {
              userId: loan.userId,
              userName: loan.userName,
              type: 'deposit',
              amount: loan.amount,
              method: loan.disbursementMethod,
              accountNumber: loan.disbursementAccount,
              status: 'completed',
              createdAt: new Date().toISOString(),
              description: `Loan Disbursement: ${loan.id}`
            });
          }
        }
      }
      toast.success(`Loan ${status} successfully.`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update loan.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-neutral-900" />
            <span className="font-bold text-xl tracking-tight">{t.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
                variant="ghost" 
                size="sm" 
                className="hidden lg:flex items-center gap-2 text-neutral-500 hover:text-neutral-900 border-none"
                onClick={() => setIsPresenting(true)}
              >
                <Presentation className="w-4 h-4" />
                <span>Present</span>
              </Button>
            <LanguageSelector value={lang} onChange={setLang} />
            <CurrencySelector value={currency} onChange={setCurrency} />
            {onSwitchRole && (
              <Select onValueChange={(v) => onSwitchRole(v as any)} value={profile.role}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Switch Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Client View</SelectItem>
                  <SelectItem value="monitor">Monitor View</SelectItem>
                  <SelectItem value="admin">Admin View</SelectItem>
                </SelectContent>
              </Select>
            )}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{profile.name}</p>
              <p className="text-xs text-neutral-500 capitalize">{profile.role}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => profile.uid.startsWith('guest_') ? window.location.reload() : signOut(auth)}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <StatsHero 
          profile={profile} 
          loans={loans} 
          transactions={transactions} 
          formatCurrency={formatCurrency} 
          translations={t}
          onApplyClick={
            <LoanApplicationForm 
              profile={profile} 
              onSubmit={handleApply} 
              isSubmitting={isApplying} 
              translations={t} 
            />
          }
        />

        <Tabs defaultValue="applications" className="w-full">
          <TabsList className={`grid w-full ${(profile.role === 'admin' || profile.role === 'monitor') ? 'grid-cols-4' : 'grid-cols-3'} mb-8`}>
            <TabsTrigger value="applications" className="gap-2">
              <FileText className="w-4 h-4" />
              {t.applications}
            </TabsTrigger>
            <TabsTrigger value="wallet" className="gap-2">
              <Wallet className="w-4 h-4" />
              {t.wallet}
            </TabsTrigger>
            {(profile.role === 'admin' || profile.role === 'monitor') && (
              <TabsTrigger value="members" className="gap-2">
                <UserCircle className="w-4 h-4" />
                {t.members}
              </TabsTrigger>
            )}
            <TabsTrigger value="advisor" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              {t.advisor}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>{t.recentApps}</CardTitle>
                    <CardDescription>View and manage loan requests.</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {profile.role === 'member' && (
                      <div className="mr-2">
                        <LoanApplicationForm 
                          profile={profile} 
                          onSubmit={handleApply} 
                          isSubmitting={isApplying} 
                          translations={t} 
                          compact
                        />
                      </div>
                    )}
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                      <Input
                        placeholder={t.search}
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[130px]">
                        <Filter className="w-3 h-3 mr-2" />
                        <SelectValue placeholder={t.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={riskFilter} onValueChange={setRiskFilter}>
                      <SelectTrigger className="w-[130px]">
                        <ShieldAlert className="w-3 h-3 mr-2" />
                        <SelectValue placeholder={t.risk} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Risk</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {t.dates}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Filter by Date Range</DialogTitle>
                          <DialogDescription>Select a start and end date to filter applications.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="start-date" className="text-right">Start</Label>
                            <Input
                              id="start-date"
                              type="date"
                              className="col-span-3"
                              value={dateRange.start}
                              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="end-date" className="text-right">End</Label>
                            <Input
                              id="end-date"
                              type="date"
                              className="col-span-3"
                              value={dateRange.end}
                              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDateRange({ start: '', end: '' })}>Clear</Button>
                          <Button onClick={() => {}}>Apply</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <LoanApplicationTable 
                  loans={filteredLoans} 
                  profile={profile} 
                  formatCurrency={formatCurrency} 
                  translations={t} 
                  onViewDetails={setSelectedLoan}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet">
            <WalletTab 
              profile={profile}
              transactions={transactions}
              currency={currency}
              formatCurrency={formatCurrency}
              translations={t}
              onTransaction={handleTransaction}
              isTransacting={isTransacting}
            />
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>SACCO Members</CardTitle>
                <CardDescription>Overview of all registered members and their status.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Income</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.uid}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.idNumber}</TableCell>
                        <TableCell>{formatCurrency(u.income)}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(u.balance || 0)}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{u.role}</Badge></TableCell>
                        <TableCell className="text-xs text-neutral-500">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advisor">
            <AdvisorTab profile={profile} translations={t} />
          </TabsContent>
        </Tabs>

        <div className="mt-8 pt-8 border-t">
          <Card className="bg-neutral-50 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">System Tools</CardTitle>
              <CardDescription className="text-xs text-neutral-500">
                Populate the system with demonstration data for testing the AI analysis features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" onClick={seedSystemData}>
                Seed Sample History (Income, Transactions & Previous Loans)
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={!!selectedLoan} onOpenChange={(open) => !open && setSelectedLoan(null)}>
        {selectedLoan && (
          <LoanApplicationDetails 
            loan={selectedLoan} 
            profile={profile} 
            formatCurrency={formatCurrency} 
            onAction={handleAction}
          />
        )}
      </Dialog>

      <AnimatePresence>
        {isPresenting && <PresentationMode onClose={() => setIsPresenting(false)} />}
      </AnimatePresence>

      <Toaster />
    </div>
  );
};
