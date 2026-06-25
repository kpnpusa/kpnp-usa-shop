-- 1. Tighten conversations INSERT: only allow creating with status 'ai'
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
CREATE POLICY "Public can create ai conversations"
ON public.conversations
FOR INSERT
TO public
WITH CHECK (status = 'ai');

-- 2. Tighten conversations UPDATE: split into public and authenticated
DROP POLICY IF EXISTS "Authenticated can update conversations" ON public.conversations;

-- Public users can only set status to 'waiting' (requesting human agent)
CREATE POLICY "Public can request human agent"
ON public.conversations
FOR UPDATE
TO public
USING (status = 'ai')
WITH CHECK (status = 'waiting');

-- Authenticated (admin) can update to active or closed
CREATE POLICY "Admin can update conversation status"
ON public.conversations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (status IN ('active', 'closed', 'ai', 'waiting'));

-- 3. Restrict public SELECT on conversations (only non-closed)
DROP POLICY IF EXISTS "Anyone can read conversations" ON public.conversations;

CREATE POLICY "Authenticated can read all conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Public can read own active conversations"
ON public.conversations
FOR SELECT
TO public
USING (status IN ('ai', 'waiting', 'active'));

-- 4. Restrict public SELECT on messages (only for active conversations)
DROP POLICY IF EXISTS "Anyone can read messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated can read all messages" ON public.messages;
DROP POLICY IF EXISTS "Public can read messages by conversation_id" ON public.messages;

CREATE POLICY "Authenticated can read all messages"
ON public.messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Public can read active conversation messages"
ON public.messages
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND c.status IN ('ai', 'waiting', 'active')
  )
);