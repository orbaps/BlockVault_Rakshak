
-- Fix certificates RLS: change RESTRICTIVE to PERMISSIVE for SELECT
DROP POLICY IF EXISTS "Public can read verified certs" ON public.certificates;
DROP POLICY IF EXISTS "Workspace members can read certs" ON public.certificates;
DROP POLICY IF EXISTS "Workspace owner can manage certs" ON public.certificates;

CREATE POLICY "Public can read verified certs" ON public.certificates
  FOR SELECT USING (status = 'verified');

CREATE POLICY "Workspace members can read certs" ON public.certificates
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = certificates.workspace_id AND workspace_members.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = certificates.workspace_id AND workspaces.owner_id = auth.uid())
  );

CREATE POLICY "Workspace owner can manage certs" ON public.certificates
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = certificates.workspace_id AND workspaces.owner_id = auth.uid()));

-- Fix verification_logs: allow anonymous inserts
DROP POLICY IF EXISTS "Anyone can create verification log" ON public.verification_logs;
CREATE POLICY "Anyone can create verification log" ON public.verification_logs
  FOR INSERT WITH CHECK (verification_method = ANY (ARRAY['upload', 'qr', 'id']));

-- Fix students: make public read permissive 
DROP POLICY IF EXISTS "Public can read students for ledger" ON public.students;
CREATE POLICY "Public can read students for ledger" ON public.students
  FOR SELECT USING (true);

-- Fix workspaces: member read uses wrong column reference
DROP POLICY IF EXISTS "Members can read workspace" ON public.workspaces;
CREATE POLICY "Members can read workspace" ON public.workspaces
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workspaces.id AND workspace_members.user_id = auth.uid())
    OR owner_id = auth.uid()
  );

-- Fix workspace_members: self-referencing bug in member read
DROP POLICY IF EXISTS "Members can read members" ON public.workspace_members;
CREATE POLICY "Members can read members" ON public.workspace_members
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = workspace_members.workspace_id AND wm.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = workspace_members.workspace_id AND workspaces.owner_id = auth.uid())
  );
