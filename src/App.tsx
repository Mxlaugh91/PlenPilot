import { useState } from "react";
import { AdminDashboard } from "./features/admin/AdminDashboard";
import { EmployeeDashboard } from "./features/employee/EmployeeDashboard";
import { InstallPrompt } from "./components/ui/InstallPrompt";

// Temporary role selector for testing
type Role = "admin" | "employee";

export default function App() {
  // In a real app, this would come from an auth context or API
  const [userRole, setUserRole] = useState<Role>("admin");

  return (
    <>
      <InstallPrompt />
      
      {/* Dev-helper to switch roles (remove in production) */}
      <div className="fixed bottom-4 right-4 z-[100] flex gap-2 rounded-full bg-white/90 p-1 shadow-lg backdrop-blur-sm border border-slate-200">
        <button 
          onClick={() => setUserRole("admin")}
          className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${userRole === "admin" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
        >
          Admin
        </button>
        <button 
          onClick={() => setUserRole("employee")}
          className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${userRole === "employee" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
        >
          Ansatt
        </button>
      </div>

      {userRole === "admin" ? <AdminDashboard /> : <EmployeeDashboard />}
    </>
  );
}
