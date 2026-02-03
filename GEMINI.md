# 🧠 PlenPilot Prosjektminne

Dette dokumentet vedlikeholdes av Gemini for å holde oversikt over prosjektstruktur, arkitekturvalg og status.

## 📅 Siste Status (02.02.2026)
- **Arkitektur-endring:** Prosjektet er refaktorert fra en "Monolittisk" `App.tsx` til en **Rolle-basert arkitektur**.
- **Admin Refactoring:** `AdminDashboard.tsx` er splittet opp i mindre "View"-komponenter for bedre ryddighet.
- **Features implementert:**
    - `AdminDashboard`: Hovedcontainer for admin.
    - `AdminOverview`: Kort-oversikt.
    - `AdminEmployeeView`: Ansatt-visning.
    - `AdminLocationView`: Steds-liste med filtrering og modal.
    - `AdminMaintenanceView`: Maskinpark-oversikt med maintenance-logikk.
    - `AdminSettingsView`: Egen visning for innstillinger (Generelt, Varslinger).
    - `EmployeeDashboard`: Placeholder for fremtidig ansatt-visning.
- **Routing:** `App.tsx` fungerer nå som "Router" og velger visning basert på brukerrolle (Admin/Ansatt). Dev-switch lagt til i UI.
- **Styling:** Header border endret til `slate-200` for mykere overgang.

---

## 🗺️ Arkitekturkart & Filoversikt

### `src/` (Kildekode)
| Sti | Beskrivelse |
| :--- | :--- |
| **`App.tsx`** | **HOVEDRUTER.** Bestemmer om brukeren skal se Admin eller Ansatt dashboard. Inneholder "Dev-switch" for roller. |
| **`main.tsx`** | Entry point. Mounter React til DOM. |
| **`features/`** | **Forretningslogikk inndelt etter domene.** |
| `features/admin/` | Kode relatert til administrator-grensesnittet. |
| `.../AdminDashboard.tsx` | **Container.** Håndterer layout og faner. |
| `.../AdminOverview.tsx` | Visning for "Oversikt" fanen. |
| `.../AdminLocationView.tsx` | Visning for "Steder" fanen. Inkluderer filtrering. |
| `.../AdminMaintenanceView.tsx` | Visning for "Vedlikehold" fanen. Inkluderer maskin-logikk. |
| `.../AdminSettingsView.tsx` | Visning for "Innstillinger" fanen. |
| `.../types.ts` | TypeScript definisjoner for Admin-modulen. |
| `.../components/` | Admin-spesifikke komponenter (f.eks `NewLocationModal`). |
| `features/employee/` | Kode relatert til ansatt-grensesnittet. |
| `.../EmployeeDashboard.tsx` | Enkel visning for ansatte (Foreløpig placeholder). |
| **`components/ui/`** | **Gjenbrukbare UI-komponenter (Primitive).** |
| `.../Card.tsx` | Standard kort-komponent med hvit bakgrunn og skygge. |
| `.../Button.tsx` | Standard knapp med varianter (primary, ghost, outline, osv). |
| `.../Badge.tsx` | Merkelapper for status (success, warning, danger). |
| **`assets/`** | Bilder og statiske ressurser. |

---

## 🛠️ Kommende Planer (Arkitektur)
1.  Flytte Mock-data helt ut av komponentfiler (delvis gjort ved splitting).
2.  Implementere `EmployeeDashboard` med reell funksjonalitet.

---

## 📝 Huskeliste for utviklere
- **Nye features:** Skal legges i `src/features/[feature-navn]`. Om det er til Admin eller Til employee
- **UI-komponenter:** Generiske ting (som knapper, inputs) skal i `src/components/ui`.
**Ikoner:** Bruk `lucide-react` for ikoner. Se på `AdminEmployeeView.tsx` for et eksempel.
- **Tilstand:** Prøv å hold state lokalt i featuren det gjelder, med mindre det må deles globalt.
