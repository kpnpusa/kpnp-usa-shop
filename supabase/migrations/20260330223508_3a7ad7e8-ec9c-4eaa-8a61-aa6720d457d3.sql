CREATE OR REPLACE FUNCTION public.end_customer_chat(p_conversation_id uuid, p_session_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = p_conversation_id AND session_token = p_session_token::uuid
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  UPDATE public.conversations SET status = 'closed' WHERE id = p_conversation_id;
END;
$function$;