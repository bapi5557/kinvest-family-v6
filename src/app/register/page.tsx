
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validations
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
      let message = "An unexpected error occurred.";
      
      if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Please enter a valid email address.";
      } else if (error.code === 'auth/operation-not-allowed') {
        message = "Email/password registration is not enabled.";
      } else {
        message = error.message;
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
