
-- Tighten verification_logs insert policy to require at least a verification_method
DROP POLICY "Anyone can create verification log" ON public.verification_logs;
CREATE POLICY "Anyone can create verification log" ON public.verification_logs 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (verification_method IN ('upload', 'qr', 'id'));

-- Enable realtime for verification_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.certificates;

-- Create storage bucket for certificate files
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true);

-- Storage RLS for certificates bucket
CREATE POLICY "Authenticated users can upload certificates" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Anyone can read certificates" ON storage.objects 
  FOR SELECT TO anon, authenticated 
  USING (bucket_id = 'certificates');

CREATE POLICY "Owners can delete certificates" ON storage.objects 
  FOR DELETE TO authenticated 
  USING (bucket_id = 'certificates' AND (storage.foldername(name))[1] = auth.uid()::text);
