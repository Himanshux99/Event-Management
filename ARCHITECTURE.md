# Architecture & Data Flow Diagrams

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Application                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Router (react-router-dom)                    │   │
│  │  ┌─────────────┬──────────────┬──────────────────────┐   │   │
│  │  │   Public    │  Student     │    Organizer Routes  │   │   │
│  │  │   Routes    │  Routes      │                      │   │   │
│  │  └─────────────┴──────────────┴──────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ▲                                        │
│                          │                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         ProtectedRoute (Role-based Access Control)        │   │
│  │  Checks: isAuthenticated, allowedRoles, redirects        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ▲                                        │
│                          │                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         AuthContext (Global Auth State)                   │   │
│  │  ├─ currentUser (AppUser)                                 │   │
│  │  ├─ isAuthenticated (boolean)                             │   │
│  │  ├─ loading (boolean)                                     │   │
│  │  └─ logout() function                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ▲                                        │
│                          │                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │       QueryClientProvider (React Query)                   │   │
│  │  Manages data fetching, caching, synchronization          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           UI Components (shadcn/ui + custom)              │   │
│  │  ├─ Neumorphic: NeuButton, NeuCard, NeuBadge              │   │
│  │  ├─ Radix UI: Dialog, Select, Popover, etc.              │   │
│  │  └─ Custom: Layout, Header, Footer, EventCard            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Utilities & Hooks                                  │   │
│  │  ├─ use-toast: Toast notifications                        │   │
│  │  ├─ use-mobile: Responsive detection                      │   │
│  │  └─ Custom hooks (useAuth, etc.)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Firebase Authentication (firebaseAuth.ts)                │   │
│  │  ├─ createUserWithEmailAndPassword()                      │   │
│  │  ├─ signInWithEmailAndPassword()                          │   │
│  │  └─ signOut()                                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                               │                                   │
│                               ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │    Firestore Database (firebaseDB.ts)                     │   │
│  │                                                            │   │
│  │  Collections:                                             │   │
│  │  ├─ events (Event documents)                             │   │
│  │  ├─ registrations (User-Event mappings)                  │   │
│  │  ├─ users (User profiles)                               │   │
│  │  ├─ attendance (Check-in records)                        │   │
│  │  └─ organizers (Organizer profiles)                      │   │
│  │                                                            │   │
│  │  CRUD Operations:                                         │   │
│  │  ├─ eventDB (Create, Read, Update, Delete events)        │   │
│  │  ├─ registrationDB (Manage registrations)                │   │
│  │  ├─ userDB (User profiles)                               │   │
│  │  └─ attendanceDB (Check-in operations)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Authentication Flow

```
┌──────────────────────┐
│   New User           │
│   (Register Page)    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│   firebaseAuth.createUserWithEmail()     │
│   ├─ Email validation                    │
│   ├─ Password hashing (Firebase handles) │
│   └─ Create Auth user                    │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│   userDB.upsert(uid, profile)            │
│   ├─ userId                              │
│   ├─ email                               │
│   ├─ name                                │
│   ├─ role ("student" or "organizer")    │
│   └─ timestamps                          │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│   AuthContext Updates (onAuthStateChanged)
│   ├─ Sets currentUser                    │
│   ├─ Sets isAuthenticated = true         │
│   └─ Stores role for access control      │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│   ProtectedRoute Evaluation              │
│   ├─ Check if authenticated ✓            │
│   ├─ Check role matches ✓                │
│   └─ Allow access to protected pages     │
└──────────────────────────────────────────┘
```

---

## 📋 Event Creation & Publication Flow

