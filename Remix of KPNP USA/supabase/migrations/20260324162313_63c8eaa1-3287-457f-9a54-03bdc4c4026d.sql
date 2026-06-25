-- Fix: public can only insert 'customer' role messages
DROP POLICY IF EXISTS "Public can insert customer messages" ON public.messages;

CREATE POLICY "Public can insert customer messages"
ON public.messages
FOR INSERT
TO public
WITH CHECK (role = 'customer');

-- Authenticated can insert any valid role
DROP POLICY IF EXISTS "Authenticated can insert agent messages" ON public.messages;

CREATE POLICY "Authenticated can insert any role"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (role IN ('customer', 'assistant', 'agent'));