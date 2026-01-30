# Event Management System - Codebase Index

## Project Overview
A comprehensive event management platform built with React + TypeScript, featuring separate functionalities for students and event organizers. The system includes event creation, registration, QR-based attendance scanning, and real-time analytics.

**Tech Stack:**
- Frontend: React 18.3 + TypeScript + Vite
- UI Components: shadcn/ui + Radix UI (customized with Neumorphic design)
- Backend: Firebase (Firestore + Authentication)
- State Management: Context API + React Query
- QR Code: html5-qrcode + react-qr-code
- Styling: Tailwind CSS + Framer Motion (animations)
- Testing: Vitest

---

## 📁 Project Structure

### Root Configuration Files
| File | Purpose |
|------|---------|
| `package.json` | Dependencies & scripts |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` | Vite bundler config |
| `tailwind.config.ts` | Tailwind CSS theme |
| `eslint.config.js` | Code linting rules |

### Key Entry Points
- **`src/main.tsx`** - Application bootstrap
- **`src/App.tsx`** - Routing configuration & main layout
- **`src/index.css`** - Global styles
- **`src/App.css`** - App-specific styles

---

## 🔐 Authentication & Context

### [authContext.tsx](src/context/authContext.tsx)
**Purpose:** Central authentication management

**Key Exports:**
- `useAuth()` - Hook for accessing auth state
- `AuthProvider` - Wrapper component for auth initialization
- `AppUser` interface - User profile structure
- `Role` type - 'student' | 'organizer'

**Features:**
- Firebase auth integration (onAuthStateChanged)
- User profile fetching from Firestore
- Role-based access control
- Logout functionality

**Auth Flow:**
```
Firebase Auth → User Profile (Firestore) → Role Assignment → Auth Context
```

---

## 🗄️ Database Layer

### [firebaseDB.ts](src/lib/firebaseDB.ts)
**Purpose:** Centralized Firebase Firestore operations

**Collections:**
- `events` - Event documents
- `registrations` - User registrations for events
- `users` - User profiles
- `attendance` - Attendance records
- `organizers` - Organizer profiles

**Main DB Objects:**

#### `eventDB`
- `create(eventData)` - Create new event
- `getById(eventId)` - Fetch single event
- `getAll()` - Fetch all events
- `getByQuery(constraints)` - Query with filters
- `getDrafts(userId)` - Get user's draft events
- `update(eventId, data)` - Update event
- `delete(eventId)` - Delete event

#### `registrationDB`
- `create(data)` - Create registration
- `getByUserId(userId)` - Get user registrations
- `getByEventId(eventId)` - Get event registrations
- `checkRegistration(userId, eventId)` - Verify registration
- `updateStatus(registrationId, status)` - Update status
- `delete(registrationId)` - Remove registration

#### `userDB`
- `upsert(userId, data)` - Create/update user profile
- `getById(userId)` - Fetch user profile

#### `attendanceDB` (lines 200-300)
- `checkIn(userId, eventId)` - Record attendance
- `getCountByEvent(eventId)` - Get attendance count

---

## 🔑 Core Libraries

### [qr.ts](src/lib/qr.ts)
**QR Code Payload Management**

```typescript
interface QRPayload {
  userId: string;
  eventId: string;
  issuedAt: number; // epoch ms
}
```

**Functions:**
- `generateQRPayload(userId, eventId)` - Create QR data

**Usage:** Generates JSON payload embedded in QR codes for attendance verification

### [firebaseAuth.ts](src/lib/firebaseAuth.ts)
**Authentication utilities**
- Firebase auth configuration
- Sign up/login functions
- Password reset

### [firebase.ts](src/lib/firebase.ts)
**Firebase configuration & initialization**

### [permissions.ts](src/lib/permissions.ts)
**Role-based permission checking**

### [utils.ts](src/lib/utils.ts)
**Utility functions**
- Class name merging (cn)
- Data transformations

---

## 📄 Pages (Routes)

### Student/User Routes

#### [Index.tsx](src/pages/Index.tsx)
- Landing page
- Public route

#### [Login.tsx](src/pages/Login.tsx)
- Authentication page
- Email/password login
- Redirect to registration

#### [Register.tsx](src/pages/Register.tsx)
- User registration
- Role selection (student/organizer)
- Profile creation

#### [Events.tsx](src/pages/Events.tsx)
- Browse all published events
- Event search/filter
- Event card listings
- Registration functionality

#### [EventDetails.tsx](src/pages/EventDetails.tsx)
- Detailed event information
- Event description, rules, prizes
- Registration status
- Contact information

#### [MyEvents.tsx](src/pages/MyEvents.tsx)
- Student's registered events
- Upcoming events list
- QR pass access
- Event status display

#### [QRPass.tsx](src/pages/QRPass.tsx)
- QR code display for registered event
- Used for attendance scanning
- User & event information display

---

### Organizer Routes

#### [OrganizerDashboard.tsx](src/pages/OrganizerDashboard.tsx)
**Main organizer hub**

**Key Sections:**
1. **Statistics Dashboard**
   - Total events count
   - Total registrations
   - Check-ins today
   - Average attendance %

2. **Published Events**
   - Event listings with status
   - Toggle registration open/closed
   - Edit event functionality
   - Delete event option

3. **Draft Events**
   - Unpublished event management
   - Edit draft functionality
   - Publish to live

4. **Quick Actions**
   - Create event button
   - Start attendance scanning
   - View analytics

#### [EventCreation.tsx](src/pages/EventCreation.tsx)
**Comprehensive event creation form** (1121 lines)

**Form Sections:**
1. **Basic Information**
   - Event title
   - Category/type
   - Description
   - Guidelines

2. **Scheduling**
   - Date picker
   - Start time
   - Duration

3. **Location**
   - Venue selection
   - Venue clash detection

4. **Event Settings**
   - Team event toggle
   - Min/max team size
   - Max registrations
   - Number of rounds

5. **Eligibility**
   - Year restrictions
   - Branch restrictions
   - College restrictions (inter-college option)

6. **Prizes**
   - 1st place prize
   - 2nd place prize
   - 3rd place prize

7. **Volunteers**
   - Add volunteer email
   - Volunteer management

8. **Contact Information**
   - Contact name
   - Email
   - Phone

9. **Attachments**
   - Cover image upload
   - Rulebook file upload

**Features:**
- Save as draft
- Publish event
- Form validation
- Image preview

#### [EditDraft.tsx](src/pages/EditDraft.tsx)
- Edit unpublished draft events
- All EventCreation form fields
- Update & publish functionality

---

### Scanner System (Organizer Feature)

#### [AttendanceEventSelector.tsx](src/pages/AttendanceEventSelector.tsx)
**Event selection for scanning**

**Flow:**
1. Display organizer's published/live events
2. Show event details (date, venue, registered count)
3. Click "Open Scanner" → navigate to scanner with eventId

**UI Features:**
- Event cards with key info
- Real-time event fetching
- Loading states

#### [AttendanceScanner.tsx](src/pages/AttendanceScanner.tsx)
**Main QR scanning interface** (351 lines)

**Architecture:**

```
Component State:
├── eventId (from URL params)
├── event (fetched event details)
├── scanResult (scan status & messages)
├── attendanceCount (live check-in count)
├── isOnline (network status)
└── scannerStarted (init flag)
```

**Key Features:**

1. **QR Scanner**
   - Initialized with `Html5QrcodeScanner`
   - 10 FPS, 250x250 box
   - Real-time scanning

2. **Scan Validation Pipeline**
   ```
   Raw QR Data → Parse JSON → Validate Event ID → Check User → Mark Attendance
   ```

3. **Attendance Check-in Logic**
   - Parse QR payload (userId, eventId, issuedAt)
   - Validate event matches
   - Verify user exists
   - Record attendance (prevent duplicates)
   - Update live count

4. **Status Display**
   - **Idle**: Ready to scan
   - **Processing**: Validating QR
   - **Success**: ✓ User checked in
   - **Already Used**: User already scanned
   - **Invalid**: Bad QR code
   - **Error**: System error

5. **Network Status**
   - Online/offline indicator
   - Live indicator badge
   - Network status monitoring

6. **Real-time Updates**
   - Attendance count updates after each scan
   - Toast notifications
   - Visual feedback with animations

**UI Components:**
- Event header with date/time
- Live attendance counter (Users icon + count)
- QR reader container
- Status message cards (color-coded)
- Scanner instructions

**Error Handling:**
- Invalid QR code format
- User not found
- Event not found
- Duplicate check-in detection
- Network errors

---

### Utility Pages

#### [NotFound.tsx](src/pages/NotFound.tsx)
- 404 error page

#### [Unauthorized.tsx](src/pages/Unauthorized.tsx)
- 403 access denied page

---

## 🛡️ Route Protection

### [ProtectedRoute.tsx](src/components/ProtectedRoute.tsx)
**Access control component**

**Props:**
- `children` - Component to protect
- `allowedRoles?` - Array of allowed roles

**Behavior:**
- Check authentication status
- Verify user role if specified
- Redirect to login if not authenticated
- Redirect to /unauthorized if insufficient permissions

---

## 🎨 Custom UI Components

### Neumorphic Design System
Located in `src/components/ui/`:

**Custom Components:**
- `NeuButton.tsx` - Neumorphic button with variants
- `NeuCard.tsx` - Neumorphic card container
- `NeuBadge.tsx` - Neumorphic badge
- `NeuInput.tsx` - Neumorphic input field

**shadcn/ui Components:**
- Dialog, Dropdown, Popover
- Select, Textarea, Input
- Calendar, Accordion
- Tabs, Toast, Tooltip
- Sheet, Sidebar, Carousel

### Layout Components

#### [Layout.tsx](src/components/layout/Layout.tsx)
**Master layout wrapper**
- Header
- Footer (optional)
- Content area

#### [Header.tsx](src/components/layout/Header.tsx)
- Navigation menu
- User profile/auth actions
- Search bar

#### [Footer.tsx](src/components/layout/Footer.tsx)
- Footer content
- Links

### Other Components

#### [EventCard.tsx](src/components/events/EventCard.tsx)
- Event preview card
- Quick event info display
- Register button

#### [NavLink.tsx](src/components/NavLink.tsx)
- Navigation links with active states

---

## 🎯 Data & Services

### [demoEvents.ts](src/data/demoEvents.ts)
Mock event data for development

### [mockEvents.ts](src/data/mockEvents.ts)
Mock event data for testing

### [eventsData.js](src/data/eventsData.js)
Event data utilities

### [seedEvents.ts](src/service/seedEvents.ts)
Database seed function to populate demo data

---

## 🪝 Custom Hooks

### [use-toast.ts](src/hooks/use-toast.ts)
**Toast notifications**
- Show success/error/info messages

### [use-mobile.tsx](src/hooks/use-mobile.tsx)
**Responsive design hook**
- Detect mobile viewport

---

## 🧪 Testing

### [example.test.ts](src/test/example.test.ts)
Sample test file using Vitest

### [setup.ts](src/test/setup.ts)
Test environment setup

---

## 🔄 Key Data Flows

### Event Creation Flow (Organizer)
```
EventCreation Page
    ↓
