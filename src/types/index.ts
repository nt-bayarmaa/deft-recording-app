export interface Contact {
  id: string;
  name: string;
  nickname?: string | null;
  linkedUserId?: string | null;
  ownerUserId: string;
}

export interface UserProfile {
  userId: string;
  username: string | null;
  userCode: string;
}

export type LoanType = "give" | "take";
export type RepaymentType = "pay" | "receive";
export type LoanStatus = "pending" | "approved" | "rejected";
export type NotificationType = "loan_request" | "repayment_recorded";

export interface Loan {
  id: string;
  lenderId: string;
  borrowerId: string;
  amount: number;
  currency: string;
  loanDate: string;
  dueDate: string;
  memo: string;
  type: LoanType;
  status: LoanStatus;
  approvalToken?: string | null;
  senderBank?: string | null;
  senderAccount?: string | null;
  recipientBank?: string | null;
  recipientAccount?: string | null;
  createdBy?: string | null;
  approvedBy?: string | null;
  createdAt: string;
}

export interface Repayment {
  id: string;
  loanId: string;
  amount: number;
  currency: string;
  repaymentDate: string;
  memo: string;
  type: RepaymentType;
  status: string;
  createdBy?: string | null;
  personName: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  relatedLoanId?: string | null;
  relatedRepaymentId?: string | null;
  read: boolean;
  message: string;
  amount: number;
  currency: string;
  personName: string;
  createdAt: string;
}

export interface LoanSelectItem {
  id: string;
  amount: number;
  loanDate: string;
  dueDate: string;
  memo: string;
}

export interface PersonBalance {
  personId: string;
  name: string;
  balance: number;
  currency: string;
  hasPending: boolean;
}
