export interface AppUser {
  id: string;
  authUserId: string | null;
  username: string | null;
  nickname: string | null;
  userCode: string;
  createdAt: string;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: "pending" | "accepted";
  friend?: AppUser;
}

export type LoanType = "give" | "take";
export type RepaymentType = "pay" | "receive";
export type LoanStatus = "pending_borrower_approval" | "completed" | "rejected";
export type RepaymentStatus = "pending_lender_approval" | "completed" | "rejected";
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
  approvalToken: string | null;
  createdBy: string | null;
  approvedBy: string | null;
  createdAt: string;
  approvedAt: string | null;
}

export interface Repayment {
  id: string;
  loanId: string;
  amount: number;
  currency: string;
  repaymentDate: string;
  memo: string;
  type: RepaymentType;
  status: RepaymentStatus;
  createdBy: string | null;
  approvedBy: string | null;
  personName: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: "loan_created" | "repayment_recorded";
  loanId: string | null;
  repaymentId: string | null;
  transactionDate: string;
  senderBank: string | null;
  senderAccount: string | null;
  recipientBank: string | null;
  recipientAccount: string | null;
  memo: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  relatedLoanId: string | null;
  relatedRepaymentId: string | null;
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
