
-- 1. Create is_admin() helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT (auth.jwt() ->> 'email') IN ('admin@kpnpamerica.com')
$$;

-- 2. Drop overly permissive policies on conversations
DROP POLICY IF EXISTS "Authenticated can read all conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admin can update conversation status" ON public.conversations;

-- 3. Create admin-only policies on conversations
CREATE POLICY "Admin can read all conversations" ON public.conversations
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin can update conversation status" ON public.conversations
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (status = ANY (ARRAY['active'::text, 'closed'::text, 'ai'::text, 'waiting'::text]));

-- 4. Drop overly permissive policies on messages
DROP POLICY IF EXISTS "Authenticated can read all messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated can insert any role" ON public.messages;

-- 5. Create admin-only policies on messages
CREATE POLICY "Admin can read all messages" ON public.messages
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin can insert agent messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() AND role = ANY (ARRAY['customer'::text, 'assistant'::text, 'agent'::text]));
