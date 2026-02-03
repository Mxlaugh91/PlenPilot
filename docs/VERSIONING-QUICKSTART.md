# Versjonering - Quick Start Guide

## TL;DR

Versjonsnummer genereres automatisk ved hver build basert på Git commits.
Du trenger ikke gjøre noe manuelt - det bare fungerer!

## Første gang setup

### 1. Generer initial versjonsfil

```bash
npm run version:generate
```

Dette lager `src/version.ts` og `public/version.json`.

### 2. Build som vanlig

```bash
npm run build
```

Versjon genereres automatisk via `prebuild` hook.

## Daglig bruk

### Lokal utvikling

```bash
# Gjør endringer
# Commit endringer
git add .
git commit -m "Legg til ny funksjon"

# Build (versjon oppdateres automatisk)
npm run build
```

Versjonsnummer øker automatisk: `1.0.0-5` → `1.0.0-6`

### Oppdater hovedversjon

Når du lager en ny release:

```bash
# Patch (1.0.0 -> 1.0.1)
npm version patch

# Minor (1.0.0 -> 1.1.0)
npm version minor

# Major (1.0.0 -> 2.0.0)
npm version major
```

## Bruk i kode

### Vis versjon i UI

```tsx
import { VersionDisplay } from './components/ui/VersionDisplay';

// I footer eller settings
<VersionDisplay variant="compact" />
```

### Les versjon i kode

```typescript
import { VERSION, VERSION_INFO } from './version';

console.log(VERSION); // "1.0.0-42"
console.log(VERSION_INFO.commitHash); // "a3f5b2c"
```

### Se versjon i console

Åpne browser DevTools - versjon logges automatisk ved app-start.

## Sjekk nåværende versjon

```bash
# Se full versjonsinformasjon
npm run version:show

# Eller les filen direkte
cat public/version.json
```

## Feilsøking

### Versjon vises ikke?

```bash
# Generer versjon manuelt
npm run version:generate

# Sjekk at filen ble laget
ls src/version.ts
ls public/version.json
```

### Build number øker ikke?

Sørg for at du har committed endringene:
```bash
git status  # Sjekk om det er uncommitted changes
git add .
git commit -m "Dine endringer"
npm run build  # Nå vil build number øke
```

## CI/CD

Når du setter opp GitHub Actions eller annen CI/CD:

1. Sørg for full Git history: `fetch-depth: 0`
2. Kjør `npm run build` - versjon genereres automatisk
3. That's it!

Se `.github/workflows/build-and-deploy.yml` for komplett eksempel.

## Hva genereres?

### src/version.ts
```typescript
export const VERSION_INFO = {
  version: "1.0.0-42",
  fullVersion: "1.0.0-42+a3f5b2c",
  buildNumber: 42,
  commitHash: "a3f5b2c",
  branch: "master",
  isDirty: false,
  buildDate: "2026-02-02T12:00:00.000Z"
} as const;
```

### public/version.json
```json
{
  "version": "1.0.0-42",
  "fullVersion": "1.0.0-42+a3f5b2c",
  "buildNumber": 42,
  "commitHash": "a3f5b2c",
  "branch": "master",
  "isDirty": false,
  "buildDate": "2026-02-02T12:00:00.000Z",
  "buildTimestamp": 1738497600000
}
```

## Fordeler

- ✓ Null manuelt arbeid
- ✓ Ingen merge-konflikter
- ✓ Automatisk i CI/CD
- ✓ Full sporbarhet
- ✓ TypeScript support

## Behov for hjelp?

Se full dokumentasjon: `docs/VERSIONING.md`
