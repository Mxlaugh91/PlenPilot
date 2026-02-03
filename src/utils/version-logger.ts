/**
 * Version logging utility
 * Importeres og kjøres automatisk ved app-oppstart
 */

// Dette vil genereres automatisk ved build
// Hvis filen ikke eksisterer (før første build), håndterer vi det
let VERSION_INFO: any;

try {
  // Dynamisk import for å unngå build-feil før første versjonsgenerering
  VERSION_INFO = await import('../version').then(m => m.VERSION_INFO);
} catch (error) {
  // Før første build - bruk placeholder
  VERSION_INFO = {
    version: '0.0.0-dev',
    fullVersion: '0.0.0-dev+unknown',
    buildNumber: 0,
    commitHash: 'unknown',
    branch: 'unknown',
    isDirty: true,
    buildDate: new Date().toISOString()
  };
}

/**
 * Logger versjonsinformasjon til console ved app-start
 */
export function logVersionInfo() {
  const styles = {
    title: 'font-weight: bold; font-size: 14px; color: #4f46e5;',
    key: 'font-weight: bold; color: #6b7280;',
    value: 'color: #111827;',
    warning: 'color: #d97706; font-weight: bold;'
  };

  console.log('%c🚀 PlenPilot Version Info', styles.title);
  console.log(`%cVersion:%c ${VERSION_INFO.fullVersion}`, styles.key, styles.value);
  console.log(`%cBuild Number:%c #${VERSION_INFO.buildNumber}`, styles.key, styles.value);
  console.log(`%cCommit:%c ${VERSION_INFO.commitHash}`, styles.key, styles.value);
  console.log(`%cBranch:%c ${VERSION_INFO.branch}`, styles.key, styles.value);
  console.log(`%cBuilt:%c ${new Date(VERSION_INFO.buildDate).toLocaleString('nb-NO')}`, styles.key, styles.value);

  if (VERSION_INFO.isDirty) {
    console.log('%c⚠ Development build with uncommitted changes', styles.warning);
  }
}

// Kjør automatisk ved import
logVersionInfo();

// Eksporter for bruk andre steder
export { VERSION_INFO };
