
-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'member', 'student');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  wallet_address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  workspace_type TEXT NOT NULL DEFAULT 'university',
  admin_wallet TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blockchain_verification BOOLEAN NOT NULL DEFAULT true,
  qr_verification BOOLEAN NOT NULL DEFAULT true,
  public_passports BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Workspace members
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  student_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  wallet_address TEXT,
  passport_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  cert_id TEXT NOT NULL,
  title TEXT NOT NULL,
  certificate_type TEXT NOT NULL DEFAULT 'certificate',
  file_hash TEXT,
  file_url TEXT,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'verified',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Documents (vault)
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT,
  file_hash TEXT,
  file_size TEXT,
  tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Verification logs
CREATE TABLE public.verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID REFERENCES public.certificates(id) ON DELETE SET NULL,
  verifier_name TEXT,
  verification_method TEXT NOT NULL DEFAULT 'id',
  result TEXT NOT NULL DEFAULT 'valid',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- user_roles: users can read their own roles
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- profiles: users can read/update own profile
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- workspaces: owner/members can access
CREATE POLICY "Workspace owner can all" ON public.workspaces FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Members can read workspace" ON public.workspaces FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = id AND user_id = auth.uid())
);

-- workspace_members
CREATE POLICY "Members can read members" ON public.workspace_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid())
);
CREATE POLICY "Owner can manage members" ON public.workspace_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
);

-- students: workspace members can access
CREATE POLICY "Workspace members can read students" ON public.students FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = students.workspace_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.workspaces WHERE id = students.workspace_id AND owner_id = auth.uid())
);
CREATE POLICY "Workspace owner can manage students" ON public.students FOR ALL USING (
  EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
);

-- certificates: workspace members can read, public can read for verification
CREATE POLICY "Workspace members can read certs" ON public.certificates FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = certificates.workspace_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.workspaces WHERE id = certificates.workspace_id AND owner_id = auth.uid())
);
CREATE POLICY "Public can read verified certs" ON public.certificates FOR SELECT TO anon USING (status = 'verified');
CREATE POLICY "Workspace owner can manage certs" ON public.certificates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
);

-- documents: users own their docs
CREATE POLICY "Users can manage own docs" ON public.documents FOR ALL USING (auth.uid() = user_id);

-- verification_logs: public insert, workspace can read
CREATE POLICY "Anyone can create verification log" ON public.verification_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can read verification logs" ON public.verification_logs FOR SELECT TO authenticated USING (true);

-- students public read for credential ledger
CREATE POLICY "Public can read students for ledger" ON public.students FOR SELECT TO anon USING (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
