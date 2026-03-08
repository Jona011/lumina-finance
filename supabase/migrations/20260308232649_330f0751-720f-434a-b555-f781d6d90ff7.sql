CREATE POLICY "Users can update own spreadsheets"
ON public.spreadsheets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);