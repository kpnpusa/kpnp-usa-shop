CREATE POLICY "Admin can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can read all notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (public.is_admin());