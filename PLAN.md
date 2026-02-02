# Plan for Implementering av Login & Auth-forberedelser

**Dato:** 02.02.2026
**Status:** Oppdatert etter arkitektur- og UI-review
**Ansvarlig:** Strategic Team Lead
**Review-agenter:** architect-reviewer, ui-designer

---

## 1. Overordnet Mål

Opprette en dedikert `LoginPage` som fungerer som inngangsport til applikasjonen. Løsningen skal være:
- ✅ Visuelt konsistent med eksisterende design
- ✅ Arkitektonisk klargjort for Firebase Authentication
- ✅ Implementert med Context API for global state
- ✅ Asynkron fra start (matcher Firebase-oppførsel)
- ✅ Robust med loading, error, og persistens-håndtering

---

## 2. Forbedret Arkitektur

### 2.1 Filstruktur (Oppdatert)
```
src/
  features/
    auth/
      ├── AuthProvider.tsx    // Context + Provider + state management
      ├── LoginPage.tsx       // Login UI
      ├── useAuth.ts          // Hook som konsumerer AuthContext
      ├── types.ts            // TypeScript interfaces (User, AuthState, Role)
      └── authService.ts      // Mock-logikk (lett å bytte til Firebase)
  components/
    ui/
      └── Input.tsx           // Gjenbrukbar input-komponent
```

**Endring fra original plan:**
- ❌ `src/hooks/useAuth.tsx` (hook uten context)
- ✅ `src/features/auth/AuthProvider.tsx` + `useAuth.ts` (context-basert)
- ✅ Lagt til `types.ts` og `authService.ts` for bedre struktur

### 2.2 Dataflyt (Oppdatert)

```
App.tsx (Root)
    ↓
AuthProvider (Wrapper)
    ↓
AppContent (Conditional rendering)
    ↓
useAuth() → { user, loading, error, login, logout }
    ↓
user === null → LoginPage
user !== null → AdminDashboard / EmployeeDashboard
```

**Viktige states:**
```typescript
interface AuthState {
  user: User | null;      // Innlogget bruker
  loading: boolean;       // Initial load + login/logout prosesser
  error: string | null;   // Feilmeldinger
}
```

---

## 3. UI/UX Design

### 3.1 LoginPage Layout
- **Bakgrunn:** Gradient `bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100`
- **Container:** Sentrert `Card` (max-w-md) med `shadow-2xl`
- **Glassmorphism:** Subtil (`bg-white/90 backdrop-blur-sm`) eller solid hvit
- **Innhold:**
  - PlenPilot Logo (gradient badge)
  - Tittel + velkomsttekst
  - **Faktiske input-felt** (email + password) - controlled components
  - To knapper for dev-testing:
    - "Logg inn som Admin" (Primary, w-full, py-4)
    - "Logg inn som Ansatt" (Secondary, w-full, py-3)
  - Development Badge nederst

### 3.2 Input Komponent
```typescript
interface InputProps {
  label?: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}
```

**Styling:**
- Matcher `Button.tsx`: `rounded-xl`, `focus:ring-4`, `transition-all`
- States: normal, focus, error, disabled
- Touch targets: min 48px høyde

---

## 4. Implementering i Faser

### **FASE 1: TypeScript Foundation & Types**
**Mål:** Definere grunnleggende typer og interfaces

**Oppgaver:**
- [ ] Opprett `src/features/auth/types.ts`
- [ ] Definer `Role` type: `"admin" | "employee"`
- [ ] Definer `User` interface: `{ id: string; email: string; role: Role }`
- [ ] Definer `AuthState` interface: `{ user, loading, error }`
- [ ] Definer `AuthContextValue` interface: `{ ...AuthState, login, logout }`

**Testing:**
```
Agent: voltagent-qa-sec:code-reviewer
Fokus: TypeScript type safety, interface design
Kommando: Review types.ts for completeness and future extensibility
```

---

### **FASE 2: UI Components (Input)**
**Mål:** Lage gjenbrukbar Input-komponent som matcher designsystem

**Oppgaver:**
- [ ] Opprett `src/components/ui/Input.tsx`
- [ ] Implementer alle variants: normal, focus, error, disabled
- [ ] Støtte for label, placeholder, error message
- [ ] Accessibility: aria-labels, aria-invalid, aria-describedby
- [ ] Keyboard navigation (tabIndex, autoComplete)