```
┌─────────────────────────┐
│  Organizer Opens        │
│  EventCreation Page     │
└────────────┬────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│  Fill Event Form (1121 lines of form logic)  │
│  ├─ Title, Description, Category             │
│  ├─ Date, Time, Duration, Venue              │
│  ├─ Team settings, Capacity                  │
│  ├─ Eligibility (Year, Branch, College)      │
│  ├─ Prizes (1st, 2nd, 3rd)                   │
│  ├─ Contact info, Volunteers                 │
│  ├─ Cover image upload                       │
│  └─ Rulebook PDF upload                      │
└────────────┬─────────────────────────────────┘
             │
             ├─────────────────┬────────────────┐
             ▼                 ▼                ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ Save Draft   │  │ Publish Live │  │   Discard    │
   └──────┬───────┘  └──────┬───────┘  └──────────────┘
          │                 │
          ▼                 ▼
   ┌──────────────────────────────────┐
   │  eventDB.create({...})           │
   │  ├─ organizerId (auto)           │
   │  ├─ status: 'draft' or 'live'    │
   │  ├─ createdAt: Timestamp         │
   │  └─ updatedAt: Timestamp         │
   └──────┬───────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────┐
   │  Store in Firestore              │
   │  events/{eventId}                │
   │  + registrations (empty)         │
   │  + attendance (empty)            │
   └──────┬───────────────────────────┘
          │
          ├─ DRAFT: Only visible to organizer
          │         (in My Drafts)
          │
          └─ LIVE: Visible to all students
                   (in Browse Events)
                   Registration enabled
```

---

## 👥 Event Registration Flow (Student)

```
┌──────────────────────┐
│  Student User        │
│  Logged In           │
└────────────┬─────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Browse Events Page                │
│  ├─ List all live/published events │
│  ├─ Filter by category             │
│  └─ Search by title                │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Click "View Details"              │
│  EventDetails Page                 │
│  ├─ Full event description         │
│  ├─ Rules & guidelines             │
│  ├─ Prizes information             │
│  ├─ Contact details                │
│  ├─ Registered count               │
│  └─ "Register Now" button          │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Click "Register Now"              │
│  ├─ Check user not already         │
│  │  registered                     │
│  └─ Check user eligibility         │
│     (Year, Branch, College)        │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  registrationDB.create({           │
│    userId,                         │
│    eventId,                        │
│    status: 'confirmed',            │
│    createdAt: Timestamp            │
│  })                                │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Firestore Registration Created    │
│  registrations/{regId}             │
│  + eventDB.update() → increment    │
│    registeredCount                 │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  My Events Page                    │
│  ├─ Show registered events         │
│  ├─ Display "Get QR Pass" button   │
│  └─ Show event status              │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Click "Get QR Pass"               │
│  Routes to /my-events/{id}/qr      │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  QR Pass Page (QRPass.tsx)         │
│  ├─ Generate QRPayload:            │
│  │  {                              │
│  │    userId,                      │
│  │    eventId,                     │
│  │    issuedAt: timestamp          │
│  │  }                              │
│  │                                  │
│  ├─ Render QR code                 │
│  │  (react-qr-code)                │
│  │                                  │
│  └─ Display event details          │
└────────────────────────────────────┘
```

---

## 🔍 QR Scanning Flow (Organizer)

