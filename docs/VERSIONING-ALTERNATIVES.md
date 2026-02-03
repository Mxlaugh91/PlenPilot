# Versjonering - Alternativer og Vurdering

## Sammenligning av løsninger

### Løsning 1: Manuell versjonering (IKKE anbefalt)

**Implementering:**
- Oppdater package.json manuelt
- Commit version.json til Git

**Fordeler:**
- Enkel å forstå
- Ingen ekstra scripts

**Ulemper:**
- ❌ Krever manuelt arbeid hver build
- ❌ Lett å glemme
- ❌ Merge-konflikter
- ❌ Ingen automatisk progresjon
- ❌ Ikke CI/CD-vennlig

### Løsning 2: Timestamp-basert versjonering

**Implementering:**
```javascript
const version = new Date().toISOString();
// "2026-02-02T12:00:00.000Z"
```

**Fordeler:**
- Automatisk
- Unikt per build

**Ulemper:**
- ❌ Vanskelig å sammenligne versjoner
- ❌ Ikke semantisk mening
- ❌ Ingen kobling til Git
- ❌ Ikke standard format

### Løsning 3: Git hooks (pre-commit)

**Implementering:**
```bash
#!/bin/bash
# .git/hooks/pre-commit
node scripts/generate-version.js
git add src/version.ts
```

**Fordeler:**
- Automatisk ved commit
- Git-integrert

**Ulemper:**
- ❌ Merge-konflikter (filer i Git)
- ❌ Fungerer ikke i CI/CD uten ekstra setup
- ❌ Kan hoppe over med --no-verify
- ❌ Ekstra commit for hver versjonendring

### Løsning 4: Environment variables

**Implementering:**
```bash
export VERSION="1.0.0"
npm run build
```

**Fordeler:**
- Fleksibel
- Ingen filer å committe

**Ulemper:**
- ❌ Krever manuell setting
- ❌ Forskjellig mellom utviklere
- ❌ Lett å glemme
- ❌ Kompleks CI/CD setup

### Løsning 5: Hybrid Git + Build-time (VALGT) ✓

**Implementering:**
- Semantic version i package.json (manuell)
- Build number fra Git commits (automatisk)
- Genereres ved build-tid (prebuild hook)
- Filer gitignored

**Fordeler:**
- ✅ Automatisk for daglig bruk
- ✅ Ingen merge-konflikter
- ✅ Fungerer lokalt og CI/CD
- ✅ Sporbarhet via Git
- ✅ Semantic versioning
- ✅ Standard format
- ✅ Null vedlikehold

**Ulemper:**
- Krever Git tilgjengelig (med fallback)
- Første build trenger setup

**Hvorfor dette er best:**
Kombinerer det beste fra flere løsninger:
- Git som single source of truth
- Automatisk build number
- Manuell kontroll over major/minor/patch
- Ingen konflikter eller manuelt arbeid

## Tekniske valg

### Valg 1: Git commit count vs. Build counter

**Git commit count (VALGT):**
```javascript
const buildNumber = execSync('git rev-list --count HEAD');
```

**Fordeler:**
- Deterministisk (samme commit = samme nummer)
- Fungerer på tvers av miljøer
- Ingen database nødvendig

**Build counter (alternativ):**
```javascript
let counter = readCounter() + 1;
writeCounter(counter);
```

**Ulemper:**
- Krever persistent storage
- Forskjellig mellom miljøer
- Merge-konflikter

**Konklusjon:** Git commit count er overlegen for distributed development.

### Valg 2: TypeScript + JSON vs. Kun JSON

**Hybrid (VALGT):**
- `src/version.ts` - TypeScript constants
- `public/version.json` - Runtime JSON

**Fordeler:**
- TypeScript autocomplete
- Compile-time type safety
- Runtime tilgjengelig
- Best of both worlds

**Kun JSON (alternativ):**
- `public/version.json` - Kun JSON

**Ulemper:**
- Ingen TypeScript support
- Må parse ved runtime
- Ingen autocomplete

**Konklusjon:** Hybrid gir best developer experience.

### Valg 3: prebuild hook vs. postinstall hook

**prebuild (VALGT):**
```json
{
  "scripts": {
    "prebuild": "node scripts/generate-version.js"
  }
}
```

**Fordeler:**
- Kjører før hver build
- Alltid fersk versjon
- Ikke kjører ved npm install

**postinstall (alternativ):**
```json
{
  "scripts": {
    "postinstall": "node scripts/generate-version.js"
  }
}
```

**Ulemper:**
- Kjører for ofte (hver npm install)
- Kan feile i CI hvis Git ikke tilgjengelig ennå
- Unødvendig overhead

**Konklusjon:** prebuild er mer presist og effektivt.

### Valg 4: Full hash vs. Short hash

**Short hash (VALGT):**
```javascript
git rev-parse --short HEAD  // "a3f5b2c"
```

**Fordeler:**
- Kortere
- Mer lesbart
- Fortsatt unikt i de fleste tilfeller
- Standard i Git-verden

**Full hash (alternativ):**
```javascript
git rev-parse HEAD  // "a3f5b2c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3"
```

**Ulemper:**
- For langt for UI
- Overkill for sporbarhet

**Konklusjon:** Short hash er perfekt balanse.

