import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ShieldAlert } from 'lucide-react';

export const Login = () => {
  const isDummyConfig = auth.app.options.apiKey === "AIzaSyDummyKey";
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [manualConfigInput, setManualConfigInput] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
      toast.error("Login failed. Check your Firebase config.");
    }
  };

  const handleEmailAction = async (type: 'login' | 'signup') => {
    try {
      if (type === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error(error);
      toast.error(`${type === 'login' ? 'Login' : 'Signup'} failed.`);
    }
  };

  const handleManualConfig = () => {
    try {
      const config = JSON.parse(manualConfigInput);
      localStorage.setItem('firebase_manual_config', JSON.stringify(config));
      toast.success("Config saved! Please refresh the page.");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      toast.error("Invalid JSON format.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-none shadow-none">
        <CardHeader className="text-center">
          <div className="mx-auto bg-neutral-900 p-3 rounded-2xl w-fit mb-4">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Secure Access</CardTitle>
          <CardDescription>Sign in to your SACCO account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEmailLogin ? (
            <>
              <Button onClick={handleGoogleLogin} className="w-full h-12 text-lg bg-neutral-900 hover:bg-neutral-800" disabled={isDummyConfig}>
                Continue with Google
              </Button>
              <Button variant="outline" onClick={() => setIsEmailLogin(true)} className="w-full h-12">
                Use Email & Password
              </Button>
            </>
          ) : (
            <form 
              className="space-y-4" 
              onSubmit={(e) => { e.preventDefault(); handleEmailAction('login'); }}
            >
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">Login</Button>
                <Button type="button" onClick={() => handleEmailAction('signup')} variant="outline" className="flex-1">Sign Up</Button>
              </div>
              <Button type="button" variant="ghost" onClick={() => setIsEmailLogin(false)} className="w-full text-xs">Back to social login</Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {isDummyConfig && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="text-xs text-red-500">Firebase Quota Exceeded? Click here to fix.</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manual Firebase Configuration</DialogTitle>
                  <DialogDescription>
                    Paste your Firebase JSON config here to fix the "Quota Exceeded" issue.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <textarea 
                    className="w-full h-32 p-2 text-xs font-mono border rounded"
                    placeholder='{ "apiKey": "...", "authDomain": "...", ... }'
                    value={manualConfigInput}
                    onChange={e => setManualConfigInput(e.target.value)}
                  />
                  <Button onClick={handleManualConfig} className="w-full">Apply Configuration</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
