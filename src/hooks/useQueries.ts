import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFriends, addFriend, createShadowUser } from "@/data/users";
import { getLoans, getLoansForPerson, createLoan, updateLoanStatus, getLoanByApprovalToken } from "@/data/loans";
import { getRepayments, createRepayment } from "@/data/repayments";
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

export function useLoanByApprovalToken(token: string | null) {
  return useQuery({
    queryKey: ["loan", "approval", token],
    queryFn: () => getLoanByApprovalToken(token!),
    enabled: !!token,
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
  const { session } = useAuth();
  const authUserId = session?.user?.id ?? "";
  return useQuery({
    queryKey: ["notifications", authUserId],
    queryFn: () => getNotifications(authUserId),
    enabled: !!authUserId,
  });
}

export function useMarkNotificationAsRead() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const authUserId = session?.user?.id ?? "";
  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", authUserId] }),
  });
}