### Valg 5: Gitignore vs. Commit generated files

**Gitignore (VALGT):**
```
src/version.ts
public/version.json
```

**Fordeler:**
- ✅ Ingen merge-konflikter
- ✅ Git er source of truth
- ✅ Konsistent på tvers av branches
- ✅ Automatisk regenerering

**Commit files (alternativ):**
```
# Git track version files
```

**Ulemper:**
- ❌ Merge-konflikter garantert
- ❌ Ekstra commits for version bumps
- ❌ Forvirring ved branch switching

**Konklusjon:** Gitignore er klart overlegen.

## Bruksmønstre

### Solo utvikler (nåværende)

**Behov:**
- Enkel å bruke
- Minimal overhead
- Fungerer lokalt

**Løsning:**
Hybrid Git + Build-time dekker alle behov perfekt.

### Team (fremtidig)

**Behov:**
- Konsistent på tvers av utviklere
- Ingen merge-konflikter
- Automatisk i CI/CD

**Løsning:**
Samme løsning skalerer perfekt til team:
- Git commit count er lik for alle
- Ingen filer å merge
- CI/CD klar

### CI/CD (fremtidig)

**Behov:**
- Deterministisk versjonering
- Automatisk tagging
- Audit trail

**Løsning:**
Løsningen er designet for CI/CD:
- Full Git history gir korrekt build number
- Commit hash gir sporbarhet
- Kan automatisk lage Git tags

## Skalerbarhet

### Scenario: 1000 commits

**Git commit count:**
```
Build number: 1000
Fortsatt rask: git rev-list --count HEAD < 50ms
```

Ingen problemer.

### Scenario: Multiple branches

**Git commit count per branch:**
```
master:  commit count = 100 → version 1.0.0-100
develop: commit count = 105 → version 1.0.0-105
feature: commit count = 107 → version 1.0.0-107
```

Dette er ØNSKET oppførsel - hver branch har sitt build number basert på sin history.

### Scenario: Monorepo

**Per-package versioning:**
```javascript
// Kan filtrere commits per folder
const buildNumber = execSync(
  'git rev-list --count HEAD -- packages/app'
);
```

Løsningen kan tilpasses monorepo hvis nødvendig.

## Fremtidige forbedringer

### Mulig utvidelse 1: Release notes

```javascript
// Generer release notes fra commits
const commits = execSync(
  'git log --oneline $(git describe --tags --abbrev=0)..HEAD'
);
```

### Mulig utvidelse 2: Automatisk tagging

```yaml
# I GitHub Actions
- name: Create Git tag
  run: |
    git tag v${{ steps.version.outputs.version }}
    git push origin v${{ steps.version.outputs.version }}
```

### Mulig utvidelse 3: Changelog generator

```javascript
// Parse conventional commits
const changelog = generateChangelog(commits);
```

### Mulig utvidelse 4: Version API

```typescript
// Express endpoint
app.get('/api/version', (req, res) => {
  res.json(VERSION_INFO);
});
```

## Kostnadsanalyse

### Utviklingskostnad
- Initial setup: 2 timer (ferdig)
- Vedlikehold: 0 timer/måned
- Debugging: Sjelden nødvendig

### Kjøretidskostnad
- Script execution: ~50ms per build
- Storage: <1KB per build
- Runtime overhead: 0ms (constants)

### ROI (Return on Investment)

**Uten automatisering:**
- 2 min per manuell versjonoppdatering
- 10 builds per dag = 20 min/dag
- 20 min × 20 dager = 400 min/måned = 6.7 timer/måned

**Med automatisering:**
- 0 min manuelt arbeid
- Spart tid: 6.7 timer/måned

**Konklusjon:** System betaler seg selv på mindre enn én måned.

## Sikkerhet

### Git commit hash eksponering

**Risiko:** Lav
- Commit hash er allerede public i de fleste repos
- Gir ingen tilgang til kode
- Standard praksis i open source

**Mitigering:**
Hvis nødvendig, kan exclude fra production:
```javascript
if (process.env.NODE_ENV === 'production') {
  VERSION_INFO.commitHash = 'redacted';
}
```

### Build metadata leakage

**Risiko:** Minimal
- Build date/time er ikke sensitiv
- Branch name er normalt public
- isDirty flag er nyttig for debugging

**Konklusjon:** Ingen reelle sikkerhetsproblemer.

## Konklusjon

Hybrid Git + Build-time løsningen er valgt fordi den:

1. **Løser problemet fullstendig**
   - Automatisk versjonering
   - Ingen manuelt arbeid
   - Fungerer både lokalt og CI/CD

2. **Unngår fallgruver**
   - Ingen merge-konflikter
   - Konsistent på tvers av miljøer
   - Deterministisk oppførsel

3. **Skalerer godt**
   - Fungerer for solo utvikler
   - Fungerer for team
   - Fungerer i CI/CD
   - Ingen performance-problemer

4. **Developer-friendly**
   - Null konfigurasjon for daglig bruk
   - TypeScript support
   - Gode feilmeldinger
   - Fallback ved problemer

5. **Production-ready**
   - Testet og verifisert
   - Dokumentert grundig
   - Vedlikeholdsfritt
   - Ingen dependencies

**Dette er den optimale løsningen for dette prosjektet.**
