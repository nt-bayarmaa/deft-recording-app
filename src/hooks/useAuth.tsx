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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user?.id) {
          try {
            const p = await ensureUserProfile(session.user.id);
            setProfile(p);
          } catch (e) {
            console.error("Failed to ensure user profile:", e);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        try {
          const p = await ensureUserProfile(session.user.id);
          setProfile(p);
        } catch (e) {
          console.error("Failed to ensure user profile:", e);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, profile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
