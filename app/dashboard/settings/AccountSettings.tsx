"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";
import { supabase } from "../../../lib/supabaseClient";
import { uploadMentorPhoto } from "../../../lib/uploadLogo";
import { cardStyle, inputStyle, labelStyle, primaryButtonStyle, DARK, ORANGE } from "../styles";
import { PROFILE_AREAS_OF_INTEREST, PROFILE_SKILLS, PROFILE_LOOKING_FOR, PROFILE_CAN_OFFER } from "../../../lib/profileOptions";
import TagChips from "../TagChips";

const sectionTitle: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8B8479", marginBottom: 12 };

function ProfileSection() {
  const { profile, refreshProfile } = useAuth();
  const [photoUrl, setPhotoUrl] = useState(profile?.photo_url || "");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [preferredName, setPreferredName] = useState(profile?.preferred_name || "");
  const [roleTitle, setRoleTitle] = useState(profile?.role_title || "");
  const [orgAffiliation, setOrgAffiliation] = useState(profile?.org_affiliation || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [areasOfInterest, setAreasOfInterest] = useState<string[]>(profile?.areas_of_interest ?? []);
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [lookingFor, setLookingFor] = useState<string[]>(profile?.looking_for ?? []);
  const [canOffer, setCanOffer] = useState<string[]>(profile?.can_offer ?? []);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setPhotoUrl(profile.photo_url || "");
    setFullName(profile.full_name || "");
    setPreferredName(profile.preferred_name || "");
    setRoleTitle(profile.role_title || "");
    setOrgAffiliation(profile.org_affiliation || "");
    setBio(profile.bio || "");
    setLocation(profile.location || "");
    setAreasOfInterest(profile.areas_of_interest ?? []);
    setSkills(profile.skills ?? []);
    setLookingFor(profile.looking_for ?? []);
    setCanOffer(profile.can_offer ?? []);
  }, [profile]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      setPhotoUrl(await uploadMentorPhoto(file));
    } catch (err: any) {
      setError(err.message || "Photo upload failed.");
    }
    setUploading(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !profile) return;
    if (!fullName.trim()) return setError("Add your full name.");
    setError("");
    setSaved(false);
    setBusy(true);
    const { error: err } = await supabase
      .from("profiles")
      .update({
        photo_url: photoUrl,
        full_name: fullName.trim(),
        preferred_name: preferredName.trim(),
        role_title: roleTitle.trim(),
        org_affiliation: orgAffiliation.trim(),
        bio: bio.trim(),
        location: location.trim(),
        areas_of_interest: areasOfInterest,
        skills,
        looking_for: lookingFor,
        can_offer: canOffer,
      })
      .eq("id", profile.id);
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    await refreshProfile();
    setSaved(true);
  }

  return (
    <div style={cardStyle}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: DARK }}>Build your profile</h2>
      <p style={{ margin: "0 0 22px", fontSize: 13, color: "#5A544B" }}>Helps mentors, founders, and organizations discover you and know how to connect.</p>

      <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <div style={sectionTitle}>Basics</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {photoUrl ? (
                <img src={photoUrl} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F6F2EA", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B8479", fontSize: 10.5, textAlign: "center" }}>No photo</div>
              )}
              <div>
                <label style={{ display: "inline-block", fontSize: 13, fontWeight: 600, color: ORANGE, cursor: "pointer" }}>
                  {uploading ? "Uploading…" : "Upload photo"}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} style={{ display: "none" }} />
                </label>
                <div style={{ fontSize: 11.5, color: "#8B8479", marginTop: 2 }}>PNG or JPG, up to 2MB</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Full name</label>
                <input style={inputStyle} required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Juan Dela Cruz" />
              </div>
              <div>
                <label style={labelStyle}>Preferred name (optional)</label>
                <input style={inputStyle} value={preferredName} onChange={(e) => setPreferredName(e.target.value)} placeholder="What people call you" />
              </div>
              <div>
                <label style={labelStyle}>Role / title</label>
                <input style={inputStyle} value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="e.g. Founder, Student, Researcher" />
              </div>
              <div>
                <label style={labelStyle}>Organization affiliation</label>
                <input style={inputStyle} value={orgAffiliation} onChange={(e) => setOrgAffiliation(e.target.value)} placeholder="e.g. Saint Louis University" />
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Baguio City" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Short bio</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A sentence or two about you." />
            </div>
          </div>
        </div>

        <div>
          <div style={sectionTitle}>Interests &amp; expertise</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Areas of interest</label>
              <TagChips value={areasOfInterest} onChange={setAreasOfInterest} suggestions={PROFILE_AREAS_OF_INTEREST} />
            </div>
            <div>
              <label style={labelStyle}>Skills / expertise</label>
              <TagChips value={skills} onChange={setSkills} suggestions={PROFILE_SKILLS} />
            </div>
          </div>
        </div>

        <div>
          <div style={sectionTitle}>Collaboration</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>What you&rsquo;re looking for</label>
              <TagChips value={lookingFor} onChange={setLookingFor} suggestions={PROFILE_LOOKING_FOR} />
            </div>
            <div>
              <label style={labelStyle}>What you can offer</label>
              <TagChips value={canOffer} onChange={setCanOffer} suggestions={PROFILE_CAN_OFFER} />
            </div>
          </div>
        </div>

        {saved && <p style={{ margin: 0, fontSize: 13, color: "#1A6B3C", fontWeight: 600 }}>Profile updated successfully.</p>}
        {error && <p style={{ margin: 0, fontSize: 13, color: "#E23A2E" }}>{error}</p>}

        <div>
          <button type="submit" disabled={busy || uploading} style={{ ...primaryButtonStyle, opacity: busy ? 0.7 : 1 }}>
            {busy ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

function EmailSection() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !email.trim()) return;
    setError("");
    setSent(false);
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ email: email.trim() });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
    setEmail("");
  }

  return (
    <div style={cardStyle}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: DARK }}>Email address</h2>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#5A544B" }}>Current: <strong>{user?.email}</strong></p>
      <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input style={{ ...inputStyle, flex: 1, minWidth: 220 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="new-email@example.com" />
        <button type="submit" disabled={busy} style={{ ...primaryButtonStyle, opacity: busy ? 0.7 : 1, flexShrink: 0 }}>{busy ? "Sending…" : "Update email"}</button>
      </form>
      {sent && <p style={{ margin: "12px 0 0", fontSize: 12.5, color: "#1A6B3C" }}>Check both your old and new inbox to confirm the change.</p>}
      {error && <p style={{ margin: "12px 0 0", fontSize: 12.5, color: "#E23A2E" }}>{error}</p>}
    </div>
  );
}

