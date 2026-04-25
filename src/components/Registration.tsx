import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface RegistrationProps {
  user: FirebaseUser;
  onComplete: () => void;
}

export const Registration: React.FC<RegistrationProps> = ({ user, onComplete }) => {
  const [formData, setFormData] = useState({
    name: user.displayName || '',
    idNumber: '',
    income: '',
    role: 'member' as 'member' | 'monitor'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.idNumber || !formData.income) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      const profile: UserProfile = {
        uid: user.uid,
        name: formData.name,
        idNumber: formData.idNumber,
        income: parseFloat(formData.income),
        role: formData.role,
        balance: 0,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid), profile);
      onComplete();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save profile.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>We need a few more details to get you started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>National ID / Passport</Label>
              <Input value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Monthly Income ($)</Label>
              <Input type="number" value={formData.income} onChange={e => setFormData({...formData, income: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>I am a...</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v as any})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member (Borrower)</SelectItem>
                  <SelectItem value="monitor">Monitor (Officer)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-neutral-900">Finish Setup</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