```
┌──────────────────────────────────┐
│  Organizer Dashboard             │
│  ├─ See "Start Attendance"       │
│  └─ Click action button          │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│  AttendanceEventSelector Page                │
│  ├─ Fetch all organizer's events:           │
│  │  eventDB.getDrafts(userId)               │
│  │  Filter: status in ['live', 'published'] │
│  │                                           │
│  ├─ Display event cards:                     │
│  │  ├─ Title, Date, Venue                   │
│  │  ├─ Registered count                     │
│  │  └─ "Open Scanner" button                │
│  │                                           │
│  └─ On click:                                │
│     navigate(`/organizer/attendance?        │
│       eventId=${eventId}`)                  │
└────────────┬─────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│  AttendanceScanner Component Init            │
│                                              │
│  1. GET URL PARAM                            │
│     const eventId = searchParams.get(...)    │
│                                              │
│  2. FETCH EVENT DATA                         │
│     eventDB.getById(eventId)                 │
│     ↓                                        │
│     Displays: Title, Date, Time              │
│                                              │
│  3. GET INITIAL COUNT                        │
│     attendanceDB.getCountByEvent(eventId)    │
│     ↓                                        │
│     Displays: "Checked In: X"                │
│                                              │
│  4. INIT QR SCANNER                          │
│     new Html5QrcodeScanner({                 │
│       fps: 10,                               │
│       qrbox: 250x250,                        │
│       aspectRatio: 1.0                       │
│     })                                       │
│     ↓                                        │
│     Request Camera Permission                │
│     ↓                                        │
│     Scanner Ready                            │
│                                              │
│  5. MONITOR NETWORK                          │
│     addEventListener('online', ...)         │
│     addEventListener('offline', ...)        │
│     ↓                                        │
│     Display online/offline badge             │
└────────────┬──────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│  READY FOR SCANNING                          │
│  "Position QR code in camera frame"          │
└────────────┬──────────────────────────────────┘
             │
             │ STUDENT PRESENTS QR CODE
             │
             ▼
┌──────────────────────────────────────────────┐
│  CAPTURE & PARSE QR DATA                     │
│                                              │
│  Html5QrcodeScanner.render() callback        │
│  → onScanSuccess(decodedText)                │
│                                              │
│  Raw string: '{"userId":"...","eventId"...}'│
│                                              │
│  → handleScan(result) {                      │
│       setScanResult({status:'processing'})  │
│     }                                        │
└────────────┬──────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│  PARSE & VALIDATE QR PAYLOAD                 │
│                                              │
│  parseQRPayload(rawString) {                 │
│    payload = JSON.parse(rawString)           │
│    if (payload.userId &&                     │
│        payload.eventId &&                    │
│        payload.issuedAt) {                   │
│      return payload ✓                        │
│    }                                         │
│    return null ✗                             │
│  }                                           │
│                                              │
│  Result: QRPayload | null                    │
└────────────┬──────────────────────────────────┘
             │
             ├─ NULL?
             │  ├─ setScanResult({status:'invalid'})
             │  ├─ Toast: "Invalid QR Code"
             │  └─ Reset after 3s
             │
             └─ VALID? ↓
                    
       ┌──────────────────────────────┐
       │ VALIDATE EVENT MATCH         │
       │                              │
       │ if (qrEventId !== eventId) { │
       │   Invalid (wrong event)      │
       │ }                            │
       └────────┬───────────────────┘
                │
                ├─ NO MATCH?
                │  ├─ setScanResult({status:'invalid'})
                │  ├─ Toast: "Wrong event QR code"
                │  └─ Reset after 3s
                │
                └─ MATCH? ↓

       ┌──────────────────────────────┐
       │ LOOKUP USER                  │
       │                              │
       │ userDB.getById(userId)       │
       │ → User | null                │
       └────────┬───────────────────┘
                │
                ├─ NOT FOUND?
                │  ├─ setScanResult({status:'invalid'})
                │  ├─ Toast: "User not found"
                │  └─ Reset after 3s
                │
                └─ FOUND? ↓

       ┌──────────────────────────────────────┐
       │ RECORD ATTENDANCE                    │
       │                                      │
       │ attendanceDB.checkIn(userId, eventId)
       │                                      │
       │ In Firestore:                        │
       │ 1. Check if already exists:          │
       │    query: userId + eventId           │
       │    if exists → return 'ALREADY_USED' │
       │                                      │
       │ 2. Create new record:                │
       │    {                                 │
       │      userId,                        │
       │      eventId,                       │
       │      checkedInAt: Timestamp.now()   │
       │    }                                │
       │    return 'SUCCESS'                 │
       └────────┬────────────────────────────┘
                │
                ├─ ALREADY_USED
                │  ├─ setScanResult({
                │  │   status: 'already_used',
                │  │   message: 'User already checked in'
                │  │ })
                │  ├─ Toast: "Already checked in"
                │  └─ Reset after 3s
                │
                ├─ SUCCESS ↓
                │
                │  ┌────────────────────────────────┐
                │  │ UPDATE LIVE COUNT              │
                │  │                                │
                │  │ attendanceDB                   │
                │  │ .getCountByEvent(eventId)     │
                │  │ → new total count             │
                │  │                                │
                │  │ setAttendanceCount(newCount)   │
                │  └────────┬───────────────────────┘
                │           │
                │           ▼
                │  ┌────────────────────────────────┐
                │  │ UPDATE UI                      │
                │  │                                │
                │  │ setScanResult({                │
                │  │   status: 'success',           │
                │  │   message: '✓ User checked in' │
                │  │   userName: user.name         │
                │  │ })                             │
                │  │                                │
                │  │ Toast: "Check-in successful"   │
                │  │                                │
                │  │ Status Card:                   │
                │  │ ├─ Green background            │
                │  │ ├─ Success icon                │
                │  │ ├─ User name displayed        │
                │  │ └─ Auto-reset after 2s        │
                │  └────────────────────────────────┘
                │
                └─ ERROR
                   ├─ setScanResult({status:'error'})
                   ├─ Toast: "Check-in failed"
                   └─ Reset after 3s

             ▼
┌────────────────────────────────────────┐
│  SCANNER READY FOR NEXT QR             │
│  Status: 'idle'                        │
│  Count updated on screen               │
│  Waiting for next scan...              │
└────────────────────────────────────────┘
```

