"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../AuthProvider";
import { MAX_MEMBERS, MAX_TEAMS, SKILLS, mapSkills, type Applicant, type Contact, type MyRegistration, type MyProfile, type Person, type Req, type Status, type Team, type Viewer } from "./data";
import { MessageModal, ProfileModal, TeamModal, type ProfileValues, type TeamValues } from "./Forms";
import { ThemeSwitch, useSiklabTheme } from "../theme";
import MyPanel from "./MyPanel";
import ApplicantCard from "./ApplicantCard";
import PersonCard from "./PersonCard";
import TeamCard from "./TeamCard";
import { CARD, TEXT, HAIR, ICONS, Icon, MUTED, ORANGE, inputStyle } from "./ui";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";
const TEAMS_URL = `${BP}/pinasiklab/teams/`;
const LOGIN_HREF = `${BP}/login/?redirect=${encodeURIComponent(TEAMS_URL)}`;
const SIGNUP_HREF = `${BP}/signup/?redirect=${encodeURIComponent(TEAMS_URL)}`;

type Tab = "teams" | "members";
type PreviewAs = "guest" | "solo" | "leader" | "member";
type ModalState =
  | null
  | { kind: "profile" }
  | { kind: "team"; mode: "create" | "edit" }
  | { kind: "request"; team: Team }
  | { kind: "invite"; person: Person };
type RunResult = PromiseLike<{ error: { message: string } | null }>;

const SAMPLE_TEAM: Applicant = { id: "sample-team", participation: "team", full_name: "", team_name: "Sample Team: Baguio Waste Warriors", team_size: 3, member_names: ["Ana Dela Cruz", "Ben Santos", "Carla Lim"], skills: ["Programming / Software Development", "Environmental / Sustainability"], bio: "", created_at: "" };
const SAMPLE_PERSON: Applicant = { id: "sample-person", participation: "individual", full_name: "Sample Person: Juan Dela Cruz", team_name: "", team_size: null, member_names: [], skills: ["UI/UX / Product Design", "Research / Data Gathering"], bio: "Design student who loves user research and wants to help build something for Baguio.", created_at: "" };

const selectStyle = { ...inputStyle, width: "auto", padding: "9px 14px", borderRadius: 9999, fontSize: 13.5, cursor: "pointer" } as const;

