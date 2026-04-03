
-- Create a security definer function to check workspace membership without triggering RLS
CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE user_id = _user_id AND workspace_id = _workspace_id
  )
$$;

-- Fix workspace SELECT to use security definer function
DROP POLICY IF EXISTS "Members can read workspace" ON public.workspaces;
CREATE POLICY "Members can read workspace" ON public.workspaces
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR public.is_workspace_member(auth.uid(), id)
  );

-- Fix workspace_members policies to use security definer function too
DROP POLICY IF EXISTS "Members can read members" ON public.workspace_members;
CREATE POLICY "Members can read members" ON public.workspace_members
  FOR SELECT TO authenticated
  USING (
    public.is_workspace_member(auth.uid(), workspace_id)
    OR EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = workspace_members.workspace_id AND workspaces.owner_id = auth.uid())
  );
