# Automatisk Versjonsnummerering

## Oversikt

PlenPilot bruker et automatisk versjonssystem som kombinerer:
- **Semantic versioning** (MAJOR.MINOR.PATCH) fra package.json
- **Build number** (automatisk fra Git commits)
- **Commit hash** (for sporing)

Resultat: `1.0.0-42+a3f5b2c` (versjon 1.0.0, build 42, commit a3f5b2c)

## Hvordan det fungerer

### 1. Lokal utvikling

Når du kjører `npm run build`:
1. `prebuild` hook kjører automatisk `scripts/generate-version.js`
2. Scriptet leser versjon fra package.json (f.eks. 1.0.0)
3. Teller antall Git commits som build number
4. Genererer to filer:
   - `src/version.ts` - For bruk i TypeScript kode
   - `public/version.json` - For runtime tilgang (API etc.)

### 2. CI/CD (GitHub Actions)

I automatisk deploy:
1. Checkout med full Git history (`fetch-depth: 0`)
2. `npm ci` installerer dependencies
3. `npm run build` triggerer automatisk versjonsgenerering
4. Build inkluderer versjonsinformasjon
5. Valgfritt: Opprett Git tag for release

## Bruk i kode

### TypeScript/React komponenter

```typescript
import { VERSION_INFO, VERSION } from './version';

console.log(`App version: ${VERSION}`); // "1.0.0-42"
console.log(VERSION_INFO.commitHash);   // "a3f5b2c"
console.log(VERSION_INFO.buildDate);    // "2026-02-02T12:00:00.000Z"
```

### React komponent

```tsx
import { VersionDisplay } from './components/ui/VersionDisplay';

// Kompakt visning
<VersionDisplay variant="compact" />

// Detaljert visning
<VersionDisplay variant="detailed" />
```

### API/Runtime tilgang

```typescript
const response = await fetch('/version.json');
const version = await response.json();
console.log(version);
```

## Versjonsnummer oppdatering

### Automatisk (build number)

Build number oppdateres automatisk ved hver commit:
- Commit 1: `1.0.0-1`
- Commit 2: `1.0.0-2`
- Commit 3: `1.0.0-3`
- osv.

### Manuelt (semantic version)

Oppdater hovedversjon i package.json når du gjør breaking changes:

```bash
# Patch release (1.0.0 -> 1.0.1)
npm version patch

# Minor release (1.0.0 -> 1.1.0)
npm version minor

# Major release (1.0.0 -> 2.0.0)
npm version major
```

Build number fortsetter å øke automatisk: `2.0.0-42`, `2.0.0-43`, osv.

## Nyttige kommandoer

```bash
# Generer versjon manuelt (uten build)
npm run version:generate

# Vis nåværende versjon
npm run version:show

# Build med versjon (automatisk)
npm run build

# Se versjon i console ved app-start
# Kjører automatisk logVersionInfo() i main.tsx
```

## Fordeler med denne løsningen

### ✓ Ingen merge-konflikter
- Versjonsfiler er i .gitignore
- Genereres dynamisk ved build
- Git er source of truth

### ✓ Fungerer både lokalt og CI/CD
- Samme script begge steder
- Krever kun Git tilgjengelig
- Fallback hvis Git mangler

### ✓ Sporbarhet
- Commit hash identifiserer eksakt kode
- Build number viser progresjon
- Timestamp viser når bygget ble laget

### ✓ Enkel å bruke
- Automatisk via prebuild hook
- TypeScript autocomplete støtte
- Tilgjengelig både compile-time og runtime

## Feilsøking

### "Git command not found"

Scriptet faller tilbake til dev-versjon hvis Git ikke er tilgjengelig:
```json
{
  "version": "0.0.0-dev",
  "commitHash": "unknown"
}
```

### Build number ikke øker

Sørg for at du committer endringer:
```bash
git add .
git commit -m "Your changes"
npm run build  # Build number vil nå øke
```

### Versjon vises ikke i UI

1. Sjekk at `src/version.ts` eksisterer etter build
2. Kjør `npm run version:generate` manuelt
3. Sjekk console for feilmeldinger

## CI/CD Setup

### GitHub Actions

Se `.github/workflows/build-and-deploy.yml` for komplett eksempel.

Viktige punkter:
```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # MÅ ha full git history!
```

### Andre CI systemer

Samme prinsipp:
1. Shallow clone funker IKKE - trenger full history
2. Sørg for at Git er tilgjengelig
3. Kjør `npm run build` (prebuild kjører automatisk)

## Eksempel output

### Konsoll (ved app-start)

```
🚀 PlenPilot Version Info
Version: 1.0.0-42+a3f5b2c
Build Number: #42
Commit: a3f5b2c
Branch: master
Built: 2026-02-02T12:00:00.000Z
```

### version.json

```json
{
  "version": "1.0.0-42",
  "fullVersion": "1.0.0-42+a3f5b2c",
  "baseVersion": "1.0.0",
  "buildNumber": 42,
  "commitHash": "a3f5b2c",
  "branch": "master",
  "isDirty": false,
  "buildDate": "2026-02-02T12:00:00.000Z",
  "buildTimestamp": 1738497600000
}
```

## Beste praksis

1. **Commit før build** - Sørg for at koden er committed for korrekt versjon
2. **Følg semantic versioning** - Oppdater package.json ved breaking changes
3. **Logg versjon ved oppstart** - Bruk `logVersionInfo()` i main.tsx
4. **Vis versjon i UI** - Legg til `<VersionDisplay />` i footer/settings
5. **Test i CI/CD** - Verifiser at versjon genereres korrekt

## Fremtidige forbedringer

Mulige utvidelser:
- Release notes generator (basert på commits)
- Automatisk tagging i GitHub
- Version API endpoint
- Sentry/error tracking integration med versjon
- Changelog generator