export default function TeamFinder() {
  const { user, profile, loading: authLoading } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [me, setMe] = useState<MyProfile | null>(null);
  const [reqs, setReqs] = useState<Req[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [myReg, setMyReg] = useState<MyRegistration | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [preview, setPreview] = useState<PreviewAs | null>(null);
  const [previewChecked, setPreviewChecked] = useState(false);

  const [tab, setTab] = useState<Tab>("teams");
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "locked">("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);
  const { theme, toggle: toggleTheme } = useSiklabTheme();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("preview") === "1") {
        const as = (params.get("as") as PreviewAs) || "guest";
        import("./sampleData").then(({ getSample }) => {
          const s = getSample(as);
          setTeams(s.teams);
          setPeople(s.people);
          setMe(s.me);
          setReqs(s.reqs);
          setContacts(s.contacts);
          setPreview(as);
          setLoaded(true);
          setPreviewChecked(true);
        });
        return;
      }
    }
    setPreviewChecked(true);
  }, []);

  const load = useCallback(async () => {
    if (!supabase) {
      setSetupNeeded(true);
      setLoaded(true);
      return;
    }
    const [t, p] = await Promise.all([
      supabase.from("siklab_teams").select("*").order("created_at"),
      supabase.from("siklab_participants_public").select("*").order("created_at"),
    ]);
    if (t.error || p.error) {
      // The tables only exist once the 2026-09-25 migration has been run.
      setSetupNeeded(true);
      setLoaded(true);
      return;
    }
    setSetupNeeded(false);
    setTeams((t.data ?? []) as Team[]);
    setPeople((p.data ?? []) as Person[]);
    // Optional: only exists once the applicants migration has been run.
    const ap = await supabase.from("siklab_applicants_public").select("*").order("created_at");
    setApplicants(ap.error ? [] : ((ap.data ?? []) as Applicant[]));
    if (user) {
      const [m, r] = await Promise.all([
        supabase.from("siklab_participants").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("siklab_requests").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      ]);
      setMe((m.data as MyProfile | null) ?? null);
      if (!m.data) {
        const reg = await supabase.rpc("siklab_my_registration");
        setMyReg(((reg.data as MyRegistration[] | null) ?? [])[0] ?? null);
      } else setMyReg(null);
      setReqs((r.data ?? []) as Req[]);
    } else {
      setMe(null);
      setReqs([]);
    }
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    if (!authLoading && previewChecked && !preview) load();
  }, [authLoading, previewChecked, preview, load]);

  const myTeam = me?.team_id ? teams.find((t) => t.id === me.team_id) ?? null : null;
  const isLeader = !!(me && myTeam && myTeam.leader_id === me.id);

  useEffect(() => {
    if (preview || !supabase || !myTeam) {
      if (!preview) setContacts([]);
      return;
    }
    supabase.rpc("siklab_team_contacts", { p_team_id: myTeam.id }).then(({ data }) => setContacts((data ?? []) as Contact[]));
  }, [myTeam?.id, preview, people]); // eslint-disable-line react-hooks/exhaustive-deps

  const signedIn = preview ? preview !== "guest" : !!user;
  const status: Status = !signedIn ? "guest" : !me ? "noProfile" : myTeam ? "member" : "solo";

  const membersOf = useCallback(
    (teamId: string) => people.filter((p) => p.team_id === teamId).sort((a, b) => (a.team_joined_at ?? "").localeCompare(b.team_joined_at ?? "")),
    [people]
  );
  const isOpen = useCallback((t: Team) => !t.locked && membersOf(t.id).length < MAX_MEMBERS, [membersOf]);

  const viewer: Viewer = {
    status,
    myId: me?.id ?? null,
    myTeamId: myTeam?.id ?? null,
    isLeader,
    myTeamOpen: !!myTeam && isOpen(myTeam),
    loginHref: LOGIN_HREF,
  };

  const pendingWithTeam = (teamId: string) => reqs.find((r) => r.team_id === teamId && r.participant_id === me?.id);
  const pendingWithPerson = (personId: string) => (myTeam ? reqs.find((r) => r.team_id === myTeam.id && r.participant_id === personId) : undefined);

  const solos = useMemo(() => people.filter((p) => !p.team_id), [people]);
  const openTeams = teams.filter(isOpen).length;
  const applicantTeams = useMemo(() => applicants.filter((a) => a.participation === "team"), [applicants]);
  const applicantSolos = useMemo(() => applicants.filter((a) => a.participation === "individual"), [applicants]);
  const needle = q.trim().toLowerCase();
  const visibleApplicantTeams = applicantTeams.filter((a) => !skill && statusFilter === "all" && (!needle || `${a.team_name} ${a.member_names.join(" ")}`.toLowerCase().includes(needle)));
  const visibleApplicantSolos = applicantSolos.filter((a) => (!skill || mapSkills(a.skills).includes(skill)) && (!needle || `${a.full_name} ${a.bio}`.toLowerCase().includes(needle)));

  const visibleTeams = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return teams
      .filter((t) => {
        const open = isOpen(t);
        if (statusFilter === "open" && !open) return false;
        if (statusFilter === "locked" && open) return false;
        if (skill && !t.looking_for.includes(skill)) return false;
        if (needle && !t.name.toLowerCase().includes(needle) && !membersOf(t.id).some((m) => m.full_name.toLowerCase().includes(needle))) return false;
        return true;
      })
      .sort((a, b) => Number(isOpen(b)) - Number(isOpen(a)) || a.created_at.localeCompare(b.created_at));
  }, [teams, q, skill, statusFilter, isOpen, membersOf]);

  const visibleSolos = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return solos.filter((p) => {
      if (skill && !p.skills.includes(skill)) return false;
      if (needle && !`${p.full_name} ${p.interest} ${p.bio}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [solos, q, skill]);

  async function run(fn: () => RunResult, ok?: string): Promise<boolean> {
    if (preview) {
      setError("Preview mode: actions are turned off.");
      return false;
    }
    setBusy(true);
    setError("");
    setNotice("");
    const { error: err } = await fn();
    setBusy(false);
    if (err) {
      setError(err.message);
      return false;
    }
    if (ok) setNotice(ok);
    await load();
    return true;
  }

  const rpc = (name: string, args: Record<string, unknown>): RunResult => supabase!.rpc(name, args);

  const saveProfile = (v: ProfileValues) =>
    run(() => rpc("siklab_save_profile", { p_full_name: v.full_name, p_skills: v.skills, p_bio: v.bio, p_interest: v.interest, p_contact: v.contact, p_consent: v.consent }), "Profile saved.");
  const saveTeam = (mode: "create" | "edit", v: TeamValues) =>
    mode === "create"
      ? run(() => rpc("siklab_create_team", { p_name: v.name, p_looking_for: v.looking_for, p_note: v.note }), "Your team is live. Invite people from the “Find a member” tab.")
      : run(() => rpc("siklab_update_team", { p_team_id: myTeam!.id, p_name: v.name, p_looking_for: v.looking_for, p_note: v.note }), "Team updated.");
  const respond = (id: string, accept: boolean) => run(() => rpc("siklab_respond", { p_request_id: id, p_accept: accept }), accept ? "Added to the team." : "Declined.");
  const cancel = (id: string) => run(() => rpc("siklab_cancel_request", { p_request_id: id }), "Cancelled.");
  const toggleLock = () => run(() => rpc("siklab_set_locked", { p_team_id: myTeam!.id, p_locked: !myTeam!.locked }), myTeam!.locked ? "Team unlocked." : "Team locked in.");
  const leave = () => {
    if (window.confirm("Leave this team? You'll go back to the list of people looking for a team.")) run(() => rpc("siklab_leave_team", {}), "You left the team.");
  };
  const remove = (p: Person) => {
    if (window.confirm(`Remove ${p.full_name} from your team?`)) run(() => rpc("siklab_remove_member", { p_participant_id: p.id }), `${p.full_name} was removed.`);
  };

  function findTeam() {
    setTab("teams");
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const startTile = (
    <button
      onClick={() => (status === "solo" ? setModal({ kind: "team", mode: "create" }) : status === "noProfile" ? setModal({ kind: "profile" }) : (window.location.href = LOGIN_HREF))}
      style={{ background: "transparent", border: "2px dashed var(--tf-dash)", borderRadius: 20, padding: 22, minHeight: 200, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--tf-body)", textAlign: "center" }}
    >
      <span style={{ width: 44, height: 44, borderRadius: 9999, background: "rgba(242,101,34,0.1)", color: ORANGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon d={ICONS.plus} size={20} />
      </span>
      <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Start a team</span>
      <span style={{ fontSize: 13, lineHeight: 1.45, maxWidth: 210 }}>{MAX_TEAMS - teams.length} of {MAX_TEAMS} team slots left. You&rsquo;ll lead it and invite people who are still looking.</span>
    </button>
  );

  const tabBtn = (id: Tab, label: string, count: number) => (
    <button
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
      style={{ padding: "10px 20px", borderRadius: 9999, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", background: tab === id ? ORANGE : "transparent", color: tab === id ? "#fff" : "var(--tf-body)" }}
    >
      {label} <span style={{ opacity: 0.6, marginLeft: 4 }}>{count}</span>
    </button>
  );

  const stat = (n: string, label: string) => (
    <div style={{ flex: "1 1 150px" }}>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", color: TEXT, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: MUTED, marginTop: 6 }}>{label}</div>
    </div>
  );

  return (
    <div className="ib-siklab-tf" data-theme={theme} style={{ background: "var(--tf-page)" }}>
      <div className="ib-siklab-finder" style={{ maxWidth: 1240, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: -6 }}>
          <ThemeSwitch theme={theme} onToggle={toggleTheme} />
        </div>

        {preview && (
          <div style={{ background: "#FFF6DA", border: "1px solid #F0DCA0", borderRadius: 14, padding: "12px 16px", fontSize: 13, color: "#6B5410" }}>
            <strong>Preview mode</strong> (sample data, actions off). View as:{" "}
            {(["guest", "solo", "leader", "member"] as PreviewAs[]).map((a) => (
              <a key={a} href={`?preview=1&as=${a}`} style={{ marginRight: 10, fontWeight: a === preview ? 700 : 500, color: "#6B5410" }}>{a}</a>
            ))}
          </div>
        )}

        {setupNeeded && loaded && (
          <div style={{ background: CARD, border: `1px solid ${HAIR}`, borderRadius: 20, padding: "28px 30px" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: TEXT }}>The Team Finder is being set up</h2>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "var(--tf-body)" }}>
              It will be open here soon. In the meantime, you can read about the program on the <a href={`${BP}/pinasiklab/`} style={{ color: ORANGE, fontWeight: 600 }}>PinaSIKLab page</a>.
            </p>
          </div>
        )}

        {!setupNeeded && (
          <>
            <div style={{ background: CARD, border: `1px solid ${HAIR}`, borderRadius: 20, padding: "22px 26px", display: "flex", flexWrap: "wrap", gap: 20 }}>
              {stat(`${teams.length} / ${MAX_TEAMS}`, "Teams formed")}
              {stat(String(openTeams), "Teams open to new members")}
              {stat(String(solos.length + applicantSolos.length), "People looking for a team")}
            </div>

            <MyPanel
              status={status}
              me={me}
              myTeam={myTeam}
              isLeader={isLeader}
              members={myTeam ? membersOf(myTeam.id) : []}
              contacts={contacts}
              teams={teams}
              people={people}
              incomingInvites={reqs.filter((r) => r.kind === "invite" && r.participant_id === me?.id)}
              outgoingRequests={reqs.filter((r) => r.kind === "request" && r.participant_id === me?.id)}
              teamRequests={reqs.filter((r) => r.kind === "request" && r.team_id === myTeam?.id)}
              teamInvites={reqs.filter((r) => r.kind === "invite" && r.team_id === myTeam?.id)}
              busy={busy}
              loginHref={LOGIN_HREF}
              signupHref={SIGNUP_HREF}
              onCreateProfile={() => setModal({ kind: "profile" })}
              onEditProfile={() => setModal({ kind: "profile" })}
              onCreateTeam={() => setModal({ kind: "team", mode: "create" })}
              onFindTeam={findTeam}
              onEditTeam={() => setModal({ kind: "team", mode: "edit" })}
              onToggleLock={toggleLock}
              onRespond={respond}
              onCancel={cancel}
              onLeave={leave}
              onRemove={remove}
            />

            {(notice || error) && (
              <div role="status" style={{ borderRadius: 14, padding: "12px 16px", fontSize: 13.5, fontWeight: 600, background: error ? "var(--tf-red-bg)" : "var(--tf-green-bg)", color: error ? "var(--tf-red)" : "var(--tf-green)" }}>
                {error || notice}
              </div>
            )}

            <div ref={gridRef} style={{ scrollMarginTop: 90 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
                <div style={{ display: "flex", background: CARD, border: `1px solid ${HAIR}`, borderRadius: 9999, padding: 4, gap: 2 }}>
                  {tabBtn("teams", "Find a team", teams.length + applicantTeams.length)}
                  {tabBtn("members", "Find a member", solos.length + applicantSolos.length)}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: MUTED, display: "flex" }}><Icon d={ICONS.search} size={14} /></span>
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "teams" ? "Search teams or people" : "Search name or interest"} style={{ ...inputStyle, width: 230, borderRadius: 9999, padding: "9px 14px 9px 36px", fontSize: 13.5 }} />
                  </div>
                  {tab === "teams" && (
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | "open" | "locked")} style={selectStyle} aria-label="Team status">
                      <option value="all">All teams</option>
                      <option value="open">Open only</option>
                      <option value="locked">Locked / full</option>
                    </select>
                  )}
                  <select value={skill} onChange={(e) => setSkill(e.target.value)} style={selectStyle} aria-label="Skill">
                    <option value="">{tab === "teams" ? "Any skill needed" : "Any skill"}</option>
                    {SKILLS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
                {tab === "teams" ? (
                  <>
                    {visibleTeams.map((t) => (
                      <TeamCard
                        key={t.id}
                        team={t}
                        members={membersOf(t.id)}
                        viewer={viewer}
                        pending={pendingWithTeam(t.id)}
                        onRequest={(team) => setModal({ kind: "request", team })}
                        onCancel={cancel}
                        onNeedProfile={() => setModal({ kind: "profile" })}
                      />
                    ))}
                    {!q && !skill && statusFilter === "all" && <ApplicantCard sample a={SAMPLE_TEAM} loginHref={LOGIN_HREF} />}
                    {visibleApplicantTeams.map((a) => <ApplicantCard key={a.id} a={a} loginHref={LOGIN_HREF} />)}
                    {teams.length < MAX_TEAMS && status !== "member" && !q && !skill && statusFilter === "all" && startTile}
                  </>
                ) : (
                  <>
                  {!q && !skill && <ApplicantCard sample a={SAMPLE_PERSON} loginHref={LOGIN_HREF} />}
                  {visibleApplicantSolos.map((a) => <ApplicantCard key={a.id} a={a} loginHref={LOGIN_HREF} />)}
                  {visibleSolos.map((p) => (
                    <PersonCard
                      key={p.id}
                      person={p}
                      viewer={viewer}
                      teamName={myTeam?.name}
                      pending={pendingWithPerson(p.id)}
                      onInvite={(person) => setModal({ kind: "invite", person })}
                      onCancel={cancel}
                    />
                  ))}
                  </>
                )}
              </div>

              {loaded && tab === "teams" && visibleTeams.length === 0 && visibleApplicantTeams.length === 0 && (
                <p style={{ fontSize: 14.5, color: MUTED, margin: "6px 0 0" }}>{teams.length === 0 ? "No teams yet. Be the first to start one." : "No teams match those filters."}</p>
              )}
              {loaded && tab === "members" && visibleSolos.length === 0 && visibleApplicantSolos.length === 0 && (
                <p style={{ fontSize: 14.5, color: MUTED, margin: "6px 0 0" }}>{solos.length === 0 ? "Nobody is looking for a team right now." : "Nobody matches those filters."}</p>
              )}
              {!loaded && <p style={{ fontSize: 14.5, color: MUTED }}>Loading&hellip;</p>}
            </div>
          </>
        )}
      </div>

      {modal?.kind === "profile" && (
        <ProfileModal
          editing={!!me}
          initial={me ?? (myReg ? { full_name: myReg.full_name, skills: mapSkills(myReg.skills), bio: myReg.contribution, contact: myReg.phone } : undefined)}
          defaultName={profile?.full_name ?? ""}
          busy={busy}
          onClose={() => setModal(null)}
          onSave={saveProfile}
        />
      )}
      {modal?.kind === "team" && (
        <TeamModal
          mode={modal.mode}
          initial={modal.mode === "edit" && myTeam ? { name: myTeam.name, looking_for: myTeam.looking_for, note: myTeam.note } : modal.mode === "create" && myReg?.participation === "team" ? { name: myReg.team_name, looking_for: [], note: "" } : undefined}
          busy={busy}
          onClose={() => setModal(null)}
          onSave={(v) => saveTeam(modal.mode, v)}
        />
      )}
      {modal?.kind === "request" && (
        <MessageModal
          title={`Ask to join ${modal.team.name}`}
          subtitle="Tell the team leader why you'd be a good fit. They'll accept or decline, and you'll see the answer here."
          placeholder="What you'd bring, and what you'd like to work on…"
          submitLabel="Send request"
          busy={busy}
          onClose={() => setModal(null)}
          onSend={(message) => run(() => rpc("siklab_send_request", { p_team_id: modal.team.id, p_message: message }), `Request sent to ${modal.team.name}.`)}
        />
      )}
      {modal?.kind === "invite" && (
        <MessageModal
          title={`Invite ${modal.person.full_name}`}
          subtitle={`They'll see your invite next to their profile and can accept or decline. If they accept, they join ${myTeam?.name ?? "your team"}.`}
          placeholder="Why do you think they'd be a great fit?"
          submitLabel="Send invite"
          busy={busy}
          onClose={() => setModal(null)}
          onSend={(message) => run(() => rpc("siklab_send_invite", { p_participant_id: modal.person.id, p_message: message }), `Invite sent to ${modal.person.full_name}.`)}
        />
      )}
    </div>
  );
}
