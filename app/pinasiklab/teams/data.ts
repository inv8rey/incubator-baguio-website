export const MAX_TEAMS = 30;
export const MAX_MEMBERS = 5;

// Same list is used for "my skills" on a profile and "looking for" on a team,
// so a skill someone offers is exactly what a team can ask for.
export const SKILLS = [
  "Developer",
  "Designer",
  "Data / AI",
  "Hardware / IoT",
  "Business",
  "Research",
  "Communications",
  "Project management",
  "Pitching",
  "Domain expert",
];

export interface Team {
  id: string;
  name: string;
  leader_id: string;
  looking_for: string[];
  note: string;
  locked: boolean;
  created_at: string;
}

export interface Person {
  id: string;
  full_name: string;
  skills: string[];
  bio: string;
  interest: string;
  team_id: string | null;
  team_joined_at: string | null;
  created_at: string;
}

export interface MyProfile extends Person {
  user_id: string;
  contact: string;
}

export interface Req {
  id: string;
  team_id: string;
  participant_id: string;
  kind: "request" | "invite";
  message: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  created_at: string;
}

export interface Contact {
  participant_id: string;
  full_name: string;
  contact: string;
}

/** guest = logged out, noProfile = logged in but no Team Finder profile yet. */
export type Status = "guest" | "noProfile" | "solo" | "member";

export interface Viewer {
  status: Status;
  myId: string | null;
  myTeamId: string | null;
  isLeader: boolean;
  /** Only meaningful for leaders: can their team still take people? */
  myTeamOpen: boolean;
  loginHref: string;
}
