
-- RPC for client to check if agent is typing
CREATE OR REPLACE FUNCTION public.check_agent_typing(p_conversation_id uuid, p_session_token uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = p_conversation_id
    AND session_token = p_session_token
    AND agent_typing_at IS NOT NULL
    AND agent_typing_at > now() - interval '5 seconds'
  );
$$;

-- RPC for admin to signal typing
CREATE OR REPLACE FUNCTION public.set_agent_typing(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  UPDATE public.conversations SET agent_typing_at = now() WHERE id = p_conversation_id;
END;
$$;
