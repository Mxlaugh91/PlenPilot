# 🧠 PlenPilot Prosjektminne

Dette dokumentet vedlikeholdes av Gemini for å holde oversikt over prosjektstruktur, arkitekturvalg og status.

## 📅 Siste Status (02.02.2026)
- **Arkitektur-endring:** Prosjektet er refaktorert fra en "Monolittisk" `App.tsx` til en **Rolle-basert arkitektur**.
- **Features implementert:**
    - `AdminDashboard`: Den opprinnelige funksjonaliteten.
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
| `.../AdminDashboard.tsx` | Det komplette admin-dashbordet (Tidligere App.tsx). Inneholder tabs for Oversikt, Ansatte, Steder, Arkiv, Vedlikehold. |
| `features/employee/` | Kode relatert til ansatt-grensesnittet. |
| `.../EmployeeDashboard.tsx` | Enkel visning for ansatte (Foreløpig placeholder). |
| **`components/ui/`** | **Gjenbrukbare UI-komponenter (Primitive).** |
| `.../Card.tsx` | Standard kort-komponent med hvit bakgrunn og skygge. |
| `.../Button.tsx` | Standard knapp med varianter (primary, ghost, outline, osv). |
| `.../Badge.tsx` | Merkelapper for status (success, warning, danger). |
| **`assets/`** | Bilder og statiske ressurser. |

---

## 🛠️ Kommende Planer (Arkitektur)
1.  Splitte opp `AdminDashboard.tsx` videre i mindre feature-mapper (`features/admin/vedlikehold`, `features/admin/steder` osv.) for å redusere filstørrelsen.
2.  Flytte TypeScript interfaces til egne typer-filer (`types.ts`).
3.  Flytte Mock-data ut av komponentfiler.

---

## 📝 Huskeliste for utviklere
- **Nye features:** Skal legges i `src/features/[feature-navn]`. Om det er til Admin eller Til employee
- **UI-komponenter:** Generiske ting (som knapper, inputs) skal i `src/components/ui`.
- **Tilstand:** Prøv å hold state lokalt i featuren det gjelder, med mindre det må deles globalt.
