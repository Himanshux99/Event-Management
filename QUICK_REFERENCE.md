# Quick Reference Guide

## 🎯 Key File Locations

### Authentication & Context
- `src/context/authContext.tsx` - User auth state & role management
- `src/lib/firebaseAuth.ts` - Auth functions (login, register)
- `src/lib/firebase.ts` - Firebase initialization

### Database Operations
- `src/lib/firebaseDB.ts` - All Firestore CRUD operations
- Collections: events, registrations, users, attendance, organizers

### Pages
- **Student**: Events.tsx, EventDetails.tsx, MyEvents.tsx, QRPass.tsx
- **Organizer**: OrganizerDashboard.tsx, EventCreation.tsx, EditDraft.tsx
- **Scanner**: AttendanceEventSelector.tsx, AttendanceScanner.tsx
- **Auth**: Login.tsx, Register.tsx, Index.tsx
- **Error**: NotFound.tsx, Unauthorized.tsx

### Components
- `src/components/ProtectedRoute.tsx` - Route protection
- `src/components/layout/` - Layout, Header, Footer
- `src/components/events/EventCard.tsx` - Event display
- `src/components/ui/` - Custom Neumorphic components

---

## 🚀 Quick Commands

```bash
# Development
npm run dev              # Start dev server on port 5173
npm run build           # Production build
npm run preview         # Preview production build

# Testing & Linting
npm test                # Run tests once
npm run test:watch      # Watch mode testing
npm run lint            # Check code style

# Debugging
# Open browser DevTools: F12 or right-click → Inspect
# Check console for auth/DB errors
# Firebase Console: https://console.firebase.google.com
```

---

## 📋 Common Tasks

### Add New Page Route

1. Create file in `src/pages/NewPage.tsx`
2. Add to `src/App.tsx`:
```tsx
import NewPage from "./pages/NewPage";

<Route path="/new-page" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
```

### Fetch Data from Database

```tsx
import { eventDB, userDB, registrationDB, attendanceDB } from '@/lib/firebaseDB';

// Get event
const event = await eventDB.getById(eventId);

// Get user
const user = await userDB.getById(userId);

// Get registrations
const regs = await registrationDB.getByEventId(eventId);

// Get attendance
const count = await attendanceDB.getCountByEvent(eventId);
```

### Use Auth Context

```tsx
import { useAuth } from '@/context/authContext';

const MyComponent = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) return <div>Not logged in</div>;
  
  return (
    <div>
      Welcome {currentUser?.name} ({currentUser?.role})
    </div>
  );
};
```

### Show Toast Notification

```tsx
import { toast } from 'sonner';

// Success
toast.success('Operation completed!');

// Error
toast.error('Something went wrong');

// Custom
toast('Custom message', { 
  description: "More details here"
});
```

### Create Protected Route

```tsx
// Route automatically protected in App.tsx
<Route 
  path="/organizer"
  element={
    <ProtectedRoute allowedRoles={["organizer"]}>
      <OrganizerDashboard />
    </ProtectedRoute>
  }
/>
```

---

## 🧩 Component Template

### Page Component
```tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import { Layout } from '@/components/layout/Layout';
import { NeuCard } from '@/components/ui/NeuCard';
import { NeuButton } from '@/components/ui/NeuButton';
import { Loader2 } from 'lucide-react';

export default function MyPage() {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch logic
        setData({});
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <NeuCard>
          <h1 className="text-2xl font-bold mb-4">Page Title</h1>
          {/* Content */}
        </NeuCard>
      </div>
    </Layout>
  );
}
```

---

## 🎨 Styling Quick Reference

### Neumorphic Components
```tsx
// Button
<NeuButton variant="primary">Click me</NeuButton>
<NeuButton variant="secondary">Secondary</NeuButton>
<NeuButton variant="ghost">Ghost</NeuButton>

// Card
<NeuCard>Content</NeuCard>
<NeuCard variant="flat">Flat variant</NeuCard>
<NeuCard variant="static">Static variant</NeuCard>

// Badge
<NeuBadge variant="primary">Badge</NeuBadge>
<NeuBadge variant="secondary">Secondary</NeuBadge>

// Input
<NeuInput placeholder="Enter text" />
```

### Tailwind Classes
```tsx
// Layout
<div className="container mx-auto px-4 py-8">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Flexbox
<div className="flex items-center justify-between gap-4">

// Spacing
<div className="mb-4 mt-2 px-4 py-2">

// Text
<h1 className="text-2xl font-bold">Title</h1>
<p className="text-muted-foreground">Secondary text</p>

// Colors
className="text-primary bg-secondary border-accent"
```

### Animations
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
>
  Content
</motion.div>
```

---

## 🔍 Debugging Tips

### Check Auth State
```tsx
// In any component:
const { currentUser, isAuthenticated } = useAuth();
console.log('Current user:', currentUser);
console.log('Is authenticated:', isAuthenticated);
```

### Monitor Database Calls
```tsx
// In DevTools Console:
// Open Firefox/Chrome DevTools (F12)
// Network tab to see Firestore requests
// Check timestamps and payloads
```

### Firebase Console Access
1. Go to https://console.firebase.google.com
2. Select your project
3. Navigate to Firestore Database
4. View collections and documents
5. Monitor real-time updates

### Component Inspector
```tsx
// React DevTools (Chrome extension)
1. Install "React Developer Tools" extension
2. Open DevTools
3. Go to Components tab
4. Search component name
5. View props and state
```

---

## 🛠️ Type Definitions

### User Type
```typescript
interface AppUser {
  uid: string;
  email: string | null;
  name?: string | null;
  role: 'student' | 'organizer';
}
```

### Event Type (from DB)
```typescript
{
  id: string;
  organizerId: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  status: 'draft' | 'registration-open' | 'live' | 'published' | 'registration-closed';
  maxCapacity: number;
  registeredCount: number;
  // ... more fields
}
```

### Scan Result Type (Scanner)
```typescript
interface ScanResult {
  status: 'idle' | 'scanning' | 'processing' | 'success' | 'already_used' | 'invalid' | 'error';
  message: string;
  userId?: string;
  eventId?: string;
  eventTitle?: string;
  userName?: string;
}
```

### QR Payload Type
```typescript
interface QRPayload {
  userId: string;
  eventId: string;
  issuedAt: number; // epoch ms
}
```

---

## 📊 Database Query Examples

### Get All Events for Organizer
```tsx
import { where } from 'firebase/firestore';
import { eventDB } from '@/lib/firebaseDB';

