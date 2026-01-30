// src/services/seedEvents.ts
import { db, auth } from "../lib/firebase"; // Adjust path to your firebase config
import { writeBatch, collection, doc, serverTimestamp } from "firebase/firestore";
import { DEMO_EVENTS } from "../data/demoEvents";

export const seedAllEvents = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error("You must be logged in to seed events.");
  }

  try {
    // 1. Initialize a batch
    const batch = writeBatch(db);
    
    // 2. Loop through data and create operations
    DEMO_EVENTS.forEach((eventData) => {
      // Create a reference to a new document with an auto-generated ID
      const newDocRef = doc(collection(db, "events"));
      
      // Set the data for this document
      batch.set(newDocRef, {
        ...eventData,
        organizerId: user.uid,         // Link to current user
        organizerEmail: user.email,    // Helpful for display
        status: "published",
        createdAt: serverTimestamp(),  // Server-side timestamp
        registeredCount: Math.floor(Math.random() * 20) // Random initial signups
      });
    });

    // 3. Commit the batch (sends all data at once)
    await batch.commit();
    
    return "Successfully added all demo events!";
  } catch (error) {
    console.error("Error seeding events:", error);
    throw error;
  }
};
