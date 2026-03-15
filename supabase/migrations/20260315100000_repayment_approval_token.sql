-- Add approval_token to repayments for lender approval flow (төлбөр төлөх)
ALTER TABLE public.repayments
ADD COLUMN IF NOT EXISTS approval_token text;

-- Update status check to allow pending_lender_approval (keep 'approved' for legacy)
ALTER TABLE public.repayments
DROP CONSTRAINT IF EXISTS repayments_status_check;

ALTER TABLE public.repayments
ADD CONSTRAINT repayments_status_check
CHECK (status IN ('pending_lender_approval', 'completed', 'rejected', 'approved'));

-- Add approval_token to notifications for repayment approval link
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS approval_token text;