---

## 🗂️ Component Hierarchy

```
App.tsx
├── QueryClientProvider
├── TooltipProvider
├── Toaster (notifications)
├── Sonner (toast)
└── AuthProvider
    └── BrowserRouter
        └── Routes
            ├── Route "/" → Index
            ├── Route "/login" → Login
            ├── Route "/register" → Register
            │
            ├── PROTECTED ROUTES
            │   ├── "/events" → Events
            │   │   └── EventCard[]
            │   ├── "/events/:id" → EventDetails
            │   ├── "/my-events" → MyEvents
            │   │   └── EventCard[]
            │   ├── "/my-events/:id/qr" → QRPass
            │   │
            │   ├── ORGANIZER ROUTES (allowedRoles=["organizer"])
            │   │   ├── "/organizer" → OrganizerDashboard
            │   │   ├── "/organizer/create-event" → EventCreation
            │   │   ├── "/organizer/edit-draft/:id" → EditDraft
            │   │   └── "/organizer/attendance" 
            │   │       ├── (selector) → AttendanceEventSelector
            │   │       ├── (with ?eventId) → AttendanceScanner
            │   │       │   ├── Header
            │   │       │   ├── CountCard
            │   │       │   ├── QR Reader
            │   │       │   └── StatusCard
            │   │       └── Instructions
            │   │
            │   └── STUDENT ROUTES (allowedRoles=["student"])
            │       └── "/my-events/*"
            │
            ├── Route "/unauthorized" → Unauthorized
            └── Route "*" → NotFound

Layout (wrapper for all pages)
├── Header
│   ├── Logo
│   ├── Navigation
│   └── User Menu
├── Main Content (page-specific)
└── Footer (conditional)
```

---

## 💾 Database Schema Relationships

```
users (Collection)
├── uid (DocumentID)
├── email
├── name
├── role: "student" | "organizer"
├── year
├── branch
└── college

    ↓ (owns)
    
events (Collection)
├── eventId (DocumentID)
├── organizerId (FK → users.uid)
├── title
├── description
├── date, time
├── venue
├── status: draft | registration-open | live | published
├── maxCapacity
├── registeredCount
├── eligibility: {year, branch, college}
├── prizes: {first, second, third}
└── timestamps

    ↓ (referenced by)

registrations (Collection)
├── regId (DocumentID)
├── userId (FK → users.uid)
├── eventId (FK → events.eventId)
├── status: confirmed | cancelled
├── teamId (optional, if team event)
└── createdAt

    ↓ (part of)

attendance (Collection)
├── attId (DocumentID)
├── userId (FK → users.uid)
├── eventId (FK → events.eventId)
├── checkedInAt: Timestamp
└── --- (implicit that user was registered)

organizers (Collection)
├── orgId (DocumentID)
├── userId (FK → users.uid)
├── bio
├── contact
└── verified: boolean
```

---

## 🔐 Access Control Matrix

```
                  PUBLIC   STUDENT   ORGANIZER   ADMIN
                  ──────   ───────   ─────────   ─────
Index                ✓        ✓          ✓         ✓
Login                ✓        X          X         X
Register             ✓        X          X         X

Events               ✓        ✓          ✓         ✓
EventDetails         ✓        ✓          ✓         ✓
MyEvents             X        ✓          X         X
QRPass               X        ✓          X         X

OrganizerDashboard   X        X          ✓         ✓
EventCreation        X        X          ✓         ✓
EditDraft            X        X          ✓         ✓
AttendanceSelector   X        X          ✓         ✓
AttendanceScanner    X        X          ✓         ✓

Unauthorized         ✓        ✓          ✓         ✓
NotFound             ✓        ✓          ✓         ✓
```

