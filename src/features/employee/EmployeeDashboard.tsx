import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../auth";

export function EmployeeDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white shadow-lg">
              <span className="text-lg font-bold">PP</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">PlenPilot</h1>
              <p className="text-xs text-slate-500">Ansattportal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {user?.displayName || "Ansatt"}
              </p>
              <Badge variant="success" dot={false} className="text-[10px]">
                Ansatt
              </Badge>
            </div>
            <Button variant="secondary" size="sm" onClick={logout}>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logg ut
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Ansattportal</h1>
          <p className="mt-2 text-slate-500">
            Dette dashbordet er under utvikling. Her vil ansatte kunne se sine
            oppgaver og sjekke inn.
          </p>
        </Card>
      </main>
    </div>
  );
}