**Styling-krav:**
- `rounded-xl` (matcher Button)
- `border border-slate-200` → `focus:border-blue-500`
- `bg-slate-50` → `focus:bg-white`
- `focus:ring-4 focus:ring-blue-500/5`
- `py-3` (touch target: 48px)

**Testing:**
```
Agent: voltagent-core-dev:ui-designer
Fokus: Design consistency, accessibility, responsive design
Kommando: Review Input.tsx against existing Button.tsx and Card.tsx patterns
```

---

### **FASE 3: Auth Service (Mock Logic)**
**Mål:** Isolere auth-logikk for enkel Firebase-migrering

**Oppgaver:**
- [ ] Opprett `src/features/auth/authService.ts`
- [ ] Implementer `login(email, password): Promise<User>`
- [ ] Implementer `logout(): Promise<void>`
- [ ] Legg til delay (500ms) for å simulere nettverk
- [ ] Mock-brukerdata:
  - `admin@plen.no` → Admin user
  - `ansatt@plen.no` → Employee user
  - Andre → Error: "Ugyldig bruker"

**Testing:**
```
Agent: voltagent-qa-sec:code-reviewer
Fokus: Error handling, async patterns, Firebase compatibility
Kommando: Review authService.ts for async best practices and migration readiness
```

---

### **FASE 4: Auth Context & Provider**
**Mål:** Implementere global auth state med Context API

**Oppgaver:**
- [ ] Opprett `src/features/auth/AuthProvider.tsx`
- [ ] Implementer `AuthContext` med `createContext`
- [ ] Implementer `AuthProvider` component:
  - State management (`user`, `loading`, `error`)
  - Initial loading fra localStorage
  - `login()` funksjon (kaller authService, setter loading/error)
  - `logout()` funksjon (clearer state, localStorage)
  - Persistens: `localStorage.setItem('plenpilot_user', ...)`
- [ ] Error handling med try/catch
- [ ] Loading states under async operasjoner

**Krav:**
- Start med `loading: true` (sjekker persistert sesjon)
- Håndter localStorage ved mount (useEffect)
- Clear error når ny login startes

**Testing:**
```
Agent: voltagent-qa-sec:architect-reviewer
Fokus: State management, context patterns, Firebase migration path
Kommando: Review AuthProvider.tsx for Context API best practices and scalability
```

---

### **FASE 5: useAuth Hook**
**Mål:** Convenience hook for å konsumere AuthContext

**Oppgaver:**
- [ ] Opprett `src/features/auth/useAuth.ts`
- [ ] Implementer hook som bruker `useContext(AuthContext)`
- [ ] Throw error hvis brukt utenfor `AuthProvider`
- [ ] Export hook for bruk i komponenter

