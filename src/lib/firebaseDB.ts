import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import { onSnapshot, collection as collectionRef, doc as docRef, updateDoc as updateDocument } from 'firebase/firestore';

// Collection references
export const COLLECTIONS = {
  EVENTS: 'events',
  REGISTRATIONS: 'registrations',
  USERS: 'users',
  ORGANIZERS: 'organizers',
  COLLEGES: 'colleges',
  TEAM_INVITES: 'teamInvites',
  ATTENDANCE: 'attendance',
  TEAMS: 'teams',
  EVENT_UPDATES: 'eventUpdates',
};

// Event operations
export const eventDB = {
  // Create a new event
  create: async (eventData: any) => {
    const eventsRef = collection(db, COLLECTIONS.EVENTS);
    const docRef = await addDoc(eventsRef, {
      ...eventData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Get a single event by ID
  getById: async (eventId: string) => {
    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (eventSnap.exists()) {
      return { id: eventSnap.id, ...eventSnap.data() };
    }
    return null;
  },

  // Get all events
  getAll: async () => {
    const eventsRef = collection(db, COLLECTIONS.EVENTS);
    const querySnapshot = await getDocs(eventsRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Get events by filter
  getByQuery: async (constraints: QueryConstraint[]) => {
    const eventsRef = collection(db, COLLECTIONS.EVENTS);
    const q = query(eventsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Get draft events for a user
  getDrafts: async (userId: string) => {
    const eventsRef = collection(db, COLLECTIONS.EVENTS);
    const q = query(
      eventsRef,
      where('organizerId', '==', userId),
      where('status', '==', 'draft')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Update an event
  update: async (eventId: string, eventData: Partial<any>) => {
    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    await updateDoc(eventRef, {
      ...eventData,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete an event
  delete: async (eventId: string) => {
    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    await deleteDoc(eventRef);
  },
};

// Registration operations
export const registrationDB = {
  // Create a new registration
  create: async (registrationData: any) => {
    const registrationsRef = collection(db, COLLECTIONS.REGISTRATIONS);
    const docRef = await addDoc(registrationsRef, {
      ...registrationData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Get registrations for a user
  getByUserId: async (userId: string) => {
    const registrationsRef = collection(db, COLLECTIONS.REGISTRATIONS);
    const q = query(registrationsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Get registrations for an event
  getByEventId: async (eventId: string) => {
    const registrationsRef = collection(db, COLLECTIONS.REGISTRATIONS);
    const q = query(registrationsRef, where('eventId', '==', eventId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Check if user is registered for an event
  checkRegistration: async (userId: string, eventId: string) => {
    const registrationsRef = collection(db, COLLECTIONS.REGISTRATIONS);
    const q = query(
      registrationsRef, 
      where('userId', '==', userId),
      where('eventId', '==', eventId)
    );
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  },

  // Update registration status
  updateStatus: async (registrationId: string, status: string) => {
    const registrationRef = doc(db, COLLECTIONS.REGISTRATIONS, registrationId);
    await updateDoc(registrationRef, { status });
  },

  // Delete a registration
  delete: async (registrationId: string) => {
    const registrationRef = doc(db, COLLECTIONS.REGISTRATIONS, registrationId);
    await deleteDoc(registrationRef);
  },
};

// User profile operations
export const userDB = {
  // Create or update user profile
  upsert: async (userId: string, userData: any) => {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        ...userData,
        updatedAt: Timestamp.now(),
      });
    } else {
      await setDoc(userRef, {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  },

  // Get user profile
  getById: async (userId: string) => {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as any;
    }
    return null;
  },
};

// College operations
export const collegeDB = {
  // Get all colleges
  getAll: async () => {
    const collegesRef = collection(db, COLLECTIONS.COLLEGES);
    const querySnapshot = await getDocs(collegesRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Add a new college
  create: async (collegeName: string) => {
    const collegesRef = collection(db, COLLECTIONS.COLLEGES);
    const docRef = await addDoc(collegesRef, {
      name: collegeName,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Get college by name
  getByName: async (collegeName: string) => {
    const collegesRef = collection(db, COLLECTIONS.COLLEGES);
    const q = query(collegesRef, where('name', '==', collegeName));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    return null;
  },
};

// Team invites operations
export const teamInvitesDB = {
  // Create a team invite
  create: async (inviteData: any) => {
    const invitesRef = collection(db, COLLECTIONS.TEAM_INVITES);
    const docRef = await addDoc(invitesRef, {
      ...inviteData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Get pending invites for a user
  getPendingByUserId: async (userId: string) => {
    const invitesRef = collection(db, COLLECTIONS.TEAM_INVITES);
    const q = query(
      invitesRef, 
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Get all invites for a user (including accepted/rejected)
  getAllByUserId: async (userId: string) => {
    const invitesRef = collection(db, COLLECTIONS.TEAM_INVITES);
    const q = query(invitesRef, where('toUserId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Get invites for an event
  getByEventId: async (eventId: string) => {
    const invitesRef = collection(db, COLLECTIONS.TEAM_INVITES);
    const q = query(invitesRef, where('eventId', '==', eventId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Update invite status (accept/reject)
  updateStatus: async (inviteId: string, status: string) => {
    const inviteRef = doc(db, COLLECTIONS.TEAM_INVITES, inviteId);
    await updateDoc(inviteRef, { status, updatedAt: Timestamp.now() });
  },

  // Delete an invite
  delete: async (inviteId: string) => {
    const inviteRef = doc(db, COLLECTIONS.TEAM_INVITES, inviteId);
    await deleteDoc(inviteRef);
  },
};

// Attendance operations (Firestore-based)
interface AttendanceRecord {
  eventId: string;
  userId: string;
  checkedInAt: Timestamp;
}

export const attendanceDB = {
  // Check in a user for an event
  checkIn: async (userId: string, eventId: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Check if user already checked in
      const alreadyChecked = await attendanceDB.isAlreadyChecked(userId, eventId);
      if (alreadyChecked) {
        return { success: false, message: 'ALREADY_USED' };
      }

      // Verify event exists
      const event = await eventDB.getById(eventId);
      if (!event) {
        return { success: false, message: 'INVALID' };
      }

      // Verify user exists
      const user = await userDB.getById(userId);
      if (!user) {
        return { success: false, message: 'INVALID' };
      }

      // Create attendance record
      const attendanceRef = collection(db, COLLECTIONS.ATTENDANCE);
      await addDoc(attendanceRef, {
        eventId,
        userId,
        checkedInAt: Timestamp.now(),
      } as AttendanceRecord);

      return { success: true, message: 'SUCCESS' };
    } catch (error) {
      console.error('Error during check-in:', error);
      return { success: false, message: 'ERROR' };
    }
  },

  // Check if user already checked in for an event
  isAlreadyChecked: async (userId: string, eventId: string): Promise<boolean> => {
    try {
      const attendanceRef = collection(db, COLLECTIONS.ATTENDANCE);
      const q = query(
        attendanceRef,
        where('userId', '==', userId),
        where('eventId', '==', eventId)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking attendance:', error);
      return false;
    }
  },

  // Get attendance count for an event
  getCountByEvent: async (eventId: string): Promise<number> => {
    try {
      const attendanceRef = collection(db, COLLECTIONS.ATTENDANCE);
      const q = query(attendanceRef, where('eventId', '==', eventId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting attendance count:', error);
      return 0;
    }
  },

  // Get all attendance records for an event
  getByEventId: async (eventId: string): Promise<(AttendanceRecord & { id: string })[]> => {
    try {
      const attendanceRef = collection(db, COLLECTIONS.ATTENDANCE);
      const q = query(
        attendanceRef,
        where('eventId', '==', eventId),
        orderBy('checkedInAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as AttendanceRecord & { id: string }));
    } catch (error) {
      console.error('Error getting attendance records:', error);
      return [];
    }
  },
};

// Team operations (Phase 1: core control + Phase 2: auto waitlist)
const ACTIVE_IN_ROUND_STATUSES = ['registered', 'checked_in', 'qualified'] as const;

export const teamDB = {
  getByEventId: async (eventId: string) => {
    const teamsRef = collection(db, COLLECTIONS.TEAMS);
    const q = query(teamsRef, where('eventId', '==', eventId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  update: async (teamId: string, data: Partial<Record<string, unknown>>) => {
    const teamRef = doc(db, COLLECTIONS.TEAMS, teamId);
    await updateDoc(teamRef, { ...data, updatedAt: Timestamp.now() });
  },

  /** Create team with registration logic: round capacity -> registered | waitlisted; prevent same user in multiple teams. */
  create: async (eventId: string, data: { name: string; members: { name: string; rollNumber: string; userId: string }[] }) => {
    const eventDoc = await eventDB.getById(eventId) as { maxTeamsPerRound?: number[] } | null;
    const maxPerRound = eventDoc?.maxTeamsPerRound ?? [];
    const round1Cap = maxPerRound[0] ?? 999;

    const teamsRef = collection(db, COLLECTIONS.TEAMS);
    const q = query(teamsRef, where('eventId', '==', eventId));
    const snapshot = await getDocs(q);
    const teams = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as { members?: { userId?: string }[] }));

    const userIds = new Set((data.members || []).map(m => m.userId).filter(Boolean));
    for (const t of teams) {
      for (const m of t.members || []) {
        const uid = m.userId;
        if (uid && userIds.has(uid)) {
          throw new Error('User already in another team for this event');
        }
      }
    }

    const inRound1 = teams.filter((t: any) =>
      t.currentRound === 1 && ACTIVE_IN_ROUND_STATUSES.includes((t.status as any) ?? '')
    ).length;
    const status = inRound1 < round1Cap ? 'registered' : 'waitlisted';
    const currentRound = 1;

    const docRef = await addDoc(teamsRef, {
      eventId,
      name: data.name,
      members: data.members,
      status,
      currentRound,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  /** Promote to next round: if space -> qualified; else -> waitlisted. Only for checked_in teams. */
  promote: async (eventId: string, teamId: string, team: { currentRound: number; status: string }) => {
    const eventDoc = await eventDB.getById(eventId) as { maxTeamsPerRound?: number[] } | null;
    const maxPerRound = eventDoc?.maxTeamsPerRound ?? [];
    const nextRound = team.currentRound + 1;
    const cap = maxPerRound[nextRound - 1] ?? 999;

    const teamsRef = collection(db, COLLECTIONS.TEAMS);
    const q = query(teamsRef, where('eventId', '==', eventId));
    const snapshot = await getDocs(q);
    const all = snapshot.docs.map(d => d.data() as { currentRound: number; status: string });
    const inNextRound = all.filter(t => t.currentRound === nextRound && ACTIVE_IN_ROUND_STATUSES.includes(t.status as any)).length;

    const teamRef = doc(db, COLLECTIONS.TEAMS, teamId);
    if (inNextRound < cap) {
      await updateDoc(teamRef, { currentRound: nextRound, status: 'qualified', updatedAt: Timestamp.now() });
      return { promoted: true, newRound: nextRound };
    } else {
      await updateDoc(teamRef, { status: 'waitlisted', updatedAt: Timestamp.now() });
      return { promoted: false, waitlisted: true };
    }
  },

  eliminate: async (teamId: string, eventId: string) => {
    const teamRef = doc(db, COLLECTIONS.TEAMS, teamId);
    const teamSnap = await getDoc(teamRef);
    const team = teamSnap.data() as { currentRound: number } | undefined;
    await updateDoc(teamRef, { status: 'eliminated', updatedAt: Timestamp.now() });
    if (team?.currentRound != null) {
      await promoteFirstWaitlistedForRound(eventId, team.currentRound);
    }
  },

  disqualify: async (teamId: string, eventId: string) => {
    const teamRef = doc(db, COLLECTIONS.TEAMS, teamId);
    const teamSnap = await getDoc(teamRef);
    const team = teamSnap.data() as { currentRound: number } | undefined;
    await updateDoc(teamRef, { status: 'disqualified', updatedAt: Timestamp.now() });
    if (team?.currentRound != null) {
      await promoteFirstWaitlistedForRound(eventId, team.currentRound);
    }
  },

  moveToWaitlist: async (teamId: string) => {
    const teamRef = doc(db, COLLECTIONS.TEAMS, teamId);
    await updateDoc(teamRef, { status: 'waitlisted', updatedAt: Timestamp.now() });
  },
};

/** Phase 2: Auto promote earliest waitlisted team for the given round. */
async function promoteFirstWaitlistedForRound(eventId: string, round: number): Promise<void> {
  const teamsRef = collection(db, COLLECTIONS.TEAMS);
  const q = query(
    teamsRef,
    where('eventId', '==', eventId),
    where('currentRound', '==', round),
    where('status', '==', 'waitlisted')
  );
  const snapshot = await getDocs(q);
  const sorted = snapshot.docs.sort((a, b) => {
    const aAt = (a.data().createdAt as Timestamp)?.toMillis?.() ?? 0;
    const bAt = (b.data().createdAt as Timestamp)?.toMillis?.() ?? 0;
    return aAt - bAt;
  });
  const first = sorted[0];
  if (first) {
    await updateDoc(first.ref, { status: 'qualified', updatedAt: Timestamp.now() });
  }
}

// Phase 2: Event updates (venue_change | announcement | delay)
export const eventUpdatesDB = {
  create: async (eventId: string, data: { message: string; type: 'venue_change' | 'announcement' | 'delay' }) => {
    const ref = collection(db, COLLECTIONS.EVENT_UPDATES);
    const docRef = await addDoc(ref, {
      eventId,
      message: data.message,
      type: data.type,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  getByEventId: async (eventId: string) => {
    const ref = collection(db, COLLECTIONS.EVENT_UPDATES);
    const q = query(ref, where('eventId', '==', eventId));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as { id: string; createdAt?: Timestamp }));
    list.sort((a, b) => {
      const aAt = a.createdAt && typeof (a.createdAt as Timestamp).toMillis === 'function' ? (a.createdAt as Timestamp).toMillis() : 0;
      const bAt = b.createdAt && typeof (b.createdAt as Timestamp).toMillis === 'function' ? (b.createdAt as Timestamp).toMillis() : 0;
      return bAt - aAt;
    });
    return list;
  },
};

// Export utility functions
export const createTimestamp = () => Timestamp.now();
export const convertTimestamp = (timestamp: Timestamp) => timestamp.toDate();
