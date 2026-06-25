DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;

CREATE POLICY "Public can insert customer messages"
ON public.messages
FOR INSERT
WITH CHECK (role IN ('customer', 'assistant'));

CREATE POLICY "Authenticated can insert agent messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (role IN ('customer', 'assistant', 'agent'));