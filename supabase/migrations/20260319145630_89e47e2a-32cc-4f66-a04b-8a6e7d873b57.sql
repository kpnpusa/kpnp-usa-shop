DROP VIEW IF EXISTS public.products_view;
CREATE VIEW public.products_view WITH (security_invoker = true) AS SELECT * FROM public.products;