function PasswordSection() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    if (!supabase) return;
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setPassword("");
    setConfirm("");
    setSaved(true);
  }

  return (
    <div style={cardStyle}>
      <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600, color: DARK }}>Password</h2>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>New password</label>
            <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <label style={labelStyle}>Confirm password</label>
            <input style={inputStyle} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        {saved && <p style={{ margin: 0, fontSize: 12.5, color: "#1A6B3C" }}>Password updated.</p>}
        {error && <p style={{ margin: 0, fontSize: 12.5, color: "#E23A2E" }}>{error}</p>}
        <div>
          <button type="submit" disabled={busy} style={{ ...primaryButtonStyle, opacity: busy ? 0.7 : 1 }}>{busy ? "Saving…" : "Update password"}</button>
        </div>
      </form>
    </div>
  );
}

interface MyOrgVisibility {
  id: string;
  name: string;
  approval_status: string;
  is_public: boolean;
}

function OrganizationVisibilitySection() {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<MyOrgVisibility[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!supabase || !user) return;
    supabase
      .from("organizations")
      .select("id,name,approval_status,is_public")
      .eq("owner_id", user.id)
      .then(({ data }) => {
        setOrgs((data as MyOrgVisibility[]) ?? []);
        setLoaded(true);
      });
  }, [user]);

  if (!loaded || orgs.length === 0) return null;

  return (
    <div style={cardStyle}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: DARK }}>Organization visibility</h2>
      <p style={{ margin: "0 0 18px", fontSize: 13, color: "#5A544B" }}>
        Whether your organization is public is managed by Incubator Baguio, not toggled here &mdash; this keeps an org from disappearing from the directory without review. Contact us to request a change.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {orgs.map((o) => (
          <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.1)", borderRadius: 10, padding: "10px 14px" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{o.name}</span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: o.is_public ? "#1A6B3C" : "#8B8479" }}>
              {o.approval_status === "pending" ? "Pending review" : o.is_public ? "Public" : "Hidden"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DangerZone() {
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filed, setFiled] = useState(false);

  async function submit() {
    if (!supabase || !user) return;
    if (!window.confirm("Request deletion of your account? Incubator Baguio staff will process this manually.")) return;
    setError("");
    setBusy(true);
    const { error: err } = await supabase.from("account_deletion_requests").insert({ user_id: user.id, email: user.email || "", note: note.trim() });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setFiled(true);
  }

  return (
    <div style={{ ...cardStyle, border: "1px solid rgba(226,58,46,0.25)" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: "#E23A2E" }}>Danger zone</h2>
      {filed ? (
        <p style={{ margin: 0, fontSize: 13.5, color: "#5A544B" }}>Request received. Incubator Baguio staff will process it and follow up at {user?.email}.</p>
      ) : (
        <>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#5A544B" }}>
            Deleting an account requires staff action, so this files a request rather than deleting instantly. We&rsquo;ll follow up at {user?.email}.
          </p>
          <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical", marginBottom: 12 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything we should know? (optional)" />
          {error && <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#E23A2E" }}>{error}</p>}
          <button onClick={submit} disabled={busy} style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", background: "#E23A2E", border: "none", borderRadius: 9999, padding: "10px 20px", cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
            {busy ? "Submitting…" : "Request account deletion"}
          </button>
        </>
      )}
    </div>
  );
}

export default function AccountSettings() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <ProfileSection />
      <EmailSection />
      <PasswordSection />
      <OrganizationVisibilitySection />
      <DangerZone />
    </div>
  );
}
