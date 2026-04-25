import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  UserCircle, 
  ShieldAlert 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/sonner';

import { UserProfile } from './types';
import { Login } from './components/Login';
import { Registration } from './components/Registration';
import { Dashboard } from './components/Dashboard';
import { WifiOff } from 'lucide-react';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guestRole, setGuestRole] = useState<'admin' | 'member' | 'monitor' | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile);
        }
      });
      return () => unsubscribe();
    } else {
      setProfile(null);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="w-12 h-12 rounded-full border-4 border-neutral-200 border-t-neutral-900 animate-spin" />
      </div>
    );
  }

  if (!user && guestRole) {
    const mockProfile: UserProfile = {
      uid: `guest_${guestRole}`,
      name: `Guest ${guestRole.charAt(0).toUpperCase() + guestRole.slice(1)}`,
      idNumber: 'GUEST-001',
      income: 5000,
      role: guestRole,
      balance: 1000,
      createdAt: new Date().toISOString()
    };
    return (
      <div className="flex flex-col min-h-screen">
        {!isOnline && (
          <div className="bg-amber-500 text-white text-xs py-1 px-4 flex items-center justify-center gap-2 sticky top-0 z-[100]">
            <WifiOff className="w-3 h-3" />
            <span>Offline Mode: Data will sync once reconnected.</span>
          </div>
        )}
        <Dashboard 
          profile={mockProfile} 
          onSwitchRole={(role) => setGuestRole(role)} 
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-50">
        {!isOnline && (
          <div className="bg-amber-500 text-white text-xs py-1 px-4 flex items-center justify-center gap-2 sticky top-0 z-[100]">
            <WifiOff className="w-3 h-3" />
            <span>Offline Mode: Data will sync once reconnected.</span>
          </div>
        )}
        <div className="flex flex-col items-center justify-center flex-1 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl"
        >
          <div className="text-center mb-12">
            <div className="mx-auto bg-neutral-900 p-4 rounded-3xl w-fit mb-6 shadow-xl">
              <ShieldAlert className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-neutral-900 mb-4">SACCO Risk Manager</h1>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
              Open access loan risk assessment system. Select your role to continue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-neutral-900 transition-all cursor-pointer group" onClick={() => setGuestRole('member')}>
              <CardHeader className="text-center">
                <div className="mx-auto bg-neutral-100 p-4 rounded-2xl group-hover:bg-neutral-900 group-hover:text-white transition-colors mb-4">
                  <UserCircle className="w-8 h-8" />
                </div>
                <CardTitle>Client / Borrower</CardTitle>
                <CardDescription>Apply for loans and check your risk score.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" className="w-full group-hover:bg-neutral-900 group-hover:text-white transition-colors">Enter as Client</Button>
              </CardFooter>
            </Card>

            <Card className="border-2 hover:border-neutral-900 transition-all cursor-pointer group" onClick={() => setGuestRole('monitor')}>
              <CardHeader className="text-center">
                <div className="mx-auto bg-neutral-100 p-4 rounded-2xl group-hover:bg-neutral-900 group-hover:text-white transition-colors mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <CardTitle>Monitor / Officer</CardTitle>
                <CardDescription>Monitor client accounts and evaluate behavior.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" className="w-full group-hover:bg-neutral-900 group-hover:text-white transition-colors">Enter as Monitor</Button>
              </CardFooter>
            </Card>

            <Card className="border-2 hover:border-neutral-900 transition-all cursor-pointer group" onClick={() => setGuestRole('admin')}>
              <CardHeader className="text-center">
                <div className="mx-auto bg-neutral-100 p-4 rounded-2xl group-hover:bg-neutral-900 group-hover:text-white transition-colors mb-4">
                  <LayoutDashboard className="w-8 h-8" />
                </div>
                <CardTitle>Administrator</CardTitle>
                <CardDescription>Full system control and oversight of all accounts.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" className="w-full group-hover:bg-neutral-900 group-hover:text-white transition-colors">Enter as Admin</Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="text-neutral-500 hover:text-neutral-900">
                  Advanced: Secure Login (Firebase)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <Login />
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
        <Toaster />
      </div>
    </div>
  );
}

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen">
        {!isOnline && (
          <div className="bg-amber-500 text-white text-xs py-1 px-4 flex items-center justify-center gap-2 sticky top-0 z-[100]">
            <WifiOff className="w-3 h-3" />
            <span>Offline Mode: Data will sync once reconnected.</span>
          </div>
        )}
        <Registration user={user} onComplete={() => {}} />
      </div>
    );
  }

  return (
    <>
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs py-1 px-4 flex items-center justify-center gap-2 sticky top-0 z-[100] animate-in fade-in slide-in-from-top duration-300">
          <WifiOff className="w-3 h-3" />
          <span>You are currently offline. Some features may be limited, but your data is saved locally.</span>
        </div>
      )}
      <Dashboard profile={profile} />
      <Toaster />
    </>
  );
}
