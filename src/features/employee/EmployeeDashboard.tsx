import { Card } from "../../components/ui/Card";

export function EmployeeDashboard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Ansattportal</h1>
        <p className="mt-2 text-slate-500">
          Dette dashbordet er under utvikling. Her vil ansatte kunne se sine oppgaver og sjekke inn.
        </p>
      </Card>
    </div>
  );
}
