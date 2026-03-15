import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFriends, addFriend, createShadowUser } from "@/data/users";
import { getLoans, getLoansForPerson, getActiveLoansForPerson, createLoan, updateLoanStatus, getLoanByApprovalToken, getLoanById } from "@/data/loans";
import { getPeopleForRepayment } from "@/data/balances";
import { getRepayments, createRepayment, updateRepaymentStatus, getRepaymentByApprovalToken } from "@/data/repayments";
import { getNotifications, markNotificationAsRead } from "@/data/notifications";
import { createTransaction, getTransactionByLoanId } from "@/data/transactions";
import { getUserById } from "@/data/users";
import { useAuth } from "@/hooks/useAuth";

function useAppUserId() {
  const { appUser } = useAuth();
  return appUser?.id ?? "";
}

// --- Friends ---
export function useFriends() {
  const userId = useAppUserId();
  return useQuery({
    queryKey: ["friends", userId],
    queryFn: () => getFriends(userId),
    enabled: !!userId,
  });
}

// --- Loans ---
export function useLoans() {
  const userId = useAppUserId();
  return useQuery({
    queryKey: ["loans", userId],
    queryFn: () => getLoans(userId),
    enabled: !!userId,
  });
}

export function useCreateLoan() {
  const qc = useQueryClient();
  const userId = useAppUserId();
  return useMutation({
    mutationFn: createLoan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loans", userId] });
      qc.invalidateQueries({ queryKey: ["balances", userId] });
    },
  });
}

export function useUpdateLoanStatus() {
  const qc = useQueryClient();
  const userId = useAppUserId();
  return useMutation({
    mutationFn: ({ id, status, approvedBy }: { id: string; status: Parameters<typeof updateLoanStatus>[1]; approvedBy?: string }) =>
      updateLoanStatus(id, status, approvedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["balances"] });
    },
  });
}

export function useLoansForPerson(personId: string) {
  const userId = useAppUserId();
  return useQuery({
    queryKey: ["loans", "person", userId, personId],
    queryFn: () => getLoansForPerson(userId, personId),
    enabled: !!userId && !!personId,
  });
}

export function usePeopleForRepayment(repaymentType: "pay" | "receive") {
  const userId = useAppUserId();
  return useQuery({
    queryKey: ["peopleForRepayment", userId, repaymentType],
    queryFn: () => getPeopleForRepayment(userId, repaymentType),
    enabled: !!userId,
  });
}

export function useActiveLoansForPerson(personId: string, repaymentType: "pay" | "receive") {
  const userId = useAppUserId();
  return useQuery({
    queryKey: ["loans", "active", userId, personId, repaymentType],
    queryFn: () => getActiveLoansForPerson(userId, personId, repaymentType),
    enabled: !!userId && !!personId,
  });
}

export function useLoanByApprovalToken(token: string | null) {
  return useQuery({
    queryKey: ["loan", "approval", token],
    queryFn: () => getLoanByApprovalToken(token!),
    enabled: !!token,
  });
}

export function useLoanById(loanId: string | null) {
  return useQuery({
    queryKey: ["loan", loanId],
    queryFn: () => getLoanById(loanId!),
    enabled: !!loanId,
  });
}

export function useUserById(userId: string | null) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId!),
    enabled: !!userId,
  });
}

export function useTransactionByLoanId(loanId: string | null) {
  return useQuery({
    queryKey: ["transaction", "loan", loanId],
    queryFn: () => getTransactionByLoanId(loanId!),
    enabled: !!loanId,
  });
}

// --- Repayments ---
export function useRepayments() {
  return useQuery({ queryKey: ["repayments"], queryFn: getRepayments });
}

export function useCreateRepayment() {
  const qc = useQueryClient();
  const userId = useAppUserId();
  return useMutation({
    mutationFn: createRepayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repayments"] });
      qc.invalidateQueries({ queryKey: ["balances", userId] });
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["peopleForRepayment", userId] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useRepaymentByApprovalToken(token: string | null) {
  return useQuery({
    queryKey: ["repayment", "approval", token],
    queryFn: () => getRepaymentByApprovalToken(token!),
    enabled: !!token,
  });
}

export function useUpdateRepaymentStatus() {
  const qc = useQueryClient();
  const userId = useAppUserId();
  return useMutation({
    mutationFn: ({ id, status, approvedBy }: { id: string; status: "completed" | "rejected"; approvedBy: string }) =>
      updateRepaymentStatus(id, status, approvedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repayments"] });
      qc.invalidateQueries({ queryKey: ["balances", userId] });
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["peopleForRepayment", userId] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// --- Transactions ---
export function useCreateTransaction() {
  return useMutation({ mutationFn: createTransaction });
}

// --- Shadow User + Friend ---
export function useCreateShadowUserAndFriend() {
  const qc = useQueryClient();
  const userId = useAppUserId();
  return useMutation({
    mutationFn: async (nickname: string) => {
      const shadowUser = await createShadowUser(nickname);
      await addFriend(userId, shadowUser.id);
      return shadowUser;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friends", userId] });
    },
  });
}

// --- Notifications ---
export function useNotifications() {
  const { appUser } = useAuth();
  const userId = appUser?.id ?? "";
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => getNotifications(userId),
    enabled: !!userId,
  });
}

export function useMarkNotificationAsRead() {
  const qc = useQueryClient();
  const { appUser } = useAuth();
  const userId = appUser?.id ?? "";
  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
  });
}
