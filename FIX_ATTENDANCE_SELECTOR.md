# Fix: Attendance Event Selector - "No Active Events" Bug

## Problem
When clicking "Start Attendance" from OrganizerDashboard, the AttendanceEventSelector page displayed **"No Active Events"** even though the organizer had published events.

## Root Cause
The issue was in the event fetching logic in `src/pages/AttendanceEventSelector.tsx`:

```tsx
// WRONG - This only fetches DRAFT events
const allEvents = await eventDB.getDrafts(currentUser.uid);

// Then filtering for published events from draft list
// This creates impossible condition: status can't be both 'draft' AND 'published'
const publishedEvents = allEvents.filter((e: Event) => 
  e.status === 'registration-open' || e.status === 'live' || e.status === 'published'
);
```

**The Logic Error:**
- `getDrafts()` queries: `status == 'draft'`
- Filter then checks: `status == 'registration-open' || status == 'live' || status == 'published'`
- No document satisfies both conditions → empty array → "No Active Events"

## Solution
Changed to use the generic `getByQuery()` method with proper Firestore constraints:

```tsx
// CORRECT - Fetch all events for this organizer
const publishedEvents = await eventDB.getByQuery([
  where('organizerId', '==', currentUser.uid),
]);

// Then filter for active status
const activeEvents = publishedEvents.filter((e: Event) => 
  e.status === 'registration-open' || e.status === 'live' || e.status === 'published'
);
```

**Why this works:**
1. `getByQuery([where('organizerId', '==', uid)])` fetches **all events** for that organizer (any status)
2. Filter then selects only active ones
3. Now it correctly returns published/live events

## Changes Made
**File**: `src/pages/AttendanceEventSelector.tsx`

### Import Added
```tsx
import { where } from 'firebase/firestore';
```

### Fetch Logic Updated
```tsx
// OLD (broken)
const allEvents = await eventDB.getDrafts(currentUser.uid);
const publishedEvents = (allEvents as Event[]).filter((e: Event) => 
  e.status === 'registration-open' || e.status === 'live' || e.status === 'published'
);

// NEW (fixed)
const publishedEvents = await eventDB.getByQuery([
  where('organizerId', '==', currentUser.uid),
]);

const activeEvents = (publishedEvents as Event[]).filter((e: Event) => 
  e.status === 'registration-open' || e.status === 'live' || e.status === 'published'
);
setEvents(activeEvents);
```

## Testing the Fix

### Step 1: Verify Events Exist
Go to OrganizerDashboard and confirm you have published/live events listed

### Step 2: Test Attendance Scanner
1. Click "Start Attendance" button
2. Should see list of active events (not "No Active Events")
3. Click "Open Scanner" on any event
4. Should navigate to `/organizer/attendance?eventId={eventId}`

### Step 3: Test Scanner Functionality
1. Allow camera permission
2. Position QR code in frame
3. Scanner should capture and process QR
4. Attendance should be marked/updated

## How EventDB.getByQuery Works

**In firebaseDB.ts:**
```typescript
export const eventDB = {
  getByQuery: async (constraints: QueryConstraint[]) => {
    const eventsRef = collection(db, COLLECTIONS.EVENTS);
    const q = query(eventsRef, ...constraints);  // Spread constraints
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};
```

**Usage with multiple constraints:**
```tsx
// Get all active events for organizer
eventDB.getByQuery([
  where('organizerId', '==', userId),
  // Can add more constraints like:
  // where('status', '!=', 'draft'),
  // orderBy('date', 'asc'),
])
```

## Firestore Query Explanation

**What's actually happening in Firestore:**
```
Collection: events
Query: WHERE organizerId == 'current-user-id'
Returns: ALL documents where organizerId matches (any status)

Status values in returned docs:
✓ 'draft'
✓ 'registration-open'
✓ 'live'  
✓ 'published'
✓ 'registration-closed'

Frontend filter: Keep only status IN ['registration-open', 'live', 'published']
Result: Only active events for scanning
```

## Related Files
- `src/pages/OrganizerDashboard.tsx` - Dashboard that links to this page
- `src/pages/AttendanceScanner.tsx` - The actual scanner that receives eventId
- `src/lib/firebaseDB.ts` - Database operations

## Prevention
Similar pattern should be avoided elsewhere. Always verify:
1. The query method matches what you're fetching
2. The filter conditions don't contradict the query
3. The resulting data makes sense

Example of this pattern in other files:
- `OrganizerDashboard.tsx` correctly uses `getByQuery` with `where('status', '!=', 'draft')`

---

## ✅ Status: FIXED
The AttendanceEventSelector now correctly displays all active/published events for the organizer, allowing them to start the attendance scanner.
