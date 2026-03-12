import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAppUser } from "@/data/users";
import type { Session } from "@supabase/supabase-js";
import type { AppUser } from "@/types";

interface AuthCtx {
  session: Session | null;
  loading: boolean;
  appUser: AppUser | null;
}

const AuthContext = createContext<AuthCtx>({ session: null, loading: true, appUser: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [appUser, setAppUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session?.user?.id) {
          setAppUser(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load app user when session changes (the DB trigger auto-creates user row on signup)
  useEffect(() => {
    const authUserId = session?.user?.id;
    if (!authUserId) {
      setAppUser(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        // Small delay to allow the DB trigger to finish creating the user
        await new Promise((r) => setTimeout(r, 500));
        const user = await getAppUser(authUserId);
        if (!cancelled) setAppUser(user);
      } catch (e) {
        console.error("Failed to load app user:", e);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  return (
    <AuthContext.Provider value={{ session, loading, appUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
