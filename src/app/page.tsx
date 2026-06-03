
"use client";

import { useMemo, useEffect } from "react";
import { collection, query, orderBy } from "firebase/firestore";
import { useFirestore, useUser, useCollection } from "@/firebase";
import { Expense, FamilyMember } from "@/app/lib/types";
import { MobileNav } from "@/components/layout/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wallet, TrendingUp, Users as UsersIcon, PlusCircle, ArrowUpRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const membersQuery = useMemo(() => query(collection(firestore, "members"), orderBy("name")), [firestore]);
  const expensesQuery = useMemo(() => query(collection(firestore, "expenses"), orderBy("date", "desc")), [firestore]);

  const { data: members, loading: membersLoading } = useCollection<FamilyMember>(membersQuery);
  const { data: expenses, loading: expensesLoading } = useCollection<Expense>(expensesQuery);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        <p className="text-muted-foreground font-headline text-sm animate-pulse uppercase tracking-widest">Securing Gateway...</p>
      </div>
    );
  }

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const currentMonthExpenses = expenses.filter(e => {
    const date = new Date(e.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const monthTotal = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const budget = 5000;
  const budgetPercentage = Math.min((monthTotal / budget) * 100, 100);

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="p-6 pt-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Kincash</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-semibold mt-1">Family Financial Hub</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-accent/20 flex items-center justify-center text-accent">
          <Activity size={20} />
        </div>
      </header>

      <main className="px-6 space-y-6 fade-in">
        {/* Main spending card */}
        <Card className="glass-card border-none overflow-hidden relative p-1">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Wallet size={100} />
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Monthly Shared Spending</span>
              <div className="text-5xl font-headline font-bold text-accent">
                ${monthTotal.toLocaleString()}
              </div>
            </div>
            
            <div className="mt-8 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase">
                <span className="text-muted-foreground">Budget Utilization</span>
                <span className={budgetPercentage > 90 ? "text-destructive" : "text-accent"}>
                  {budgetPercentage.toFixed(0)}%
                </span>
              </div>
              <Progress value={budgetPercentage} className="h-2 bg-white/10" />
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="text-emerald-400 w-3 h-3" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-tight">Standard family limit: $5,000.00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-primary/20 border border-primary/30 rounded-2xl">
            <CardContent className="p-5 flex flex-col gap-1">
              <UsersIcon className="text-accent w-5 h-5 mb-2" />
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Active Roster</span>
              <span className="text-2xl font-headline font-bold">{members.length}</span>
            </CardContent>
          </Card>
          <Card className="bg-secondary/40 border border-white/5 rounded-2xl">
            <CardContent className="p-5 flex flex-col gap-1">
              <ArrowUpRight className="text-destructive w-5 h-5 mb-2" />
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Lifetime Exp</span>
              <span className="text-2xl font-headline font-bold">${(totalExpense / 1000).toFixed(1)}k</span>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-headline font-semibold">Ledger Stream</h2>
            <Link href="/reports">
              <Button variant="link" className="text-accent text-xs p-0 font-bold uppercase tracking-widest">Analytics</Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {expenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 rounded-2xl bg-card/40 border border-white/5 horizontal-slide-enter">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-xs font-bold text-accent uppercase">
                    {expense.category.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{expense.category}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">{expense.memberName} • {format(expense.date, 'MMM d')}</span>
                  </div>
                </div>
                <div className="font-headline font-bold text-foreground">
                  -${expense.amount.toFixed(2)}
                </div>
              </div>
            ))}
            {expenses.length === 0 && !expensesLoading && (
              <div className="text-center py-16 bg-card/20 rounded-2xl border border-dashed border-white/10 text-muted-foreground italic text-sm">
                The ledger is currently empty.
              </div>
            )}
          </div>
        </div>

        <Link href="/members" className="block pt-2">
          <Button className="w-full btn-cyan py-7 font-headline font-bold gap-3 rounded-2xl shadow-xl shadow-accent/10">
            <PlusCircle className="w-6 h-6" />
            RECORD FAMILY EXPENSE
          </Button>
        </Link>
      </main>

      <MobileNav />
    </div>
  );
}
