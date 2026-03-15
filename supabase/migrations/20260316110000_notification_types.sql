-- Add repayment_approved and loan_approved to notifications type check
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('loan_request', 'repayment_recorded', 'repayment_approved', 'repayment_received', 'loan_approved'));
