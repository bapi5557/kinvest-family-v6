
export type ExpenseCategory = 
  | 'Electric Bill' 
  | 'LPG Cylinder' 
  | 'House Rent' 
  | 'Groceries' 
  | 'Medical' 
  | 'Education' 
  | 'Other Expenses';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  createdAt: number;
}

export interface Expense {
  id: string;
  memberId: string;
  memberName: string;
  category: ExpenseCategory;
  amount: number;
  note?: string;
  date: number; // timestamp
}

export interface Family {
  id: string;
  familyName: string;
  adminEmail: string;
  currency: string;
}
