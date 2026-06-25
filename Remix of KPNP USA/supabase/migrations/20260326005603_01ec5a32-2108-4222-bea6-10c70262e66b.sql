
-- CONVERSATIONS: Drop broken policies
DROP POLICY IF EXISTS "Public can read own conversation" ON public.conversations;
DROP POLICY IF EXISTS "Public can request human agent on own conversation" ON public.conversations;

-- MESSAGES: Drop broken policies  
DROP POLICY IF EXISTS "Public can read own conversation messages" ON public.messages;
DROP POLICY IF EXISTS "Public can insert customer messages" ON public.messages;

-- Create RPC to insert customer messages with session_token validation
CREATE OR REPLACE FUNCTION public.send_customer_message(
  p_conversation_id uuid,
  p_session_token text,
  p_content text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = p_conversation_id AND session_token = p_session_token
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  IF p_content IS NULL OR length(trim(p_content)) = 0 THEN
    RAISE EXCEPTION 'Content cannot be empty';
  END IF;
  
  INSERT INTO public.messages (conversation_id, role, content)
  VALUES (p_conversation_id, 'customer', left(trim(p_content), 2000));
END;
$$;
