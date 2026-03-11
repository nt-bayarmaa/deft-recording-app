
-- Drop development policy
DROP POLICY IF EXISTS "Allow all for development" ON public.persons;

-- Authenticated users can view persons
CREATE POLICY "Authenticated users can view persons"
  ON public.persons FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert persons
CREATE POLICY "Authenticated users can insert persons"
  ON public.persons FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update persons
CREATE POLICY "Authenticated users can update persons"
  ON public.persons FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete persons
CREATE POLICY "Authenticated users can delete persons"
  ON public.persons FOR DELETE
  TO authenticated
  USING (true);
