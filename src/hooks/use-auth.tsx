import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile } from "@/lib/workspace.functions";
import type { RoleName, WorkspaceProfile } from "@/types/workspace";

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: WorkspaceProfile | null;
  role: RoleName;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<WorkspaceProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadProfile = React.useCallback(async (current: Session | null) => {
    if (!current) {
      setProfile(null);
      return;
    }
    try {
      setProfile(await getMyProfile());
    } catch (error) {
      console.error("Failed to load workspace profile", error);
      setProfile(null);
    }
  }, []);

  React.useEffect(() => {
    let active = true;

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      void loadProfile(next);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      void loadProfile(data.session).finally(() => setLoading(false));
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = React.useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? "citizen",
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
        setProfile(null);
      },
      refreshProfile: () => loadProfile(session),
    }),
    [session, profile, loading, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

export function useIsResponder(): boolean {
  const { role } = useAuth();
  return role === "responder" || role === "admin";
}
