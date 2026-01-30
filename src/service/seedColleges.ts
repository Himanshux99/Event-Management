/**
 * College Seeding Utility
 * 
 * This file provides helper functions to populate the colleges collection in Firestore.
 * Use this for initial setup or adding new colleges to the system.
 * 
 * Usage:
 * import { seedColleges, addCollege } from "@/service/seedColleges";
 * 
 * // Seed initial colleges
 * await seedColleges();
 * 
 * // Or add a single college
 * await addCollege("New Engineering College");
 */

import { useEffect } from "react";
import { collegeDB } from "../lib/firebaseDB";

/**
 * Default list of colleges to seed
 * Modify this array based on your institution's needs
 */
const DEFAULT_COLLEGES = [
  "Indian Institute of Technology (IIT) Bombay, Powai",
  "Veermata Jijabai Technological Institute (VJTI), Matunga",
  "Institute of Chemical Technology (ICT), Mumbai",
  "Sardar Patel Institute of Technology (SPIT), Andheri",
  "Dwarkadas J. Sanghvi College of Engineering (DJSCE), Vile Parle",
  "K. J. Somaiya College of Engineering (KJSCE), Vidyavihar",
  "Vidyalankar Institute of Technology (VIT), Wadala",
  "Thadomal Shahani Engineering College (TSEC), Bandra",
];

/**
 * Seeds the colleges collection with default colleges
 * Skips colleges that already exist
 * 
 * @returns Promise<Object> Summary of operations
 */
export const seedColleges = async () => {
  console.log("Starting college seeding...");
  
  const results = {
    created: [] as string[],
    skipped: [] as string[],
    errors: [] as { name: string; error: string }[],
  };

  for (const collegeName of DEFAULT_COLLEGES) {
    try {
      const existing = await collegeDB.getByName(collegeName);
      
      if (existing) {
        results.skipped.push(collegeName);
        console.log(`⏭️  Skipped (exists): ${collegeName}`);
      } else {
        await collegeDB.create(collegeName);
        results.created.push(collegeName);
        console.log(`✅ Created: ${collegeName}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.errors.push({ name: collegeName, error: errorMessage });
      console.error(`❌ Error creating ${collegeName}:`, error);
    }
  }

  console.log("\n📊 Seeding Summary:");
  console.log(`   Created: ${results.created.length}`);
  console.log(`   Skipped: ${results.skipped.length}`);
  console.log(`   Errors: ${results.errors.length}`);
  
  return results;
};

/**
 * Add a single college to the system
 * 
 * @param collegeName - Name of the college to add
 * @returns Promise<string> ID of the created college
 */
export const addCollege = async (collegeName: string) => {
  try {
    const existing = await collegeDB.getByName(collegeName);
    
    if (existing) {
      console.log(`College "${collegeName}" already exists with ID: ${existing.id}`);
      return existing.id;
    }

    const collegeId = await collegeDB.create(collegeName);
    console.log(`✅ Created college "${collegeName}" with ID: ${collegeId}`);
    return collegeId;
  } catch (error) {
    console.error(`❌ Error adding college "${collegeName}":`, error);
    throw error;
  }
};

/**
 * Get all colleges from the database
 * 
 * @returns Promise<Array> List of all colleges
 */
export const getAllColleges = async () => {
  try {
    const colleges = await collegeDB.getAll();
    console.log(`📚 Found ${colleges.length} colleges`);
    return colleges;
  } catch (error) {
    console.error("❌ Error fetching colleges:", error);
    throw error;
  }
};

/**
 * Verify that the college collection is properly set up
 * 
 * @returns Promise<Object> Verification results
 */
export const verifyCollegeSetup = async () => {
  console.log("Verifying college system setup...\n");

  const verification = {
    collectionsExist: false,
    collegesCount: 0,
    sampleColleges: [] as any[],
    isReady: false,
  };

  try {
    const colleges: any[] = await collegeDB.getAll();
    verification.collectionsExist = true;
    verification.collegesCount = colleges.length;
    verification.sampleColleges = colleges.slice(0, 3);

    if (colleges.length > 0) {
      verification.isReady = true;
      console.log("✅ College collection exists");
      console.log(`✅ Found ${colleges.length} colleges`);
      console.log("\n📋 Sample colleges:");
      colleges.slice(0, 3).forEach((college: any) => {
        console.log(`   - ${college.name}`);
      });
    } else {
      console.log("⚠️  College collection exists but is empty");
      console.log("Run seedColleges() to populate it");
    }
  } catch (error) {
    console.error("❌ Error verifying setup:", error);
    console.log("Make sure Firestore is properly configured");
  }

  return verification;
};

/**
 * Custom colleges seeding - use this to seed specific colleges
 * 
 * @param collegesList - Array of college names to seed
 * @returns Promise<Object> Summary of operations
 */
export const seedCustomColleges = async (collegesList: string[]) => {
  console.log(`Starting custom seeding for ${collegesList.length} colleges...\n`);
  
  const results = {
    created: [] as string[],
    skipped: [] as string[],
    errors: [] as { name: string; error: string }[],
  };

  for (const collegeName of collegesList) {
    try {
      const existing = await collegeDB.getByName(collegeName);
      
      if (existing) {
        results.skipped.push(collegeName);
        console.log(`⏭️  Skipped: ${collegeName}`);
      } else {
        await collegeDB.create(collegeName);
        results.created.push(collegeName);
        console.log(`✅ Created: ${collegeName}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.errors.push({ name: collegeName, error: errorMessage });
      console.error(`❌ Error: ${collegeName}`, error);
    }
  }

  console.log("\n📊 Seeding Summary:");
  console.log(`   Created: ${results.created.length}`);
  console.log(`   Skipped: ${results.skipped.length}`);
  console.log(`   Errors: ${results.errors.length}`);
  
  return results;
};

export default {
  seedColleges,
  addCollege,
  getAllColleges,
  verifyCollegeSetup,
  seedCustomColleges,
};
