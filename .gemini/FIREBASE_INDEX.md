# Firebase Migration - Complete Documentation Index

**Versjon:** 1.0
**Status:** Ready for implementation
**Last Updated:** 02.02.2026

---

## Quick Navigation

### For Developers Starting Now
- **5 minutes:** Read [Quick Start](#quick-start) below
- **15 minutes:** Follow [FIREBASE_IMPLEMENTATION.md](./FIREBASE_IMPLEMENTATION.md) "Quick Start" section
- **2 hours:** Complete Fase 1 & 2 from implementation guide

### For Technical Leaders
- **30 minutes:** Read full [FIREBASE.md](./FIREBASE.md) - Oversikt to Fase 2
- **1 hour:** Review architecture and migration timeline
- **Ongoing:** Use as reference for team

### For DevOps Engineers
- **1 hour:** Read [FIREBASE_CLOUD_FUNCTIONS.md](./FIREBASE_CLOUD_FUNCTIONS.md)
- **2 hours:** Setup and deploy functions
- **30 minutes:** Configure Firestore rules and security

---

## Documentation Structure

### 1. **FIREBASE.md** - Complete Reference Guide
   - **Size:** ~1000 lines
   - **Purpose:** Complete reference with all details
   - **Best for:** In-depth understanding, troubleshooting
   - **Sections:**
     - Oversikt (What & Why)
     - Pre-Migration Checklist
     - Firebase Setup
     - 5 Implementation Phases
     - Testing & Deployment
     - Troubleshooting Guide
   - **Read when:** You want full context or encountering issues

### 2. **FIREBASE_IMPLEMENTATION.md** - Step-by-Step Guide
   - **Size:** ~500 lines
   - **Purpose:** Practical implementation walkthrough
   - **Best for:** Developers coding the migration
   - **Sections:**
     - Quick Start (15 min)
     - Step-by-Step Implementation (Detailed)
     - Common Issues & Fixes
     - File Checklist
   - **Read when:** You're actively implementing code changes

### 3. **FIREBASE_CLOUD_FUNCTIONS.md** - Cloud Functions Guide
   - **Size:** ~600 lines
   - **Purpose:** Setup and deploy custom roles management
   - **Best for:** DevOps, backend setup
   - **Sections:**
     - Setup Cloud Functions Project
     - Create Functions (3 templates)
     - Test Locally with Emulator
     - Deploy to Production
     - Firestore Schema & Rules
   - **Read when:** You're setting up custom claims and roles

---

## Implementation Timeline

### Phase 1: Core Authentication (2 hours)
**Goal:** Basic login/logout with Firebase

**Steps:**
1. Create Firebase project in console
2. Enable Email/Password auth
3. Create test users
4. Install Firebase SDK
5. Create config file
6. Update authService.ts
7. Test login

**Documents:** FIREBASE_IMPLEMENTATION.md (Quick Start + Step 1-3)

**Success Criteria:**
- Login works with real Firebase credentials
- Console shows no errors
- Session persists after refresh

---

### Phase 2: Session Management (1 hour)
**Goal:** Automatic session restoration with onAuthStateChanged

**Steps:**
1. Update AuthProvider.tsx
2. Add onAuthStateChanged listener
3. Remove localStorage-based persistence
4. Test session restoration

**Documents:** FIREBASE_IMPLEMENTATION.md (Step 2.5) + FIREBASE.md (Fase 2)

**Success Criteria:**
- Page refresh keeps user logged in
- Browser shows Firebase session cookies
- Real-time auth state changes work

---

### Phase 3: Custom Claims (3 hours)
**Goal:** Role-based access control with Cloud Functions

**Steps:**
1. Initialize Firebase Functions
2. Create Cloud Functions (3 functions)
3. Deploy to production
4. Test role assignment
5. Update Firestore rules

**Documents:** FIREBASE_CLOUD_FUNCTIONS.md (All sections)

**Success Criteria:**
- Custom claims set correctly
- Roles persist in Firestore
- Security rules working

---

### Phase 4: Security & Testing (2 hours)
**Goal:** Production-ready security and tests

**Steps:**
1. Setup App Check
2. Configure Firestore rules
3. Write unit tests
4. Write E2E tests
5. Test error scenarios

**Documents:** FIREBASE.md (Fase 4 & 9)

---

### Phase 5: Deployment (1 hour)
**Goal:** Deploy to production with confidence

**Steps:**
1. Verify all checklist items
2. Build for production
3. Deploy to Firebase Hosting
4. Monitor logs
5. Setup analytics

**Documents:** FIREBASE.md (Fase 10)

---

## Key Files to Change

### Frontend Code

**`src/config/firebase.ts`** (New)
```typescript
// Initialize Firebase
// Import from 'firebase/auth', 'firebase/firestore'
// Export auth, db instances
```

**`src/features/auth/authService.ts`** (Update)
```typescript
// Replace mock implementation with:
// - signInWithEmailAndPassword
// - signOut
// - Error mapping function
```

**`src/features/auth/AuthProvider.tsx`** (Update)
```typescript
// Add onAuthStateChanged listener in useEffect
// Remove localStorage-based persistence
// Keep rest of code unchanged
```

### Backend Code

**`functions/src/index.ts`** (New)
```typescript
// Export all Cloud Functions
export { setCustomClaims } from './setCustomClaims';
export { onUserCreated, onUserRoleChanged } from './userTriggers';
```

**`functions/src/setCustomClaims.ts`** (New)
```typescript
// Callable function to set user roles
// Called from admin panel
```

**`functions/src/userTriggers.ts`** (New)
```typescript
// Triggers for:
// - onUserCreated: Create Firestore doc
// - onUserRoleChanged: Update custom claims
// - onUserDeleted: Cleanup
```

### Configuration

**`.env.local`** (New, Git ignored)
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# ... 6 total env vars
```

**`firebase.json`** (Update)
```json
{
  "hosting": { /* config */ },
  "functions": { /* new config */ }
}
```

---

## Pre-Migration Checklist

Before starting, verify:

- [ ] Node.js 18+ installed: `node --version`
- [ ] Firebase project created (or credentials obtained)
- [ ] Test users created in Firebase Console
- [ ] Firebase CLI installed: `firebase --version`
- [ ] Current code in git: `git status`
- [ ] Team communication done (inform about changes)
- [ ] Backup branch created: `git checkout -b backup/pre-firebase`

---

## Common Questions

### Q: Will existing functionality break?
**A:** No. The types, interfaces, and React components stay identical. Only `authService.ts` and `AuthProvider.tsx` internals change.

### Q: How long will migration take?
**A:** 8-12 hours total for complete implementation:
- Phase 1-2: 3 hours
- Phase 3: 3 hours (Cloud Functions)
- Phase 4-5: 2-4 hours

### Q: Can we do it gradually?
**A:** Yes! You can:
1. Deploy Phase 1-2 (basic auth) first
2. Keep mock auth alongside for testing
3. Deploy Phase 3 (roles) after Phase 1 is stable

### Q: What about existing users?
**A:** Since this is development, you'll recreate test users. In production:
- Export users from old system
- Import to Firebase (via Admin SDK)
- Map old IDs to Firebase UIDs

### Q: Do we need Firestore?
**A:** Optional but recommended:
- Phase 1-2 work without Firestore
- Phase 3 (roles) requires Firestore
- Can add Firestore later if needed

### Q: What about mobile apps?
**A:** Firebase Auth works identically on all platforms:
- React Web ✅
- React Native ✅
- Flutter ✅
- Native iOS/Android ✅

---

## Rollback Plan

If something goes wrong:

### Quick Rollback (< 30 min)
```bash
# Undo recent changes
git reset --hard HEAD~3

# Redeploy old version
npm run build
firebase deploy

# Done - back to previous state
```

### Partial Rollback (Keep some changes)
```bash
# Switch back to mock auth
git checkout backup/pre-firebase -- src/features/auth/authService.ts
git checkout backup/pre-firebase -- src/features/auth/AuthProvider.tsx

# Restart with localStorage
npm run dev
```

---

## Success Metrics

### Phase 1 Complete
- ✅ Login works with Firebase credentials
- ✅ All auth types pass: admin, employee, invalid email, wrong password
- ✅ Zero console errors
- ✅ Load time < 100ms for login

### Phase 2 Complete
- ✅ Session persists after page refresh
- ✅ Browser shows `__session` cookie
- ✅ Logout clears session completely
- ✅ Real-time auth sync works (logout in one tab affects other tabs)

### Phase 3 Complete
- ✅ Custom claims (role) visible in token
- ✅ Firestore document created automatically
- ✅ Changing role in Firestore updates custom claims
- ✅ Security rules enforce role-based access

### Phase 4 Complete
- ✅ App Check enabled and working
- ✅ Unit tests all pass
- ✅ E2E tests all pass
- ✅ Error scenarios handled gracefully

### Phase 5 Complete
- ✅ Production build is smaller/faster than mock version
- ✅ Deployment succeeds without errors
- ✅ Analytics tracking working
- ✅ Error logs accessible in Cloud Console

---

## Resources During Migration

### Official Documentation
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Firestore Rules Docs](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)

### Tools & Consoles
- [Firebase Console](https://console.firebase.google.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

### Community Help
- Stack Overflow: `[firebase]` tag
- Firebase Discord: [Link](https://discord.gg/firebase)
- GitHub Issues: [firebase-js-sdk](https://github.com/firebase/firebase-js-sdk)

---

## After Migration

### Day 1 (Immediately)
- [ ] Monitor error logs in Cloud Console
- [ ] Verify users can still login
- [ ] Check performance metrics

### Week 1
- [ ] Gather user feedback
- [ ] Monitor Cloud Functions logs
- [ ] Check Firestore usage and costs
- [ ] Optimize slow queries if any

### Month 1
- [ ] Add password reset feature (from FIREBASE.md Fase 5)
- [ ] Setup email verification
- [ ] Configure analytics
- [ ] Create admin dashboard for user management

### Ongoing
- [ ] Regular security rule audits
- [ ] Monitor Firebase costs
- [ ] Keep Firebase SDK updated
- [ ] Review auth logs monthly

---

## Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-02 | Initial complete migration guide |

---

## Getting Help

### If you get stuck:

1. **Check Troubleshooting Section**
   - FIREBASE.md kapitel 11 (Troubleshooting)
   - FIREBASE_IMPLEMENTATION.md (Common Issues & Fixes)

2. **Review Your Specific Phase**
   - Find your current phase in this index
   - Review the relevant document section
   - Check code examples in documents

3. **Search for Error Message**
   - Copy exact error message
   - Ctrl+F in appropriate guide document
   - Or search GitHub issues

4. **Ask Team**
   - Mention which phase you're on
   - Share exact error message
   - Link to relevant documentation section

5. **Debug Step-by-Step**
   - Add console.log statements
   - Check browser DevTools
   - Monitor function logs: `firebase functions:log`
   - Check Firestore in console

---

## Document Maintenance

These guides should be updated when:
- Firebase SDK releases major version
- Significant code changes are made
- New features are added
- Common issues are discovered

---

## Contact & Questions

For questions about this migration:
- Check appropriate documentation first
- Ask on team channel with context
- Share relevant error messages
- Include which phase you're on

---

**Ready to start? → Open FIREBASE_IMPLEMENTATION.md and follow the Quick Start section!**

---

## Document Map

```
.gemini/
├── FIREBASE_INDEX.md           ← You are here
├── FIREBASE.md                 (Reference guide - 1000+ lines)
├── FIREBASE_IMPLEMENTATION.md  (Step-by-step - 500+ lines)
└── FIREBASE_CLOUD_FUNCTIONS.md (Functions guide - 600+ lines)
```

**Total Documentation:** 2300+ lines of comprehensive Firebase migration guides.

**Estimated Total Time:** 8-12 hours for complete migration
- Phases 1-2: 3 hours (basic auth)
- Phase 3: 3 hours (Cloud Functions)
- Phase 4-5: 2-4 hours (security & deployment)

**Estimated Time to Start:** 15 minutes (Quick Start)

---

**Status:** Ready for implementation. Start with FIREBASE_IMPLEMENTATION.md
