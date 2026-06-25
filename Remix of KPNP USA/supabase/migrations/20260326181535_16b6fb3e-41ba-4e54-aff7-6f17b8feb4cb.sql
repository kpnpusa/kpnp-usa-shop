CREATE POLICY "Authenticated can create ai conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (status = 'ai'::text);