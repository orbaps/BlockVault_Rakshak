
-- Fix profiles policies to be permissive
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Fix user_roles read policy
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Fix verification_logs read policy
DROP POLICY IF EXISTS "Authenticated can read verification logs" ON public.verification_logs;
CREATE POLICY "Authenticated can read verification logs" ON public.verification_logs
  FOR SELECT TO authenticated
  USING (true);

-- Fix students read policies
DROP POLICY IF EXISTS "Workspace members can read students" ON public.students;
CREATE POLICY "Workspace members can read students" ON public.students
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = students.workspace_id AND workspace_members.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = students.workspace_id AND workspaces.owner_id = auth.uid())
  );

-- Fix certificates read policy for workspace members
DROP POLICY IF EXISTS "Workspace members can read certs" ON public.certificates;
CREATE POLICY "Workspace members can read certs" ON public.certificates
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = certificates.workspace_id AND workspace_members.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = certificates.workspace_id AND workspaces.owner_id = auth.uid())
  );

-- Fix workspace_members read policy
DROP POLICY IF EXISTS "Members can read members" ON public.workspace_members;
CREATE POLICY "Members can read members" ON public.workspace_members
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = workspace_members.workspace_id AND wm.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = workspace_members.workspace_id AND workspaces.owner_id = auth.uid())
  );
