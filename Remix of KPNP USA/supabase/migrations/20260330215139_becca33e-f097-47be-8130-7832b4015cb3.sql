CREATE OR REPLACE FUNCTION public.send_customer_message(p_conversation_id uuid, p_session_token text, p_content text)
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
  
  IF p_content IS NULL OR length(trim(p_content)) = 0 THEN
    RAISE EXCEPTION 'Content cannot be empty';
  END IF;
  
  INSERT INTO public.messages (conversation_id, role, content)
  VALUES (p_conversation_id, 'customer', left(trim(p_content), 2000));
END;
$function$;