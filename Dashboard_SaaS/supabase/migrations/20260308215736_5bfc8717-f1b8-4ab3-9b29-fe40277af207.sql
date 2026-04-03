
-- Fix infinite recursion: workspace SELECT should only check owner directly
-- The member check causes recursion because workspace_members policies check workspaces
DROP POLICY IF EXISTS "Members can read workspace" ON public.workspaces;
CREATE POLICY "Members can read workspace" ON public.workspaces
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );
