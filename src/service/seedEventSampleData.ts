/**
 * Seed sample teams + attendance + registrations for an event.
 * Use from Event Dashboard "Add sample data" to get teams and analytics.
 */
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firebaseDB";

const SAMPLE_TEAMS = [
  { name: "Team Alpha", status: "registered" as const, currentRound: 1, members: [{ name: "Rahul Sharma", rollNumber: "CS001", userId: "sample-u1" }, { name: "Priya Patel", rollNumber: "CS002", userId: "sample-u2" }] },
  { name: "Team Beta", status: "registered" as const, currentRound: 1, members: [{ name: "Amit Kumar", rollNumber: "EC001", userId: "sample-u3" }, { name: "Sneha Singh", rollNumber: "EC002", userId: "sample-u4" }] },
  { name: "Code Crushers", status: "checked_in" as const, currentRound: 1, members: [{ name: "Riya Verma", rollNumber: "CS010", userId: "sample-u5" }, { name: "Karthik Nair", rollNumber: "CS011", userId: "sample-u6" }] },
  { name: "Debug Dynasty", status: "checked_in" as const, currentRound: 1, members: [{ name: "Arjun Bhat", rollNumber: "CS020", userId: "sample-u7" }, { name: "Pooja Reddy", rollNumber: "CS021", userId: "sample-u8" }] },
  { name: "Team Gamma", status: "qualified" as const, currentRound: 2, members: [{ name: "Vikram Reddy", rollNumber: "IT001", userId: "sample-u9" }, { name: "Anita Nair", rollNumber: "IT002", userId: "sample-u10" }] },
  { name: "Pixel Pioneers", status: "qualified" as const, currentRound: 2, members: [{ name: "Aditya Rao", rollNumber: "CS030", userId: "sample-u11" }, { name: "Nisha Krishnan", rollNumber: "CS031", userId: "sample-u12" }] },
  { name: "Bug Busters", status: "eliminated" as const, currentRound: 1, members: [{ name: "Varun Kapoor", rollNumber: "EC020", userId: "sample-u13" }, { name: "Isha Gupta", rollNumber: "EC021", userId: "sample-u14" }] },
  { name: "Queue Crew", status: "waitlisted" as const, currentRound: 1, members: [{ name: "Rahul Menon", rollNumber: "IT025", userId: "sample-u15" }, { name: "Divya Nambiar", rollNumber: "IT026", userId: "sample-u16" }] },
  { name: "Cache Kings", status: "waitlisted" as const, currentRound: 1, members: [{ name: "Aarav Shah", rollNumber: "CS050", userId: "sample-u17" }] },
];

/** User IDs we'll mark as checked-in (for analytics + Promote button) */
const CHECKED_IN_USER_IDS = ["sample-u5", "sample-u6", "sample-u7", "sample-u8", "sample-u9", "sample-u10", "sample-u11", "sample-u12"];

/** Spread check-ins over ~2 hours so "Check-ins over time" chart has shape */
const CHECK_IN_OFFSETS_MS = [0, 5 * 60 * 1000, 12 * 60 * 1000, 20 * 60 * 1000, 35 * 60 * 1000, 45 * 60 * 1000, 60 * 60 * 1000, 90 * 60 * 1000];

export async function seedEventSampleData(eventId: string): Promise<{ teams: number; attendance: number; registrations: number }> {
  const now = Date.now();
  const teamsRef = collection(db, COLLECTIONS.TEAMS);
  const attRef = collection(db, COLLECTIONS.ATTENDANCE);
  const regsRef = collection(db, COLLECTIONS.REGISTRATIONS);

  let teamsAdded = 0;
  for (const team of SAMPLE_TEAMS) {
    await addDoc(teamsRef, {
      eventId,
      name: team.name,
      members: team.members,
      status: team.status,
      currentRound: team.currentRound,
      createdAt: Timestamp.fromMillis(now - 86400000),
      updatedAt: Timestamp.now(),
    });
    teamsAdded++;
  }

  await Promise.all(
    CHECKED_IN_USER_IDS.map((userId, i) => {
      const offset = CHECK_IN_OFFSETS_MS[i % CHECK_IN_OFFSETS_MS.length] ?? 0;
      return addDoc(attRef, {
        eventId,
        userId,
        checkedInAt: Timestamp.fromMillis(now - (2 * 60 * 60 * 1000) + offset),
      });
    })
  );
  const attendanceAdded = CHECKED_IN_USER_IDS.length;

  const allUserIds = new Set<string>();
  SAMPLE_TEAMS.forEach((t) => t.members.forEach((m) => allUserIds.add(m.userId)));
  let regsAdded = 0;
  for (const uid of allUserIds) {
    await addDoc(regsRef, { eventId, userId: uid, createdAt: Timestamp.now() });
    regsAdded++;
  }

  return { teams: teamsAdded, attendance: attendanceAdded, registrations: regsAdded };
}
