// Dev-only sample data behind /pinasiklab/teams/?preview=1&as=guest|solo|leader|member
// so the layout can be reviewed without accounts or a database. TeamFinder
// only imports this when NODE_ENV !== "production", so it never ships.
import type { Contact, MyProfile, Person, Req, Team } from "./data";

const d = (n: number) => new Date(Date.UTC(2026, 8, n)).toISOString();

function person(id: string, full_name: string, skills: string[], team_id: string | null, day: number, interest = "", bio = ""): Person {
  return { id, full_name, skills, bio, interest, team_id, team_joined_at: team_id ? d(day) : null, created_at: d(day) };
}

const people: Person[] = [
  person("p1", "Ana Reyes", ["Developer", "Data / AI"], "t1", 1),
  person("p2", "Mark Dizon", ["Designer"], "t1", 2),
  person("p3", "Joy Tolentino", ["Business", "Pitching"], "t1", 3),
  person("p4", "Carlo Bautista", ["Hardware / IoT", "Developer"], "t2", 1),
  person("p5", "Lea Santos", ["Research", "Domain expert"], "t2", 2),
  person("p6", "Ken Aquino", ["Pitching", "Business"], "t2", 3),
  person("p7", "Mika Lim", ["Designer", "Communications"], "t2", 4),
  person("p8", "Paolo Cruz", ["Developer"], "t2", 5),
  person("p9", "Sofia Ramos", ["Communications", "Project management"], "t3", 1),
  person("p10", "Ivan Mercado", ["Developer"], "t3", 2),
  person("p11", "Dan Pascual", ["Business"], "t4", 1),
  person("p12", "Rica Galang", ["Research"], "t4", 2),
  person("p13", "Jun Oliva", ["Developer", "Hardware / IoT"], "t4", 3),
  person("p14", "Mae Lopez", ["Developer", "Data / AI"], "t5", 1),
  person("s1", "Grace Tan", ["Designer", "Communications"], null, 6, "Tourism and cultural heritage", "Fourth-year design student who has run two community art projects in Baguio."),
  person("s2", "Miguel Ortiz", ["Data / AI", "Developer"], null, 7, "Air quality and climate", "Builds dashboards and small ML models. Looking for a team with a real field problem."),
  person("s3", "Hannah Cruz", ["Research", "Domain expert"], null, 8, "Public health", "Nurse and researcher; comfortable with surveys and community interviews."),
  person("s4", "Rafael Diaz", ["Business", "Pitching"], null, 9, "Local enterprise and livelihood", "Young entrepreneur who has pitched at two local competitions."),
  person("s5", "Bea Villanueva", ["Hardware / IoT"], null, 10, "Disaster resilience", "Arduino and sensor tinkerer, happy to prototype quickly."),
  person("s6", "Luis Mendoza", ["Project management", "Communications"], null, 11, "Mobility and transport"),
  person("s7", "Nina Castro", ["Designer"], null, 12, "Waste and recycling", "UI/UX freelancer."),
  person("s8", "Tomas Rivera", ["Developer", "Research"], null, 13, "Education technology"),
];

const teams: Team[] = [
  { id: "t1", name: "Team Kalasag", leader_id: "p1", looking_for: ["Research", "Communications"], note: "We want to tackle flooding along the Balili River with low-cost sensors.", locked: false, created_at: d(1) },
  { id: "t2", name: "Pine Sparks", leader_id: "p4", looking_for: [], note: "Smart streetlights for steep roads.", locked: true, created_at: d(1) },
  { id: "t3", name: "Kayang Baguio", leader_id: "p9", looking_for: ["Designer", "Data / AI", "Research"], note: "Community-first solutions for tourism and waste.", locked: false, created_at: d(2) },
  { id: "t4", name: "Strawberry Fields", leader_id: "p11", looking_for: [], note: "We're complete for now. Good luck, everyone!", locked: true, created_at: d(2) },
  { id: "t5", name: "Cordillera Coders", leader_id: "p14", looking_for: ["Designer", "Business", "Pitching", "Hardware / IoT"], note: "", locked: false, created_at: d(3) },
];

const req = (id: string, team_id: string, participant_id: string, kind: Req["kind"], message: string): Req => ({
  id, team_id, participant_id, kind, message, status: "pending", created_at: d(14),
});

const contacts: Contact[] = [
  { participant_id: "p1", full_name: "Ana Reyes", contact: "ana.reyes@example.com" },
  { participant_id: "p2", full_name: "Mark Dizon", contact: "m.me/markdizon" },
  { participant_id: "p3", full_name: "Joy Tolentino", contact: "0917 000 0000" },
];

export type PreviewAs = "guest" | "solo" | "leader" | "member";

export function getSample(as: PreviewAs) {
  const withContact = (id: string): MyProfile => {
    const p = people.find((x) => x.id === id)!;
    return { ...p, user_id: `u-${id}`, contact: "you@example.com" };
  };
  if (as === "solo") {
    return {
      teams, people, me: withContact("s1"), contacts: [],
      reqs: [
        req("r1", "t3", "s1", "invite", "We love your tourism focus. Come design with us?"),
        req("r2", "t1", "s1", "request", "I can design the sensor dashboard and public-facing pages."),
      ],
    };
  }
  if (as === "leader") {
    return {
      teams, people, me: withContact("p1"), contacts,
      reqs: [
        req("r3", "t1", "s2", "request", "I've built air-quality dashboards before and would love to help with the sensor data."),
        req("r4", "t1", "s3", "request", "Nurse and researcher; I can run the community interviews."),
        req("r5", "t1", "s5", "invite", "Your sensor experience would be a great fit."),
      ],
    };
  }
  if (as === "member") return { teams, people, me: withContact("p2"), contacts, reqs: [] };
  return { teams, people, me: null, contacts: [], reqs: [] };
}