---

## 📊 State Management

```
Global States (Context API)
│
├── AuthContext
│   ├── currentUser: AppUser | null
│   │   ├── uid: string
│   │   ├── email: string
│   │   ├── name: string
│   │   └── role: "student" | "organizer"
│   │
│   ├── isAuthenticated: boolean
│   ├── loading: boolean
│   └── logout(): Promise<void>
│
└── QueryClient (React Query)
    ├── Caches API responses
    ├── Auto-refetch on focus
    └── Dedupes requests

Local States (Component useState)
├── Page-level states
│   ├── events: Event[]
│   ├── loading: boolean
│   └── error: Error | null
│
├── Form states (EventCreation)
│   ├── eventTitle: string
│   ├── date: Date
│   ├── venue: string
│   └── ... (20+ fields)
│
└── Scanner states (AttendanceScanner)
    ├── scanResult: ScanResult
    ├── attendanceCount: number
    ├── isOnline: boolean
    └── scannerStarted: boolean
```

---

## 🔄 Data Flow: Event → Registration → Attendance

```
┌─────────────┐
│   Event     │
├─────────────┤
│ id: "evt1"  │
│ title: "..." │
│ status:     │
│ "live"      │
└──────┬──────┘
       │ Student registers
       ▼
┌──────────────────┐
│ Registration     │
├──────────────────┤
│ id: "reg1"       │
│ userId: "usr1"   │
│ eventId: "evt1"  │
│ status: "ok"     │
└──────┬───────────┘
       │ Student gets QR
       ▼
┌──────────────────────────┐
│ QR Payload Generated     │
├──────────────────────────┤
│ {                        │
│   userId: "usr1",        │
│   eventId: "evt1",       │
│   issuedAt: 1706750400  │
│ }                        │
└──────┬───────────────────┘
       │ Student shows QR
       │ at event
       │
       ▼
┌──────────────────────────┐
│ Organizer scans QR       │
├──────────────────────────┤
│ Scanner parses payload   │
│ Validates event match    │
│ Looks up user            │
│ Creates attendance record│
└──────┬───────────────────┘
       │
       ▼
┌──────────────────┐
│ Attendance       │
├──────────────────┤
│ id: "att1"       │
│ userId: "usr1"   │
│ eventId: "evt1"  │
│ checkedInAt:     │
│ Timestamp        │
└──────────────────┘

Final Result:
✓ Event has registration
✓ Registration linked to attendance
✓ User marked present
✓ Organizer sees updated count
```

---

## 🚀 Deployment Architecture (Conceptual)

```
┌─────────────────────────────────────────┐
│        Developer Machine                │
│  npm run dev (Vite dev server)          │
│  localhost:5173                         │
└──────────────┬──────────────────────────┘
               │
               ├─ Code → Git Repository
               │ (GitHub/GitLab)
               │
               ▼
┌─────────────────────────────────────────┐
│      CI/CD Pipeline (Optional)          │
│  ├─ Run linter (ESLint)                 │
│  ├─ Run tests (Vitest)                  │
│  └─ Build (npm run build)               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Production Build                   │
│  npm run build                          │
│  → dist/ folder with optimized assets   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Hosting (Vercel/Netlify/Firebase)  │
│  ├─ Serve static files (HTML, JS, CSS) │
│  ├─ Enable HTTPS                       │
│  └─ Setup redirects for React Router    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Firebase Backend                   │
│  ├─ Firestore Database                 │
│  ├─ Authentication Service             │
│  └─ Storage (for images/files)         │
└─────────────────────────────────────────┘
```

---

## 📱 Responsive Breakpoints

```
Mobile (0px - 640px)
├── Single column layouts
├── Full-width cards
└── Touch-friendly buttons

Tablet (641px - 1024px)
├── Two-column grid
├── Readable font sizes
└── Condensed navigation

Desktop (1025px+)
├── Multi-column layouts
├── Sidebar navigation
├── Expanded content areas

Tailwind Classes:
sm: (640px)
md: (768px)
lg: (1024px)
xl: (1280px)
2xl: (1536px)
```
