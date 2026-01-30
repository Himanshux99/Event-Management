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

// Collection references
export const COLLECTIONS = {
  EVENTS: 'events',
  REGISTRATIONS: 'registrations',
  USERS: 'users',
  ORGANIZERS: 'organizers',
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
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  },
};

// Export utility functions
export const createTimestamp = () => Timestamp.now();
export const convertTimestamp = (timestamp: Timestamp) => timestamp.toDate();
