
'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<{
    firebaseApp: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const instances = initializeFirebase();
      setFirebase(instances);
    } catch (err: any) {
      console.error("Firebase initialization failed:", err);
      setError(err.message || "Unknown initialization error");
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <div className="flex flex-col items-center text-center gap-6 max-w-md glass-card p-8 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertCircle size={32} />
          </div>
          <div>
            <h1 className="text-xl font-headline font-bold text-foreground">Gateway Failure</h1>
            <p className="text-muted-foreground text-sm mt-2">Could not connect to the financial backend.</p>
            <div className="mt-4 p-3 bg-black/20 rounded-lg text-xs font-mono text-destructive break-all">
              {error}
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            RETRY CONNECTION
          </Button>
        </div>
      </div>
    );
  }

  if (!firebase) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="text-muted-foreground font-headline text-sm animate-pulse">CONNECTING TO KINCASH GATEWAY...</p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={firebase.firebaseApp}
      firestore={firebase.firestore}
      auth={firebase.auth}
    >
      {children}
    </FirebaseProvider>
  );
}
