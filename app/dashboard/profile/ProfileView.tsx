"use client";

import { useAuth } from "../../AuthProvider";
import { cardStyle, DARK, ORANGE } from "../styles";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

function Chips({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return <span style={{ fontSize: 13, color: "#6E685F" }}>Not set yet.</span>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((t) => (
        <span key={t} style={{ fontSize: 12.5, fontWeight: 600, color: ORANGE, background: "rgba(242,101,34,0.1)", padding: "6px 12px", borderRadius: 9999 }}>
          {t}
        </span>
      ))}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: value ? DARK : "#6E685F" }}>{value || "Not set yet."}</div>
    </div>
  );
}

export default function ProfileView() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "40px 0", textAlign: "center", color: "#6E685F", fontSize: 14 }}>Loading&hellip;</div>;
  }
  if (!profile) return null;

  const name = profile.preferred_name?.trim() || profile.full_name?.trim() || "Your profile";
  const initials = (profile.full_name || "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 600, color: DARK, letterSpacing: "-0.02em" }}>Your profile</h2>
        <p style={{ margin: 0, fontSize: 14, color: "#5A544B" }}>This is how mentors, founders, and organizations see you in the ecosystem.</p>
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          {profile.photo_url ? (
            <img src={profile.photo_url} alt="" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(242,101,34,0.12)", color: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
              {initials || "?"}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: DARK }}>{name}</div>
            {(profile.role_title || profile.org_affiliation) && (
              <div style={{ fontSize: 13.5, color: "#5A544B", marginTop: 2 }}>
                {[profile.role_title, profile.org_affiliation].filter(Boolean).join(" · ")}
              </div>
            )}
            {profile.location && <div style={{ fontSize: 12.5, color: "#6E685F", marginTop: 4 }}>{profile.location}</div>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Field label="Bio" value={profile.bio} />

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 8 }}>Areas of interest</div>
            <Chips items={profile.areas_of_interest} />
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 8 }}>Skills / expertise</div>
            <Chips items={profile.skills} />
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 8 }}>Looking for</div>
            <Chips items={profile.looking_for} />
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 8 }}>Can offer</div>
            <Chips items={profile.can_offer} />
          </div>
        </div>

        <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
          <a
            href={`${BP}/dashboard/settings/`}
            style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", background: ORANGE, padding: "11px 20px", borderRadius: 9999, textDecoration: "none" }}
          >
            Edit profile
          </a>
        </div>
      </div>
    </div>
  );
}