Form Submission (Validation)
    ↓
Save as Draft → eventDB.create() → Draft Status → Dashboard
                        ↓
              Publish → Status: 'live' → Visible to Students
```

### Event Registration Flow (Student)
```
Browse Events (Events.tsx)
    ↓
View Details (EventDetails.tsx)
    ↓
Click Register
    ↓
registrationDB.create()
    ↓
Generate QR → QRPass.tsx
```

### Attendance Scanning Flow (Organizer)
```
OrganizerDashboard
    ↓
Click "Start Attendance" → AttendanceEventSelector
    ↓
Select Event → AttendanceScanner?eventId={id}
    ↓
Scan QR Code (Html5QrcodeScanner)
    ↓
Parse QRPayload (userId, eventId, issuedAt)
    ↓
Validate & Check-in (attendanceDB.checkIn)
    ↓
Update Live Count & Display Status
```

### Authentication Flow
```
Register/Login Page
    ↓
firebaseAuth (createUserWithEmailAndPassword / signInWithEmailAndPassword)
    ↓
AuthContext Update (AuthProvider)
    ↓
userDB.upsert() (Create/Update Profile)
    ↓
Role Assignment
    ↓
Protected Routes Unlocked (ProtectedRoute)
```

---

## 📊 Database Schema (Firestore Collections)

### `events` Collection
```typescript
{
  id: string;
  organizerId: string;
  title: string;
  description: string;
  category: string; // "Technical", "Cultural", etc.
  date: string; // "Jan 31, 2026"
  time: string; // "10:00 AM"
  startTime: string;
  duration: number; // minutes
  venue: string;
  type: "intra-college" | "inter-college";
  isTeamEvent: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
  maxCapacity: number;
  registeredCount: number;
  rounds: number;
  status: "draft" | "registration-open" | "live" | "published" | "registration-closed";
  eligibility: {
    year: string;
    branch: string;
    college: string;
  };
  prizes: {
    first: string;
    second: string;
    third: string;
  };
  guidelines: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  volunteers: string[];
  coverImage: string;
  rulebookUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `registrations` Collection
```typescript
{
  id: string;
  userId: string;
  eventId: string;
  status: "confirmed" | "cancelled";
  teamId?: string;
  teamMembers?: string[];
  createdAt: Timestamp;
}
```

### `users` Collection
```typescript
{
  id: string;
  email: string;
  name: string;
  role: "student" | "organizer";
  year?: string;
  branch?: string;
  college?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `attendance` Collection
```typescript
{
  id: string;
  userId: string;
  eventId: string;
  checkedInAt: Timestamp;
}
```

---

## 🚀 Current Scanner Implementation Status

### ✅ Completed
- [x] HTML5 QR scanner integration
- [x] QR payload validation (userId, eventId, issuedAt)
- [x] Event selection interface
- [x] Real-time attendance counting
- [x] Duplicate check-in prevention
- [x] Network status monitoring
- [x] Visual feedback (success/error/already-used states)
- [x] Toast notifications
- [x] User profile lookup
- [x] Framer motion animations

### 📝 Implementation Details
**Scanner Architecture:**
1. **Selection Phase** - Choose event from list
2. **Initialization Phase** - Load event details & attendance count
3. **Scanning Phase** - Html5QrcodeScanner captures QR
4. **Validation Phase** - Parse & verify payload
5. **Check-in Phase** - Record in Firestore
6. **Feedback Phase** - Display result to organizer

**Key Files:**
- `AttendanceEventSelector.tsx` - Event selection
- `AttendanceScanner.tsx` - Scanning interface
- `html5-qrcode` library - QR scanning engine
- `attendanceDB` methods - Database operations

### 🔧 Next Steps/Enhancements
- [ ] Bulk import attendee list
- [ ] Attendance reports/analytics
- [ ] QR code regeneration
- [ ] Offline mode with sync
- [ ] Photo-based attendance backup
- [ ] Multi-device scanning session management

---

## 🔗 Important Connections

### Role-Based Routes
- **Students**: /events, /my-events, /my-events/:id/qr
- **Organizers**: /organizer, /organizer/create-event, /organizer/attendance, /organizer/edit-draft/:id

### Firebase Collections Relationships
```
events ←→ registrations ←→ users
  ↓
attendance ←→ users
```

### Component Communication
```
AuthContext
  ├→ ProtectedRoute (uses useAuth)
  ├→ OrganizerDashboard (uses useAuth)
  └→ EventCreation (uses useAuth)

eventDB, registrationDB, userDB, attendanceDB
  ├→ All Pages (fetch data)
  └→ Components (display data)
```

---

## 📋 Development Notes

### Key Patterns
- **Hooks Pattern**: Custom hooks for reusable logic
- **Context API**: Global state (auth)
- **Query Pattern**: React Query for data fetching (setup in App.tsx)
- **Component Composition**: Small, focused components
- **Type Safety**: Full TypeScript coverage

### Code Style
- Functional components with hooks
- Tailwind CSS for styling
- Component-scoped state with useState
- Side effects with useEffect
- Motion animations with Framer Motion

### Testing Setup
- Vitest for unit tests
- JSDOM for DOM testing
- Test files in `src/test/`

---

## 📞 Support & Debugging

### Common Flows
1. **User can't log in** → Check `authContext.tsx` & Firebase auth
2. **Event doesn't appear** → Check `eventDB.getByQuery()` & Firestore data
3. **QR scan fails** → Check `AttendanceScanner.tsx` validation logic
4. **Attendance not recording** → Check `attendanceDB.checkIn()` & permissions

### Debug Points
- AuthContext state logging
- Firebase console for data inspection
- Browser DevTools for component inspection
- Network tab for API calls
