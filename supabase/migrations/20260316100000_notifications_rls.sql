-- Ensure notifications table allows inserts (RLS fix if notifications not saving)
-- Only run if notifications are not being created - this adds permissive policies

-- Allow all for notifications (matches original development setup)
DROP POLICY IF EXISTS "Allow all for development" ON public.notifications;
CREATE POLICY "Allow all for development" ON public.notifications
  FOR ALL USING (true) WITH CHECK (true);
