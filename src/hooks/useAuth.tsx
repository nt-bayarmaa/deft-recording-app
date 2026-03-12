import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureUserProfile } from "@/data/user-profiles";
import type { Session } from "@supabase/supabase-js";
import type { UserProfile } from "@/types";

interface AuthCtx {
  session: Session | null;
  loading: boolean;
  profile: UserProfile | null;
}

const AuthContext = createContext<AuthCtx>({ session: null, loading: true, profile: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // First set up the listener (no await inside callback!)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session?.user?.id) {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Then check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Separate effect to load profile when session changes (safe to await here)
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    ensureUserProfile(userId)
      .then((p) => { if (!cancelled) setProfile(p); })
      .catch((e) => console.error("Failed to ensure user profile:", e));
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  return (
    <AuthContext.Provider value={{ session, loading, profile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
