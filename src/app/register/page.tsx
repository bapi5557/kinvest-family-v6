
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Wallet, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { firebaseConfig } from '@/firebase/config';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const isConfigDummy = firebaseConfig.apiKey === 'dummy-api-key';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isConfigDummy) {
      toast({
        title: "Configuration Error",
        description: "Firebase is using placeholder credentials. Please connect a real Firebase project.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Registration Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        toast({
          title: "Success!",
          description: "Your family registry has been created.",
        });
        router.push('/');
      }
    } catch (error: any) {
      console.error("Registration Error Details:", error);
      
      let message = error.message || "An unexpected error occurred.";
      
      if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Please enter a valid email address.";
      } else if (error.code === 'auth/operation-not-allowed') {
        message = "Email/password registration is not enabled in the Firebase Console.";
      } else if (error.code === 'auth/network-request-failed') {
        message = "Network error. Please check your connection.";
      }

      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <div className="mb-8 flex flex-col items-center text-center gap-2">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-accent shadow-xl shadow-primary/20">
          <Wallet size={32} />
        </div>
        <h1 className="text-3xl font-headline font-bold text-foreground mt-4">Kincash</h1>
        <p className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">Join the Financial Hub</p>
      </div>

      {isConfigDummy && (
        <div className="max-w-md w-full mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="font-bold uppercase mb-1">Dummy Config Detected</p>
            <p>The app is running with placeholder Firebase keys. Registration will fail until you provide a valid Firebase configuration.</p>
          </div>
        </div>
      )}

      <Card className="w-full max-w-md glass-card border-none">
        <CardHeader>
          <CardTitle className="font-headline">Create Registry</CardTitle>
          <CardDescription>Setup your shared family account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Shared Family Email</label>
              <Input
                type="email"
                placeholder="family@kincash.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-card/50 h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">PIN / Password (min 6 chars)</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-card/50 h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Confirm PIN</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-card/50 h-12"
              />
            </div>
            <Button type="submit" className="w-full btn-cyan py-6 font-bold" disabled={loading}>
              {loading ? "CREATING..." : "CREATE FAMILY REGISTRY"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