const events = await eventDB.getByQuery([
  where('organizerId', '==', userId),
  where('status', '!=', 'draft')
]);
```

### Get User's Registrations
```tsx
import { registrationDB } from '@/lib/firebaseDB';

const registrations = await registrationDB.getByUserId(userId);
```

### Check User Registration
```tsx
import { registrationDB } from '@/lib/firebaseDB';

const isRegistered = await registrationDB.checkRegistration(userId, eventId);
```

### Get Event Attendance
```tsx
import { attendanceDB } from '@/lib/firebaseDB';

const count = await attendanceDB.getCountByEvent(eventId);
```

---

## 🔐 Role-Based Access

### Check Role in Component
```tsx
const { currentUser } = useAuth();

if (currentUser?.role === 'organizer') {
  // Show organizer features
}

if (currentUser?.role === 'student') {
  // Show student features
}
```

### Route with Role Protection
```tsx
// In App.tsx
<Route 
  path="/organizer"
  element={
    <ProtectedRoute allowedRoles={["organizer"]}>
      <OrganizerDashboard />
    </ProtectedRoute>
  }
/>
```

---

## 🎯 Scanner-Specific

### Generate QR Payload
```tsx
import { generateQRPayload } from '@/lib/qr';

const qrValue = generateQRPayload(userId, eventId);
// Returns: '{"userId":"...","eventId":"...","issuedAt":...}'
```

### Parse QR in Scanner
```tsx
const parseQRPayload = (data: string) => {
  try {
    const payload = JSON.parse(data);
    if (payload.userId && payload.eventId && payload.issuedAt) {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
};
```

### Record Attendance
```tsx
import { attendanceDB } from '@/lib/firebaseDB';

const result = await attendanceDB.checkIn(userId, eventId);
// Returns: { message: 'SUCCESS' | 'ALREADY_USED' }
```

---

## 📱 Responsive Classes

```tsx
// Mobile-first approach
<div className="
  text-base          // Default
  md:text-lg         // Tablet+
  lg:text-xl         // Desktop+
">
  Responsive text
</div>

<div className="
  grid-cols-1        // Mobile
  md:grid-cols-2     // Tablet
  lg:grid-cols-3     // Desktop
  gap-4
">
  Grid items
</div>
```

---

## ⚠️ Common Errors & Fixes

### "useAuth must be used within AuthProvider"
**Fix**: Ensure component is wrapped in `<AuthProvider>` (in App.tsx)

### "Cannot read property of undefined"
**Fix**: Add loading state and null checks
```tsx
if (loading) return <Loader />;
if (!data) return <NeuCard>No data</NeuCard>;
```

### "Firebase permission denied"
**Fix**: Check Firestore security rules or user authentication

### "html5-qrcode requires HTTPS"
**Fix**: Deploy on HTTPS or use localhost for development

### QR Scan Not Working
**Fix**: 
- Check camera permission granted
- Ensure QR code is clear/not damaged
- Adjust lighting
- Check browser console for errors

---

## 🔗 Useful Links

- **Firebase Console**: https://console.firebase.google.com
- **Firestore Docs**: https://firebase.google.com/docs/firestore
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
- **React Router**: https://reactrouter.com
- **Framer Motion**: https://www.framer.com/motion
- **html5-qrcode**: https://github.com/mebjas/html5-qrcode
- **Vite Docs**: https://vitejs.dev

---

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/scanner-enhancement

# Make changes and commit
git add .
git commit -m "feat: add offline support to scanner"

# Push to remote
git push origin feature/scanner-enhancement

# Create pull request on GitHub
# After review → merge to main

# Update local main
git checkout main
git pull origin main
```

---

## 🧪 Test File Structure

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should render properly', () => {
    render(<Component />);
    expect(screen.getByText(/text/i)).toBeInTheDocument();
  });

  it('should handle click', async () => {
    render(<Component />);
    const button = screen.getByRole('button');
    button.click();
    await waitFor(() => {
      expect(screen.getByText(/result/i)).toBeInTheDocument();
    });
  });
});
```

---

## 🚀 Performance Tips

1. **Use React Query** for data fetching (already setup)
2. **Lazy load components** for large pages
3. **Debounce search inputs** to reduce API calls
4. **Cache event/user data** in context
5. **Optimize images** before upload
6. **Use production build** for deployment
7. **Monitor bundle size** with `npm run build`

---

## 📞 Support Resources

### For Authentication Issues
1. Check AuthContext state with useAuth()
2. Verify Firebase credentials in firebase.ts
3. Check user profile in Firestore users collection

### For Database Issues
1. Check Firestore security rules
2. Verify collection names match constants
3. Check network tab for failed requests
4. View logs in Firebase Console

### For UI/Component Issues
1. Check browser console for errors
2. Use React DevTools to inspect props
3. Check Tailwind classes are correct
4. Verify imports are correct

### For Scanner Issues
1. Check camera permissions
2. Verify QR payload format
3. Check eventId in URL query params
4. Ensure user is registered for event
5. Check network connectivity
