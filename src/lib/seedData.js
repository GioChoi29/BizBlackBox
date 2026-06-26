const TN = ["Alpha","Beta","Gamma","Delta","Epsilon","Zeta","Eta","Theta","Iota","Kappa","Lambda","Mu","Nu","Xi","Omicron","Pi","Rho","Sigma","Tau","Upsilon"];

export function buildTeams() {
  return TN.map((n, i) => ({
    _id: i + 1,
    name: `Team ${n}`,
    jm: `JM ${n}`,
    jmPhone: `010-${String(1000 + i).padStart(4, "0")}-${String(5000 + i).padStart(4, "0")}`,
    jmEmail: `jm.${n.toLowerCase()}@bbb.org`,
    workRoom: `Room ${201 + Math.floor(i / 4)}`,
    students: Array.from({ length: 8 }, (_, j) => ({
      id: `${i + 1}-${j + 1}`,
      name: `Student ${i * 8 + j + 1}`,
      checkedIn: false,
      phone: null,
      email: null,
      // Dorm room lives on the roster entry (8 students share a room).
      room: `Room ${301 + i}`,
      floor: "3F",
      transport: null,
      insurance: null,
      emergencyName: null,
      emergencyRel: null,
      emergencyPhone: null,
    })),
  }));
}

export function buildSubmissions() {
  return TN.map((_, i) => ({
    teamId: i + 1,
    submitted: false,
    by: null,
    ts: null,
  }));
}

// Initial seed password for all dev users — hashed at seed time.
// Override per-user via Admin Console → Reset Password.
export const SEED_PASSWORD = "Bbb-test-1234";

export function buildUsers() {
  const users = [];
  TN.forEach((n, i) => {
    users.push({
      name: `JM ${n}`,
      username: `jm.${n.toLowerCase()}`,
      role: "junior_mentor",
      teamId: i + 1,
      email: `jm.${n.toLowerCase()}@bbb.org`,
      // Mentor dorm room lives on the user record.
      room: `Room ${321 + Math.floor(i / 4)}`,
      floor: "3F",
      mustChangePassword: true,
    });
    for (let j = 0; j < 8; j++) {
      const num = i * 8 + j + 1;
      users.push({
        name: `Student ${num}`,
        username: `student${num}`,
        role: "student",
        teamId: i + 1,
        email: `student${num}@bbb.org`,
        mustChangePassword: true,
      });
    }
  });
  ["Kim", "Lee", "Park", "Choi"].forEach((s) => {
    users.push({
      name: `SM ${s}`,
      username: `sm.${s.toLowerCase()}`,
      role: "senior_mentor",
      teamId: null,
      email: `sm.${s.toLowerCase()}@bbb.org`,
      mustChangePassword: true,
    });
  });
  users.push({
    name: "Admin",
    username: "admin",
    role: "admin",
    teamId: null,
    email: "admin@bbb.org",
    mustChangePassword: false,
  });
  return users;
}

export function buildQna() {
  const BASE = 1737129600000;
  // Each question carries a `replies` thread; questions and replies record the
  // author's user id (null in seed data) so follow-ups and edit rights resolve.
  return [
    { title: "What should we bring for the overnight stay?", body: "", by: "Student 3", byId: null, tm: 1, ts: BASE - 3600000, category: "logistics", visibility: "public", resolved: true,
      replies: [{ id: "seed-r1", text: "Bring toiletries, a change of clothes, laptop + charger. Bedding is provided.", by: "Admin", byId: null, role: "admin", ts: BASE - 3500000 }] },
    { title: "Can we use external data sources?", body: "Wondering if we're allowed to pull in public datasets for the project.", by: "Student 15", byId: null, tm: 2, ts: BASE - 1800000, category: "rules", visibility: "public", resolved: true,
      replies: [{ id: "seed-r2", text: "Yes, any publicly available data. No proprietary databases.", by: "Admin", byId: null, role: "admin", ts: BASE - 1700000 }] },
    { title: "Is there Wi-Fi at the venue?", body: "", by: "Student 40", byId: null, tm: 5, ts: BASE - 600000, category: "logistics", visibility: "public", resolved: false, replies: [] },
  ];
}

export function buildAnnouncements() {
  const BASE = 1737129600000;
  return [
    { title: "Welcome to BBB 2026!", body: "We're excited to have all 20 teams compete. Check the schedule and transport info carefully.", author: "Admin", ts: BASE - 86400000, pinned: true },
    { title: "Bus Reminder", body: "Main bus departs 8:00 AM sharp from 종합운동장역. Arrive by 7:45. Backup: 광역버스 7001 at 8:15 or 8:45.", author: "Admin", ts: BASE - 43200000, pinned: false },
  ];
}

