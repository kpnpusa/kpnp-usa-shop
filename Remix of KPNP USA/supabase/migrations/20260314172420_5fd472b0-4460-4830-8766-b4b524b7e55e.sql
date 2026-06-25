CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    full_name,
    phone,
    shipping_address_line1,
    shipping_address_line2,
    shipping_city,
    shipping_state,
    shipping_zip,
    shipping_country
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'shipping_address_line1', ''),
    COALESCE(NEW.raw_user_meta_data->>'shipping_address_line2', ''),
    COALESCE(NEW.raw_user_meta_data->>'shipping_city', ''),
    COALESCE(NEW.raw_user_meta_data->>'shipping_state', ''),
    COALESCE(NEW.raw_user_meta_data->>'shipping_zip', ''),
    COALESCE(NEW.raw_user_meta_data->>'shipping_country', 'US')
  );
  RETURN NEW;
END;
$$;