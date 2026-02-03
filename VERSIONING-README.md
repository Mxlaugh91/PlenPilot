# Automatisk Versjonsnummerering for PlenPilot

## Hva er implementert?

Et komplett, automatisk versjonssystem som:

- Genererer versjonsnummer automatisk ved hver build
- Basert på Git commits (build number) + package.json (semantic version)
- Fungerer både lokalt og i CI/CD
- Ingen merge-konflikter
- Null manuelt arbeid

## Versjonsnummer Format

```
1.0.0-42+a3f5b2c
│ │ │  │   │
│ │ │  │   └── Git commit hash (kort)
│ │ │  └────── Build number (Git commit count)
│ │ └───────── Patch version
│ └─────────── Minor version
└───────────── Major version
```

## Hvordan det fungerer

```
Developer commits → npm run build → prebuild hook → generate-version.js
                                                            │
                                                            ├─→ src/version.ts
                                                            └─→ public/version.json
```

## Filer som er lagt til

### Scripts
- `scripts/generate-version.js` - Hovedscript som genererer versjonsinformasjon

### Komponenter
- `src/components/ui/VersionDisplay.tsx` - React-komponent for å vise versjon
- `src/utils/version-logger.ts` - Logger versjon til console ved app-start
- `src/version.ts.template` - Template for første build

### Dokumentasjon
- `docs/VERSIONING.md` - Full dokumentasjon
- `docs/VERSIONING-QUICKSTART.md` - Quick start guide
- `docs/VERSIONING-IMPLEMENTATION.md` - Teknisk implementering

### CI/CD
- `.github/workflows/build-and-deploy.yml` - GitHub Actions workflow (eksempel)

### Konfigurasjonsendringer
- `package.json` - Lagt til scripts og oppdatert version til 1.0.0
- `.gitignore` - Lagt til genererte versjonsfiler

## Quick Start

### 1. Generer første versjon

```bash
npm run version:generate
```

Dette lager:
- `src/version.ts` (TypeScript constants)
- `public/version.json` (Runtime JSON)

### 2. Build som vanlig

```bash
npm run build
```

Versjon genereres automatisk!

### 3. Se versjon

```bash
npm run version:show
```

Output:
```json
{
  "version": "1.0.0-9",
  "fullVersion": "1.0.0-9+10c7d67",
  "buildNumber": 9,
  "commitHash": "10c7d67",
  "branch": "master",
  "isDirty": true,
  "buildDate": "2026-02-02T22:24:34.982Z"
}
```

## Bruk i kode

### Vis versjon i UI

```tsx
import { VersionDisplay } from './components/ui/VersionDisplay';

// I footer
<footer>
  <VersionDisplay variant="compact" />
</footer>

// I settings
<div className="settings">
  <VersionDisplay variant="detailed" />
</div>
```

### Les versjon i TypeScript

```typescript
import { VERSION, VERSION_INFO } from './version';

console.log(VERSION); // "1.0.0-9"
console.log(VERSION_INFO.commitHash); // "10c7d67"
console.log(VERSION_INFO.buildNumber); // 9
```

### Hent versjon via API

```typescript
const response = await fetch('/version.json');
const version = await response.json();
console.log(`Running version ${version.version}`);
```

## Daglig bruk

### Vanlig utvikling

```bash
# Gjør endringer i koden
# ...

# Commit endringer
git add .
git commit -m "Legg til ny funksjon"

# Build
npm run build  # Versjon: 1.0.0-9 → 1.0.0-10 (automatisk!)
```

### Oppdater hovedversjon

```bash
# Patch (1.0.0 → 1.0.1)
npm version patch

# Minor (1.0.0 → 1.1.0)
npm version minor

# Major (1.0.0 → 2.0.0)
npm version major
```

Build number fortsetter å øke: `2.0.0-10`, `2.0.0-11`, osv.

## CI/CD Setup

### GitHub Actions (inkludert)