export function buildSchedule() {
  const items = [
    { time: "08:00", ev: "Bus Departure", loc: "종합운동장역", day: 1, type: "transport" },
    { time: "09:30", ev: "Arrival & Registration", loc: "Main Lobby", day: 1, type: "logistics" },
    { time: "10:00", ev: "Opening Ceremony", loc: "Grand Hall", day: 1, type: "ceremony" },
    { time: "10:45", ev: "Case Brief Distribution", loc: "Grand Hall", day: 1, type: "competition" },
    { time: "11:00", ev: "Work Session 1", loc: "Team Rooms", day: 1, type: "competition" },
    { time: "12:30", ev: "Lunch", loc: "Dining Hall", day: 1, type: "break" },
    { time: "13:30", ev: "Work Session 2", loc: "Team Rooms", day: 1, type: "competition" },
    { time: "15:30", ev: "Mentor Check-in Round 1", loc: "Team Rooms", day: 1, type: "mentoring" },
    { time: "17:00", ev: "Work Session 3", loc: "Team Rooms", day: 1, type: "competition" },
    { time: "18:30", ev: "Dinner", loc: "Dining Hall", day: 1, type: "break" },
    { time: "19:30", ev: "Work Session 4", loc: "Team Rooms", day: 1, type: "competition" },
    { time: "22:00", ev: "Evening Wrap-up", loc: "Team Rooms", day: 1, type: "logistics" },
    { time: "23:00", ev: "Lights Out", loc: "Dormitory Rooms", day: 1, type: "logistics" },
    { time: "07:00", ev: "Wake Up & Breakfast", loc: "Dining Hall", day: 2, type: "break" },
    { time: "08:00", ev: "Final Work Session", loc: "Team Rooms", day: 2, type: "competition" },
    { time: "10:00", ev: "Submission Deadline", loc: "Online", day: 2, type: "competition" },
    { time: "10:30", ev: "Preliminary Presentations", loc: "Various", day: 2, type: "competition" },
    { time: "13:00", ev: "Lunch", loc: "Dining Hall", day: 2, type: "break" },
    { time: "14:00", ev: "Finals Presentations", loc: "Grand Hall", day: 2, type: "competition" },
    { time: "16:00", ev: "Judging & Deliberation", loc: "—", day: 2, type: "logistics" },
    { time: "17:00", ev: "Awards Ceremony", loc: "Grand Hall", day: 2, type: "ceremony" },
    { time: "18:00", ev: "Closing & Departure", loc: "Main Lobby", day: 2, type: "logistics" },
  ];
  return items.map((x, i) => ({ ...x, order: i }));
}

export function buildMentorsSM() {
  return [
    { name: "SM Kim", phone: "010-9000-0001", email: "sm.kim@bbb.org", teams: "Teams 1–5" },
    { name: "SM Lee", phone: "010-9000-0002", email: "sm.lee@bbb.org", teams: "Teams 6–10" },
    { name: "SM Park", phone: "010-9000-0003", email: "sm.park@bbb.org", teams: "Teams 11–15" },
    { name: "SM Choi", phone: "010-9000-0004", email: "sm.choi@bbb.org", teams: "Teams 16–20" },
  ];
}

export function buildVenue() {
  return [
    { name: "Grand Hall", floor: "1F", purpose: "Opening / Closing / Finals", cap: "250" },
    { name: "Presentation Hall A", floor: "1F", purpose: "Prelim Rounds (Groups 1–2)", cap: "80" },
    { name: "Presentation Hall B", floor: "1F", purpose: "Prelim Rounds (Groups 3–4)", cap: "80" },
    { name: "Dining Hall", floor: "1F", purpose: "Meals", cap: "200" },
    { name: "Rooms 201–205", floor: "2F", purpose: "Team Work Rooms", cap: "~15 ea." },
    { name: "Rooms 301–325", floor: "3F", purpose: "Dormitory", cap: "~8 ea." },
    { name: "Admin Office", floor: "1F", purpose: "Staff HQ / Lost & Found", cap: "10" },
  ];
}

export function buildPrelim() {
  return [
    { teams: [1, 2, 3, 4, 5], time: "10:30 – 11:15", room: "Presentation Hall A" },
    { teams: [6, 7, 8, 9, 10], time: "11:15 – 12:00", room: "Presentation Hall A" },
    { teams: [11, 12, 13, 14, 15], time: "10:30 – 11:15", room: "Presentation Hall B" },
    { teams: [16, 17, 18, 19, 20], time: "11:15 – 12:00", room: "Presentation Hall B" },
  ];
}

export function buildTransport() {
  return {
    _id: "transport",
    main: {
      time: "08:00 AM",
      label: "Main Bus · Recommended",
      pickup: "종합운동장역",
      pickupSub: "Sports Complex Station",
      capacity: "4 buses",
      capacitySub: "Arrive 10 min early",
      warning: "Please arrive by 7:45 AM. Buses depart at 8:00 AM sharp.",
    },
    backups: [
      { route: "광역버스 7001", time: "08:15 AM", note: "If you miss the main bus" },
      { route: "광역버스 7001", time: "08:45 AM", note: "Last backup option" },
    ],
    personal: {
      title: "Self-Drive",
      note: "If arriving by personal vehicle, use the venue's main entrance parking lot.",
    },
  };
}
