"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  is_mentor: boolean;
  is_admin: boolean;
  created_at: string;
}

interface AuthContextValue {
  configured: boolean;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  configured: false,
  user: null,
  profile: null,
  loading: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(u: User | null) {
    if (!supabase || !u) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
    if (data) {
      setProfile(data as Profile);
      return;
    }
    // Self-heal: some accounts (e.g. ones created before email confirmation,
    // when there was no session yet to satisfy the insert policy) never got
    // a profiles row. Now that we have an authenticated session, create it.
    const { data: created } = await supabase
      .from("profiles")
      .upsert({ id: u.id, full_name: u.user_metadata?.full_name ?? "", email: u.email ?? "" })
      .select("*")
      .maybeSingle();
    setProfile((created as Profile) ?? null);
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      await loadProfile(data.session?.user ?? null);
      if (active) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      await loadProfile(session?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  async function refreshProfile() {
    await loadProfile(user);
  }

  return (
    <AuthContext.Provider
      value={{ configured: supabase !== null, user, profile, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
