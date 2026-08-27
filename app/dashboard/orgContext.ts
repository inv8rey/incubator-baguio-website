"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../AuthProvider";
import { supabase } from "../../lib/supabaseClient";

const STORAGE_KEY = "ib-dashboard-org-context";

export interface OrgContextOption {
  id: string;
  name: string;
  logo_url: string;
  org_type: string;
}

// Which organization "Organization Management" mode is currently scoped to.
// Lives in localStorage (per-browser, per-viewer) rather than a URL param --
// the dashboard's routes are fixed file paths (/dashboard/organization/members/
// etc.), not per-org dynamic routes, so the selection has to live somewhere
// that persists across navigating between them.
export function useOrgContext() {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<OrgContextOption[]>([]);
  const [selectedOrgId, setSelectedOrgIdState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!supabase || !user) {
      setOrgs([]);
      setSelectedOrgIdState(null);
      setLoaded(true);
      return;
    }
    (async () => {
      const [{ data: memberships }, { data: ownedDirect }] = await Promise.all([
        supabase!.from("organization_members").select("organization_id").eq("user_id", user.id).eq("status", "active"),
        supabase!.from("organizations").select("id").eq("owner_id", user.id),
      ]);
      const ids = Array.from(new Set([...(memberships ?? []).map((m: any) => m.organization_id), ...(ownedDirect ?? []).map((o: any) => o.id)]));
      if (ids.length === 0) {
        setOrgs([]);
        setSelectedOrgIdState(null);
        setLoaded(true);
        return;
      }
      const { data } = await supabase!.from("organizations").select("id,name,logo_url,org_type").in("id", ids).order("created_at", { ascending: true });
      const list = (data ?? []).map((o: any) => ({ id: o.id, name: o.name, logo_url: o.logo_url || "", org_type: o.org_type || "" }));
      setOrgs(list);
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(STORAGE_KEY);
      } catch {}
      setSelectedOrgIdState(stored && list.some((o) => o.id === stored) ? stored : null);
      setLoaded(true);
    })();
  }, [user]);

  const setSelectedOrgId = useCallback((id: string | null) => {
    setSelectedOrgIdState(id);
    try {
      if (id) window.localStorage.setItem(STORAGE_KEY, id);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return { orgs, selectedOrgId, setSelectedOrgId, loaded };
}
