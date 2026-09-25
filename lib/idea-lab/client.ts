'use client';

import posthog from 'posthog-js';
import { supabase } from '../supabaseClient';
import type { NoteContent } from './schema';

export interface PublicIdea {
  id: string;
  session_id: string;
  parent_idea_id: string | null;
  title: string;
  problem: string;
  agenda_theme: string;
  emerging: boolean;
  agenda_fit: string;
  statutory_area: string;
  deliverable: string;
  data_and_partners: { label: string; kind: 'data' | 'partner'; verify: boolean }[];
  feasibility: 'semester' | 'year' | 'larger';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  common_idea_warning: string | null;
  related_challenge_id: string | null;
}

export interface SessionInfo {
  id: string;
  project_type: 'capstone' | 'thesis' | 'startup';
  program: string | null;
  level: string | null;
  priority_area: string;
  skills: string[];
  time_available: string | null;
  budget: string | null;
  partner_pref: string | null;
}

export type SavedStatus = 'exploring' | 'chosen' | 'dropped';
export interface SavedIdea {
  idea: PublicIdea;
  project_type: string;
  priority_area: string;
  program: string | null;
  saved_at: string;
  status: SavedStatus;
}

const SAVED_KEY = 'ib_idealab_saved_v1';
const LAST_KEY = 'ib_idealab_last_setup_v1';

export function readSaved(): SavedIdea[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]') as SavedIdea[];
  } catch {
    return [];
  }
}
function writeSaved(v: SavedIdea[]) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(v));
  } catch {
    // Storage blocked: saving just will not persist.
  }
}
export function isSaved(id: string) {
  return readSaved().some((s) => s.idea.id === id);
}
export function toggleSaved(idea: PublicIdea, session: Pick<SessionInfo, 'project_type' | 'priority_area' | 'program'>): boolean {
  const all = readSaved();
  const i = all.findIndex((s) => s.idea.id === idea.id);
  if (i >= 0) {
    all.splice(i, 1);
    writeSaved(all);
    return false;
  }
  all.unshift({ idea, project_type: session.project_type, priority_area: session.priority_area, program: session.program, saved_at: new Date().toISOString(), status: 'exploring' });
  writeSaved(all);
  return true;
}
export function setSavedStatus(id: string, status: SavedStatus) {
  writeSaved(readSaved().map((s) => (s.idea.id === id ? { ...s, status } : s)));
}
export function removeSaved(id: string) {
  writeSaved(readSaved().filter((s) => s.idea.id !== id));
}

export function readLastSetup<T>(): T | null {
  try {
    return JSON.parse(localStorage.getItem(LAST_KEY) || 'null') as T | null;
  } catch {
    return null;
  }
}
export function writeLastSetup(v: unknown) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify(v));
  } catch {
    // Storage blocked.
  }
}

/** Counts-only analytics. No free text is ever sent. */
export function track(event: string, props?: Record<string, string | number | boolean>) {
  try {
    posthog.capture(`idea_lab_${event}`, props);
  } catch {
    // Analytics is optional.
  }
}

/** Headers carrying the signed-in user's session token (Idea Lab requires login). */
export async function authHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
  try {
    const { data } = (await supabase?.auth.getSession()) ?? { data: null };
    const token = data?.session?.access_token;
    return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
  } catch {
    return extra;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<{ ok: true; data: T } | { ok: false; error: string; code?: string }> {
  try {
    const res = await fetch(path, { ...init, headers: await authHeaders((init?.headers as Record<string, string>) ?? {}) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || 'Something went wrong. Please try again.', code: data.code };
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, error: 'You seem to be offline. Please try again.' };
  }
}

export const TYPE_LABEL: Record<string, string> = { capstone: 'Capstone', thesis: 'Thesis', startup: 'Startup' };
export const FEASIBILITY_LABEL: Record<string, string> = { semester: 'Fits one semester', year: 'Fits one year', larger: 'Bigger project' };
export const DIFFICULTY_LABEL: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

export type { NoteContent };