```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Testing:**
```
Agent: voltagent-qa-sec:code-reviewer
Fokus: Hook patterns, error handling
Kommando: Review useAuth.ts for proper context usage
```

---

### **FASE 6: LoginPage UI**
**Mål:** Implementere login-skjermen med alle UI-elementer

**Oppgaver:**
- [ ] Opprett `src/features/auth/LoginPage.tsx`
- [ ] Implementer layout (gradient background, sentrert Card)
- [ ] Logo + Tittel section
- [ ] Email Input (controlled component)
- [ ] Password Input (controlled component)
- [ ] Development buttons:
  - "Logg inn som Admin" → `login('admin@plen.no', 'password')`
  - "Logg inn som Ansatt" → `login('ansatt@plen.no', 'password')`
- [ ] Development Badge
- [ ] Loading state (disable inputs/buttons)
- [ ] Error display (rød alert/banner)

**Interaktivitet:**
- [ ] Form state: `useState` for email/password
- [ ] `useAuth()` for login-funksjon og state
- [ ] Disabled state når `loading === true`
- [ ] Vis feil når `error !== null`

**Testing:**
```
Agent: voltagent-core-dev:ui-designer
Fokus: UI/UX, responsive design, accessibility
Kommando: Review LoginPage.tsx for design consistency and user experience
```

---

### **FASE 7: App Integration**
**Mål:** Integrere auth-systemet i App.tsx

**Oppgaver:**
- [ ] Wrap app i `<AuthProvider>`
- [ ] Lage `AppContent` component for conditional rendering
- [ ] Implementer loading state (vis spinner/skeleton)
- [ ] Implementer auth check:
  - `!user` → `<LoginPage />`
  - `user.role === 'admin'` → `<AdminDashboard />`
  - `user.role === 'employee'` → `<EmployeeDashboard />`
- [ ] Fjern eller flytt dev role-switcher
- [ ] Legg til logout-funksjonalitet i dashboards (senere)

**App.tsx struktur:**
```typescript
export default function App() {
  return (
    <AuthProvider>
      <InstallPrompt />
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPage />;

  return user.role === 'admin'
    ? <AdminDashboard />
    : <EmployeeDashboard />;
}
```

**Testing:**
```
Agent: voltagent-qa-sec:architect-reviewer
Fokus: Integration patterns, app structure, routing
Kommando: Review App.tsx integration for proper provider setup and conditional rendering
```

---

### **FASE 8: End-to-End Testing**
**Mål:** Verifisere hele autentiseringsflyten

**Test-scenarioer:**
- [ ] Initial load: Viser LoginPage hvis ingen lagret sesjon
- [ ] Initial load: Viser Dashboard hvis lagret sesjon finnes
- [ ] Login as Admin: Korrekt redirect til AdminDashboard
- [ ] Login as Employee: Korrekt redirect til EmployeeDashboard
- [ ] Loading states: Spinner vises under login
- [ ] Error handling: Feilmelding vises ved ugyldig login
- [ ] Persistens: Sesjon beholdes ved refresh
- [ ] Logout: Returnerer til LoginPage og clearer localStorage

**Manual testing:**
- [ ] Test på desktop (Chrome, Firefox)
- [ ] Test på mobile (responsive design)
- [ ] Test keyboard navigation (Tab, Enter)
- [ ] Test screen reader (accessibility)

**Testing:**
```
Agent: voltagent-qa-sec:qa-expert
Fokus: End-to-end flows, edge cases, user experience
Kommando: Review complete auth flow for bugs and UX issues
```

---

## 5. Review-prosess per Fase

### Review-kommandoer:

**Fase 1 (Types):**
```bash
# Use code-reviewer agent to validate TypeScript definitions
Task: "Review src/features/auth/types.ts for type safety and extensibility"
```

**Fase 2 (Input Component):**
```bash
# Use ui-designer agent to validate design consistency
Task: "Review src/components/ui/Input.tsx against design system"
```

**Fase 3 (Auth Service):**
```bash
# Use code-reviewer agent to validate async patterns
Task: "Review src/features/auth/authService.ts for Firebase compatibility"
```

**Fase 4 (Auth Provider):**
```bash
# Use architect-reviewer agent to validate architecture
Task: "Review src/features/auth/AuthProvider.tsx for Context API best practices"
```

**Fase 5 (useAuth Hook):**
```bash
# Use code-reviewer agent to validate hook patterns
Task: "Review src/features/auth/useAuth.ts for proper context usage"
```

**Fase 6 (LoginPage):**
```bash
# Use ui-designer agent to validate UI/UX
Task: "Review src/features/auth/LoginPage.tsx for design and accessibility"
```

**Fase 7 (App Integration):**
```bash
# Use architect-reviewer agent to validate integration
Task: "Review src/App.tsx integration for proper setup"
```

**Fase 8 (E2E Testing):**
```bash
# Use qa-expert agent for comprehensive testing
Task: "Test complete auth flow for bugs and UX issues"
```

---

## 6. Klargjøring for Firebase (Fremtidig)

Når vi senere skal aktivere Firebase, trenger vi KUN å redigere `authService.ts`:

**Før (Mock):**
```typescript
export const authService = {
  login: async (email, password) => {
    await delay(500);
    if (email === 'admin@plen.no') return mockUser;
    throw new Error('Invalid');
  }
};
```

**Etter (Firebase):**
```typescript
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

export const authService = {
  login: async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },
  logout: () => signOut(auth)
};
```

**AuthProvider endringer:**
- Legg til `onAuthStateChanged` listener i useEffect
- Fjern localStorage (Firebase håndterer persistens)
- Resten av koden forblir uendret!

---

## 7. Suksesskriterier

- ✅ LoginPage vises som første skjerm
- ✅ Admin-login fører til AdminDashboard
- ✅ Employee-login fører til EmployeeDashboard
- ✅ Loading state fungerer korrekt
- ✅ Error messages vises ved feil
- ✅ Sesjon persisteres over refresh
- ✅ Design matcher eksisterende komponenter
- ✅ Accessible (keyboard + screen reader)
- ✅ Responsive (mobile + desktop)
- ✅ Klar for Firebase-migrering (kun authService.ts endres)
