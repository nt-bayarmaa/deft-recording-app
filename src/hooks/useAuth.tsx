import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateAppUser } from "@/data/users";
import type { Session } from "@supabase/supabase-js";
import type { AppUser } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

interface AuthCtx {
  session: Session | null;
  loading: boolean;
  appUser: AppUser | null;
  refetchAppUser: () => void;
}

const AuthContext = createContext<AuthCtx>({ session: null, loading: true, appUser: null, refetchAppUser: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [fetchCounter, setFetchCounter] = useState(0);

  const refetchAppUser = useCallback(() => setFetchCounter((c) => c + 1), []);

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

  // Load app user when session changes or refetch is triggered
  useEffect(() => {
    const authUserId = session?.user?.id;
    if (!authUserId) {
      setAppUser(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        // Small delay to allow the DB trigger to finish creating the user (if any)
        await new Promise((r) => setTimeout(r, 500));
        const user = await getOrCreateAppUser(authUserId);
        if (!cancelled) setAppUser(user);
      } catch (e) {
        console.error("Failed to load app user:", e);
        if (!cancelled) setAppUser(null);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [session?.user?.id, fetchCounter]);

  return (
    <AuthContext.Provider value={{ session, loading, appUser, refetchAppUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
