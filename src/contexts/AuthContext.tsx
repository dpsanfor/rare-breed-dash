import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { loadUserProfile, syncProfileToSupabase } from "@/lib/supabase-profile";
import { readProfile, writeProfile } from "@/lib/profile";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

const IS_LOCAL_DEV = typeof window !== "undefined" && window.location.hostname === "localhost";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(IS_LOCAL_DEV ? ({ email: "dana@danahayes.com", id: "local-dev" } as unknown as User) : null);
  const [loading, setLoading] = useState(!IS_LOCAL_DEV);

  useEffect(() => {
    if (IS_LOCAL_DEV) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile().then((profile) => {
          if (profile) writeProfile(profile);
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user && event === "SIGNED_IN") {
          loadUserProfile().then((profile) => {
            if (profile) writeProfile(profile);
          });
        }
        if (event === "SIGNED_OUT") {
          localStorage.removeItem("rb_profile");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    // Sync latest local data before signing out
    const profile = readProfile();
    await syncProfileToSupabase(profile).catch(() => {});
    await supabase.auth.signOut();
    localStorage.removeItem("rb_profile");
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
