-- 1. Add session_token column to conversations
ALTER TABLE public.conversations ADD COLUMN session_token uuid DEFAULT gen_random_uuid();

-- 2. Create security definer function to verify conversation ownership
CREATE OR REPLACE FUNCTION public.owns_conversation(p_conversation_id uuid, p_session_token uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = p_conversation_id
    AND session_token = p_session_token
  );
$$;

-- 3. Create RPC to get messages for a conversation (with token verification)
CREATE OR REPLACE FUNCTION public.get_conversation_messages(p_conversation_id uuid, p_session_token uuid)
RETURNS SETOF public.messages
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.* FROM public.messages m
  JOIN public.conversations c ON c.id = m.conversation_id
  WHERE m.conversation_id = p_conversation_id
  AND c.session_token = p_session_token
  ORDER BY m.created_at ASC;
$$;

-- 4. Replace public SELECT policies on conversations
DROP POLICY IF EXISTS "Public can read own active conversations" ON public.conversations;

CREATE POLICY "Public can read own conversation"
ON public.conversations
FOR SELECT
TO public
USING (false);  -- Public cannot read conversations directly; use RPC

-- 5. Replace public SELECT policies on messages
DROP POLICY IF EXISTS "Public can read active conversation messages" ON public.messages;

CREATE POLICY "Public can read own conversation messages"
ON public.messages
FOR SELECT
TO public
USING (false);  -- Public cannot read messages directly; use RPC

-- 6. Tighten UPDATE policy - require session_token match for public
DROP POLICY IF EXISTS "Public can request human agent" ON public.conversations;

CREATE POLICY "Public can request human agent on own conversation"
ON public.conversations
FOR UPDATE
TO public
USING (false)  -- Use RPC instead
WITH CHECK (false);

-- 7. Create RPC for requesting human agent
CREATE OR REPLACE FUNCTION public.request_human_agent(p_conversation_id uuid, p_session_token uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET status = 'waiting'
  WHERE id = p_conversation_id
  AND session_token = p_session_token
  AND status = 'ai';
END;
$$;