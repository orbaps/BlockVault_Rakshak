
-- Add RLS policies to user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Fix overly permissive verification_logs INSERT policy
DROP POLICY "Anyone can create verification logs" ON public.verification_logs;
CREATE POLICY "Authenticated users can create verification logs" ON public.verification_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
