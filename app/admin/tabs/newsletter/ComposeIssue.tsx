"use client";

import { useEffect, useState } from "react";
import { DARK, ORANGE } from "../../data";
import { useAuth } from "../../../AuthProvider";
import { supabase } from "../../../../lib/supabaseClient";
import { fetchNewsletterSuggestions, type SuggestionItem } from "../../../../lib/newsletterSuggestions";
import { renderNewsletterHtml, unsubscribeUrlFor } from "../../../../lib/newsletterTemplate";

interface ComposeItem extends SuggestionItem {
  checked: boolean;
}
interface ComposeSection {
  sectionName: string;
  items: ComposeItem[];
}

const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 9, border: "1.5px solid rgba(64,50,34,0.14)", fontSize: 13.5, color: DARK, outline: "none", fontFamily: "inherit" };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6, display: "block" };

/** Preview-only stand-in -- a real per-recipient token is never generated until the actual send loop runs. */
const PREVIEW_TOKEN = "00000000-0000-0000-0000-000000000000";

export default function ComposeIssue({ issueId, onBack }: { issueId: string | null; onBack: () => void }) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dbId, setDbId] = useState<string | null>(issueId);
  const [issueNumber, setIssueNumber] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [leadStory, setLeadStory] = useState("");
  const [sections, setSections] = useState<ComposeSection[]>([]);
  const [status, setStatus] = useState<"draft" | "sending" | "sent" | "failed">("draft");
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingReal, setSendingReal] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      if (issueId) {
        const { data } = await supabase.from("newsletter_issues").select("*").eq("id", issueId).maybeSingle();
        if (data) {
          setDbId(data.id);
          setIssueNumber(data.issue_number);
          setSubject(data.subject || "");
          setLeadStory(data.lead_story_html || "");
          setStatus(data.status);
          const savedSections = (data.sections as { sectionName: string; items: SuggestionItem[] }[]) || [];
          setSections(savedSections.map((s) => ({ sectionName: s.sectionName, items: s.items.map((it) => ({ ...it, checked: true })) })));
        }
      } else {
        const [{ data: lastSent }, { data: maxIssue }] = await Promise.all([
          supabase.from("newsletter_issues").select("sent_at").eq("status", "sent").order("sent_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("newsletter_issues").select("issue_number").order("issue_number", { ascending: false }).limit(1).maybeSingle(),
        ]);
        setIssueNumber((maxIssue?.issue_number ?? 0) + 1);
        const suggested = await fetchNewsletterSuggestions(lastSent?.sent_at || undefined);
        setSections(suggested.map((s) => ({ sectionName: s.sectionName, items: s.items.map((it) => ({ ...it, checked: false })) })));
      }
      setLoading(false);
    })();
  }, [issueId]);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "subscribed")
      .then(({ count }) => setSubscriberCount(count ?? 0));
  }, []);

  function toggleItem(sectionIdx: number, itemIdx: number) {
    setSections((secs) => secs.map((s, si) => (si !== sectionIdx ? s : { ...s, items: s.items.map((it, ii) => (ii === itemIdx ? { ...it, checked: !it.checked } : it)) })));
  }

  function updateBlurb(sectionIdx: number, itemIdx: number, blurb: string) {
    setSections((secs) => secs.map((s, si) => (si !== sectionIdx ? s : { ...s, items: s.items.map((it, ii) => (ii === itemIdx ? { ...it, blurb } : it)) })));
  }

  function moveItem(sectionIdx: number, itemIdx: number, dir: -1 | 1) {
    setSections((secs) =>
      secs.map((s, si) => {
        if (si !== sectionIdx) return s;
        const target = itemIdx + dir;
        if (target < 0 || target >= s.items.length) return s;
        const items = [...s.items];
        [items[itemIdx], items[target]] = [items[target], items[itemIdx]];
        return { ...s, items };
      })
    );
  }

  function addCustomItem(sectionIdx: number) {
    setSections((secs) =>
      secs.map((s, si) =>
        si !== sectionIdx
          ? s
          : { ...s, items: [...s.items, { kind: "Resource", refId: `custom-${Date.now()}`, title: "", blurb: "", href: "", createdAt: new Date().toISOString(), checked: true }] }
      )
    );
  }

  async function refreshSuggestions() {
    const existingIds = new Set(sections.flatMap((s) => s.items.map((it) => it.refId)));
    const [{ data: lastSent }] = await Promise.all([supabase!.from("newsletter_issues").select("sent_at").eq("status", "sent").order("sent_at", { ascending: false }).limit(1).maybeSingle()]);
    const suggested = await fetchNewsletterSuggestions(lastSent?.sent_at || undefined);
    setSections((secs) =>
      secs.map((s) => {
        const fresh = suggested.find((f) => f.sectionName === s.sectionName);
        const newItems = (fresh?.items ?? []).filter((it) => !existingIds.has(it.refId)).map((it) => ({ ...it, checked: false }));
        return { ...s, items: [...s.items, ...newItems] };
      })
    );
    setNotice("Suggestions refreshed.");
  }

  function selectedSections() {
    return sections.map((s) => ({ sectionName: s.sectionName, items: s.items.filter((it) => it.checked).map(({ checked, ...rest }) => rest) })).filter((s) => s.items.length > 0);
  }

  function leadStoryHtmlFromText(text: string): string {
    return text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p style="margin: 0 0 14px;">${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")}</p>`)
      .join("");
  }

  async function save(): Promise<string | null> {
    if (!supabase || !user) return null;
    setSaving(true);
    setError("");
    const payload = {
      issue_number: issueNumber,
      subject: subject.trim(),
      lead_story_html: leadStoryHtmlFromText(leadStory),
      sections: selectedSections(),
      created_by: user.id,
    };
    const { data, error: err } = dbId
      ? await supabase.from("newsletter_issues").update(payload).eq("id", dbId).select().single()
      : await supabase.from("newsletter_issues").insert(payload).select().single();
    setSaving(false);
    if (err) {
      setError(err.message);
      return null;
    }
    setDbId(data.id);
    setNotice("Draft saved.");
    return data.id;
  }

  async function getAccessToken(): Promise<string | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  async function sendTest() {
    setError("");
    const id = await save();
    if (!id) return;
    const token = await getAccessToken();
    if (!token) return setError("Not signed in.");
    setSendingTest(true);
    const res = await fetch("/api/admin/newsletter/send/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ issueId: id, testEmail: profile?.email || user?.email }),
    });
    const body = await res.json().catch(() => ({}));
    setSendingTest(false);
    if (!res.ok) return setError(body.error || "Test send failed.");
    setNotice(`Test email sent to ${profile?.email || user?.email}.`);
  }

  async function sendReal() {
    setError("");
    const count = subscriberCount ?? 0;
    if (!window.confirm(`Send this issue to all ${count} subscribed reader${count === 1 ? "" : "s"}? This can't be undone.`)) return;
    const id = await save();
    if (!id) return;
    const token = await getAccessToken();
    if (!token) return setError("Not signed in.");
    setSendingReal(true);
    const res = await fetch("/api/admin/newsletter/send/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ issueId: id }),
    });
    const body = await res.json().catch(() => ({}));
    setSendingReal(false);
    if (!res.ok) return setError(body.error || "Send failed.");
    setStatus("sent");
    setNotice(`Sent to ${body.successCount} of ${body.recipientCount}${body.failureCount ? ` — ${body.failureCount} failed` : ""}.`);
  }

  const previewHtml = renderNewsletterHtml(
    { issueNumber, subject, leadStoryHtml: leadStoryHtmlFromText(leadStory), sections: selectedSections() },
    unsubscribeUrlFor(PREVIEW_TOKEN)
  );
  const totalSelected = sections.reduce((n, s) => n + s.items.filter((it) => it.checked).length, 0);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#6E685F", fontSize: 13 }}>Loading…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#6E685F", display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
          Issues
        </button>
        {status !== "draft" && (
          <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: status === "sent" ? "#1A6B3C" : "#D88A0A", background: status === "sent" ? "rgba(26,107,60,0.1)" : "rgba(245,166,35,0.14)", padding: "3px 9px", borderRadius: 999 }}>
            {status}
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Issue number</label>
          <input type="number" value={issueNumber ?? ""} onChange={(e) => setIssueNumber(e.target.value ? Number(e.target.value) : null)} style={inputStyle} disabled={status !== "draft"} />
        </div>
        <div>
          <label style={labelStyle}>Subject line</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. New funding calls, 3 upcoming events, and a new mentor" style={inputStyle} disabled={status !== "draft"} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>From the Hub — this issue's lead story</label>
        <textarea
          value={leadStory}
          onChange={(e) => setLeadStory(e.target.value)}
          placeholder="What's the one thing worth leading with this issue? Write a paragraph or two — separate paragraphs with a blank line."
          style={{ ...inputStyle, minHeight: 110, resize: "vertical", fontFamily: "inherit" }}
          disabled={status !== "draft"}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>Content — {totalSelected} item{totalSelected === 1 ? "" : "s"} selected</div>
        {status === "draft" && (
          <button onClick={refreshSuggestions} style={{ fontSize: 12, fontWeight: 600, color: ORANGE, background: "none", border: "none", cursor: "pointer" }}>
            Refresh suggestions
          </button>
        )}
      </div>

      {sections.map((section, si) => (
        <div key={section.sectionName} style={{ background: "#fff", border: "1.5px solid rgba(64,50,34,0.12)", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>{section.sectionName}</div>
          {section.items.length === 0 ? (
            <div style={{ fontSize: 12.5, color: "#8A8378" }}>Nothing suggested here right now — add one manually if it's worth including.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {section.items.map((item, ii) => (
                <div key={item.refId} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0", borderTop: ii > 0 ? "1px solid rgba(64,50,34,0.07)" : "none" }}>
                  <input type="checkbox" checked={item.checked} onChange={() => toggleItem(si, ii)} disabled={status !== "draft"} style={{ marginTop: 4 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>{item.title || "(untitled item)"}</div>
                    <textarea
                      value={item.blurb}
                      onChange={(e) => updateBlurb(si, ii, e.target.value)}
                      placeholder="One sentence of context for this item..."
                      disabled={status !== "draft"}
                      style={{ width: "100%", boxSizing: "border-box", marginTop: 6, fontSize: 12.5, padding: "7px 10px", borderRadius: 7, border: "1px solid rgba(64,50,34,0.12)", outline: "none", fontFamily: "inherit", resize: "vertical", minHeight: 40 }}
                    />
                  </div>
                  {status === "draft" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                      <button onClick={() => moveItem(si, ii, -1)} disabled={ii === 0} title="Move up" style={{ border: "none", background: "none", cursor: ii === 0 ? "default" : "pointer", color: ii === 0 ? "#D8D3C8" : "#6E685F", padding: 2 }}>
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M18 15 12 9l-6 6" /></svg>
                      </button>
                      <button onClick={() => moveItem(si, ii, 1)} disabled={ii === section.items.length - 1} title="Move down" style={{ border: "none", background: "none", cursor: ii === section.items.length - 1 ? "default" : "pointer", color: ii === section.items.length - 1 ? "#D8D3C8" : "#6E685F", padding: 2 }}>
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="m6 9 6 6 6-6" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {status === "draft" && (
            <button onClick={() => addCustomItem(si)} style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: ORANGE, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              + Add custom item
            </button>
          )}
        </div>
      ))}

      {error && <p style={{ margin: 0, fontSize: 12.5, color: "#E23A2E" }}>{error}</p>}
      {notice && !error && <p style={{ margin: 0, fontSize: 12.5, color: "#1A6B3C" }}>{notice}</p>}

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", borderTop: "1px solid rgba(64,50,34,0.1)", paddingTop: 16 }}>
        <button onClick={() => setPreviewOpen(true)} style={{ fontSize: 12.5, fontWeight: 600, color: DARK, background: "#F5F4F0", border: "none", borderRadius: 999, padding: "10px 18px", cursor: "pointer" }}>
          Preview
        </button>
        {status === "draft" && (
          <>
            <button onClick={save} disabled={saving} style={{ fontSize: 12.5, fontWeight: 600, color: DARK, background: "#F5F4F0", border: "none", borderRadius: 999, padding: "10px 18px", cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : "Save draft"}
            </button>
            <button onClick={sendTest} disabled={sendingTest} style={{ fontSize: 12.5, fontWeight: 600, color: "#285E7A", background: "rgba(40,94,122,0.1)", border: "none", borderRadius: 999, padding: "10px 18px", cursor: sendingTest ? "default" : "pointer", opacity: sendingTest ? 0.6 : 1 }}>
              {sendingTest ? "Sending…" : "Send test to myself"}
            </button>
            <button
              onClick={sendReal}
              disabled={sendingReal || totalSelected === 0}
              style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 600, color: "#fff", background: totalSelected === 0 ? "#D8D3C8" : ORANGE, border: "none", borderRadius: 999, padding: "10px 20px", cursor: sendingReal || totalSelected === 0 ? "default" : "pointer" }}
            >
              {sendingReal ? "Sending…" : `Send to ${subscriberCount ?? "…"} subscribers`}
            </button>
          </>
        )}
      </div>

      {previewOpen && (
        <div onClick={() => setPreviewOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(64,50,34,0.1)" }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>Preview</div>
              <button onClick={() => setPreviewOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#6E685F" }}>&times;</button>
            </div>
            <iframe title="Newsletter preview" srcDoc={previewHtml} style={{ flex: 1, border: "none", width: "100%" }} />
          </div>
        </div>
      )}
    </div>
  );
}
