
import { VERSION_INFO } from '../../version';

interface VersionDisplayProps {
  variant?: 'compact' | 'detailed';
  className?: string;
}

/**
 * Viser applikasjonens versjonsinformasjon
 * Bruker auto-generert versjon fra build-prosessen
 */
export function VersionDisplay({ variant = 'compact', className = '' }: VersionDisplayProps) {
  if (variant === 'compact') {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        v{VERSION_INFO.version}
      </div>
    );
  }

  return (
    <div className={`text-xs text-gray-500 space-y-1 ${className}`}>
      <div className="font-semibold">Version Info</div>
      <div>Version: {VERSION_INFO.version}</div>
      <div>Build: #{VERSION_INFO.buildNumber}</div>
      <div>Commit: {VERSION_INFO.commitHash}</div>
      <div>Branch: {VERSION_INFO.branch}</div>
      <div>Built: {new Date(VERSION_INFO.buildDate).toLocaleString('nb-NO')}</div>
      {VERSION_INFO.isDirty && (
        <div className="text-yellow-600">⚠ Development build (uncommitted changes)</div>
      )}
    </div>
  );
}

/**
 * Hook for å hente versjonsinformasjon programmatisk
 */
export function useVersion() {
  return VERSION_INFO;
}

/**
 * Utility for å logge versjonsinformasjon til console
 * Kjører automatisk ved app-start
 */
export function logVersionInfo() {
  console.group('🚀 PlenPilot Version Info');
  console.log(`Version: ${VERSION_INFO.fullVersion}`);
  console.log(`Build Number: #${VERSION_INFO.buildNumber}`);
  console.log(`Commit: ${VERSION_INFO.commitHash}`);
  console.log(`Branch: ${VERSION_INFO.branch}`);
  console.log(`Built: ${VERSION_INFO.buildDate}`);
  if (VERSION_INFO.isDirty) {
    console.warn('⚠ Development build with uncommitted changes');
  }
  console.groupEnd();
}