Workflow er allerede konfigurert i `.github/workflows/build-and-deploy.yml`:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # Viktig!

- run: npm ci
- run: npm run build  # Versjon genereres automatisk
```

### Andre CI systemer

Samme prinsipp:
1. Sørg for `fetch-depth: 0` (full Git history)
2. Kjør `npm run build`
3. That's it!

## Kommandooversikt

| Kommando | Beskrivelse |
|----------|-------------|
| `npm run version:generate` | Generer versjon manuelt |
| `npm run version:show` | Vis nåværende versjon |
| `npm run build` | Build med automatisk versjonering |
| `npm version patch/minor/major` | Oppdater semantic version |

## Hva genereres?

### src/version.ts
TypeScript constants for compile-time tilgang:
```typescript
export const VERSION_INFO = {
  version: "1.0.0-9",
  fullVersion: "1.0.0-9+10c7d67",
  baseVersion: "1.0.0",
  buildNumber: 9,
  commitHash: "10c7d67",
  branch: "master",
  isDirty: true,
  buildDate: "2026-02-02T22:24:34.982Z",
  buildTimestamp: 1770071074982
} as const;
```

### public/version.json
JSON for runtime tilgang:
```json
{
  "version": "1.0.0-9",
  "fullVersion": "1.0.0-9+10c7d67",
  "buildNumber": 9,
  "commitHash": "10c7d67",
  "branch": "master",
  "isDirty": true,
  "buildDate": "2026-02-02T22:24:34.982Z"
}
```

## Fordeler

### For solo utvikler
- Null ekstra arbeid
- Automatisk ved hver build
- Ingen merge-konflikter
- Alltid riktig versjon

### For fremtidig CI/CD
- Klar for automatisk deploy
- Samme script lokalt og i CI
- Sporbarhet via commit hash
- Kan tagge releases automatisk

### Generelt
- Full audit trail
- TypeScript support
- Runtime tilgjengelig
- Developer-friendly

## Eksempel på bruk

### Console ved app-start
```
🚀 PlenPilot Version Info
Version: 1.0.0-9+10c7d67
Build Number: #9
Commit: 10c7d67
Branch: master
Built: 02.02.2026, 23:24:34
⚠ Development build with uncommitted changes
```

### UI i footer
```
v1.0.0-9
```

### UI i settings
```
Version Info
Version: 1.0.0-9
Build: #9
Commit: 10c7d67
Branch: master
Built: 02.02.2026, 23:24:34
```

## Dokumentasjon

- **Quick Start:** `docs/VERSIONING-QUICKSTART.md` - Kom i gang på 2 minutter
- **Full Guide:** `docs/VERSIONING.md` - Komplett dokumentasjon
- **Implementation:** `docs/VERSIONING-IMPLEMENTATION.md` - Tekniske detaljer

## Testing

System er testet og bekreftet fungerende:

```bash
$ npm run version:generate
✓ Version generated: 1.0.0-9+10c7d67
  Base: 1.0.0
  Build: 9
  Commit: 10c7d67
  Branch: master
  Dirty: YES (uncommitted changes)
```

## Neste steg

1. **Kjør første versjonsgenerering:**
   ```bash
   npm run version:generate
   ```

2. **Test build:**
   ```bash
   npm run build
   ```

3. **Vis versjon i UI (valgfritt):**
   Legg til `<VersionDisplay />` i ønsket komponent

4. **Deploy:**
   Build inneholder automatisk versjonsinformasjon

## Support

- Feilsøking: Se `docs/VERSIONING.md` → "Feilsøking" seksjon
- Spørsmål: Se full dokumentasjon
- Problemer: Sjekk at Git er tilgjengelig og du har committed endringer

## Konklusjon

Automatisk versjonsnummerering er nå fullstendig implementert og klar til bruk.

- Ingen konfigurasjon nødvendig for daglig bruk
- Fungerer både lokalt og i fremtidig CI/CD
- Null vedlikehold påkrevd
- Production-ready

**Just build and deploy!** 🚀
