import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContacts, createContact } from "@/data/contacts";
import { getLoans, getLoansForPerson, createLoan, updateLoanStatus, getLoanByApprovalToken } from "@/data/loans";
import { getRepayments, createRepayment } from "@/data/repayments";
import { getNotifications, markNotificationAsRead } from "@/data/notifications";
import { useAuth } from "@/hooks/useAuth";

function useUserId() {
  const { session } = useAuth();
  return session?.user?.id ?? "";
}

// --- Contacts ---
export function useContacts() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["contacts", userId],
    queryFn: () => getContacts(userId),
    enabled: !!userId,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  const userId = useUserId();
  return useMutation({
    mutationFn: (name: string) => createContact(userId, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts", userId] }),
  });
}

// --- Loans ---
export function useLoans() {
  return useQuery({ queryKey: ["loans"], queryFn: getLoans });
}

export function useCreateLoan() {
  const qc = useQueryClient();
  const userId = useUserId();
  return useMutation({
    mutationFn: createLoan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["balances", userId] });
    },
  });
}

export function useUpdateLoanStatus() {
  const qc = useQueryClient();
  const userId = useUserId();
  return useMutation({
    mutationFn: ({ id, status, approvedBy }: { id: string; status: Parameters<typeof updateLoanStatus>[1]; approvedBy?: string }) =>
      updateLoanStatus(id, status, approvedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["balances", userId] });
    },
  });
}

export function useLoansForPerson(personId: string) {
  return useQuery({
    queryKey: ["loans", "person", personId],
    queryFn: () => getLoansForPerson(personId),
    enabled: !!personId,
  });
}

export function useLoanByApprovalToken(token: string | null) {
  return useQuery({
    queryKey: ["loan", "approval", token],
    queryFn: () => getLoanByApprovalToken(token!),
    enabled: !!token,
  });
}

// --- Repayments ---
export function useRepayments() {
  return useQuery({ queryKey: ["repayments"], queryFn: getRepayments });
}

export function useCreateRepayment() {
  const qc = useQueryClient();
  const userId = useUserId();
  return useMutation({
    mutationFn: createRepayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repayments"] });
      qc.invalidateQueries({ queryKey: ["balances", userId] });
    },
  });
}

// --- Notifications ---
export function useNotifications() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => getNotifications(userId),
    enabled: !!userId,
  });
}

export function useMarkNotificationAsRead() {
  const qc = useQueryClient();
  const userId = useUserId();
  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
  });
}
