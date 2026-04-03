
-- Fix workspaces: make owner ALL policy permissive so INSERT works
DROP POLICY IF EXISTS "Workspace owner can all" ON public.workspaces;
CREATE POLICY "Workspace owner can all" ON public.workspaces
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Also fix certificates owner policy to be permissive
DROP POLICY IF EXISTS "Workspace owner can manage certs" ON public.certificates;
CREATE POLICY "Workspace owner can manage certs" ON public.certificates
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = certificates.workspace_id AND workspaces.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = certificates.workspace_id AND workspaces.owner_id = auth.uid()));

-- Fix workspace_members owner policy to be permissive  
DROP POLICY IF EXISTS "Owner can manage members" ON public.workspace_members;
CREATE POLICY "Owner can manage members" ON public.workspace_members
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = workspace_members.workspace_id AND workspaces.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = workspace_members.workspace_id AND workspaces.owner_id = auth.uid()));

-- Fix students owner policy to be permissive
DROP POLICY IF EXISTS "Workspace owner can manage students" ON public.students;
CREATE POLICY "Workspace owner can manage students" ON public.students
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = students.workspace_id AND workspaces.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = students.workspace_id AND workspaces.owner_id = auth.uid()));

-- Fix documents policy to be permissive
DROP POLICY IF EXISTS "Users can manage own docs" ON public.documents;
CREATE POLICY "Users can manage own docs" ON public.documents
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
