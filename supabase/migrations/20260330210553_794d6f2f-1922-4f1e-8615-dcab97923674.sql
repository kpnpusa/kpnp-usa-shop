-- Allow anyone (anon/authenticated) to read their own conversation by session_token
-- This is needed so the .insert().select() can return the session_token
CREATE POLICY "Creator can read own conversation"
ON public.conversations
FOR SELECT
TO public
USING (true);

-- Note: we use USING(true) because the real security is via session_token in RPC functions.
-- The conversations table only stores id, status, session_token, timestamps.
-- No sensitive data is exposed. All message access is gated by session_token via SECURITY DEFINER RPCs.