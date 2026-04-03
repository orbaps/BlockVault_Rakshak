
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'institution_admin', 'recruiter', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Institutions table
CREATE TYPE public.institution_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    status institution_status NOT NULL DEFAULT 'pending',
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved institutions" ON public.institutions FOR SELECT USING (status = 'approved' OR auth.uid() = admin_user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Institution admins can update own" ON public.institutions FOR UPDATE USING (auth.uid() = admin_user_id);
CREATE POLICY "Authenticated users can create institutions" ON public.institutions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Credentials table
CREATE TYPE public.credential_status AS ENUM ('pending', 'active', 'revoked');

CREATE TABLE public.credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL DEFAULT 'certificate',
    file_url TEXT,
    blockchain_hash TEXT,
    ai_confidence_score NUMERIC(5,2),
    status credential_status NOT NULL DEFAULT 'pending',
    issued_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view own credentials" ON public.credentials FOR SELECT USING (auth.uid() = student_user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Institution admins can manage credentials" ON public.credentials FOR ALL USING (
    EXISTS (SELECT 1 FROM public.institutions WHERE id = institution_id AND admin_user_id = auth.uid())
);

-- Verification logs table
CREATE TABLE public.verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_id UUID REFERENCES public.credentials(id) ON DELETE CASCADE NOT NULL,
    verifier_info TEXT,
    method TEXT NOT NULL DEFAULT 'id_input' CHECK (method IN ('qr', 'id_input', 'link')),
    result TEXT NOT NULL CHECK (result IN ('valid', 'invalid', 'revoked')),
    verified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view verification logs" ON public.verification_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can create verification logs" ON public.verification_logs FOR INSERT WITH CHECK (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, role)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'student');
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON public.credentials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
