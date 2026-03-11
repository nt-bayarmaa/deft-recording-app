import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPersons, createPerson } from "@/data/persons";
import { getPersonBalances } from "@/data/balances";
import { getLoans, getLoansForPerson, createLoan, updateLoanStatus } from "@/data/loans";
import { getRepayments, createRepayment } from "@/data/repayments";
import { getNotifications, markNotificationAsRead } from "@/data/notifications";
import { useAuth } from "@/hooks/useAuth";

function useUserId() {
  const { session } = useAuth();
  return session?.user?.id ?? "me";
}

// --- Persons ---
export function usePersons() {
  return useQuery({ queryKey: ["persons"], queryFn: getPersons });
}

export function useCreatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createPerson(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["persons"] }),
  });
}

// --- Balances ---
export function usePersonBalances() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["balances", userId],
    queryFn: () => getPersonBalances(userId),
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
    mutationFn: ({ id, status }: { id: string; status: Parameters<typeof updateLoanStatus>[1] }) =>
      updateLoanStatus(id, status),
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
