export type Language = 'en' | 'sw' | 'lg';
export type Currency = 'UGX' | 'USD' | 'KES' | 'EUR' | 'GBP';

export interface UserProfile {
  uid: string;
  name: string;
  idNumber: string;
  income: number;
  role: 'admin' | 'member' | 'monitor';
  balance?: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  type: 'deposit' | 'withdrawal' | 'loan_payment';
  amount: number;
  method: 'MTN' | 'Airtel' | 'Bank';
  bankName?: string;
  accountNumber: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export interface VerificationCheck {
  check: string;
  status: 'Passed' | 'Failed' | 'Warning';
  reason: string;
}

export interface Collateral {
  type: 'Property' | 'Vehicle' | 'Business' | 'Other';
  description: string;
  evaluation?: string;
  value?: number;
}

export interface LoanApplication {
  id: string;
  userId: string;
  userName?: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  riskScore: 'Low' | 'Medium' | 'High' | 'Critical';
  qualificationStatus: 'Qualified' | 'Not Qualified' | 'Conditional';
  riskJustification: string;
  suggestedAmount?: number;
  collateral: Collateral;
  disbursementMethod: 'MTN' | 'Airtel' | 'Bank';
  disbursementAccount: string;
  verificationChecks: VerificationCheck[];
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
