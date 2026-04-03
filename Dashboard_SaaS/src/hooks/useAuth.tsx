import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserType = "institution" | "student";

export interface StudentProfile {
  id: string;
  passportId: string;
  name: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userType: UserType | null;
  studentProfile: StudentProfile | null;
  loading: boolean;
  loginAsStudent: (profile: StudentProfile) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userType: null,
  studentProfile: null,
  loading: true,
  loginAsStudent: () => {},
  signOut: async () => {},
});

const LS = {
  id:       "blockvault_student_id",
  passport: "blockvault_student_passport",
  name:     "blockvault_student_name",
  type:     "blockvault_user_type",
};

export function saveStudentProfile(profile: StudentProfile) {
  localStorage.setItem(LS.id,       profile.id);
  localStorage.setItem(LS.passport, profile.passportId);
  localStorage.setItem(LS.name,     profile.name);
  localStorage.setItem(LS.type,     "student");
}

export function clearStudentProfile() {
  Object.values(LS).forEach((k) => localStorage.removeItem(k));
}

function readStudentProfile(): StudentProfile | null {
  const id        = localStorage.getItem(LS.id);
  const passportId = localStorage.getItem(LS.passport);
  const name      = localStorage.getItem(LS.name);
  if (id && passportId && name) return { id, passportId, name };
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session,        setSession]        = useState<Session | null>(null);
  const [userType,       setUserType]       = useState<UserType | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    // Check localStorage for a student session first — no Supabase auth needed
    if (localStorage.getItem(LS.type) === "student") {
      const sp = readStudentProfile();
      if (sp) {
        setStudentProfile(sp);
        setUserType("student");
        setLoading(false);
        return;
      }
    }

    // Institution users use standard Supabase auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUserType(sess?.user ? "institution" : null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUserType(sess?.user ? "institution" : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /** Called right after passport verification — mutates React state immediately so DashboardLayout sees it */
  const loginAsStudent = useCallback((profile: StudentProfile) => {
    saveStudentProfile(profile);
    setStudentProfile(profile);
    setUserType("student");
  }, []);

  const signOut = async () => {
    clearStudentProfile();
    setStudentProfile(null);
    setUserType(null);
    setSession(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, userType, studentProfile, loading, loginAsStudent, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
