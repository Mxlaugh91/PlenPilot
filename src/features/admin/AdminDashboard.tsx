import { useState } from "react";
import '../../App.css';
import { LayoutGrid, Users, MapPin, Archive, Wrench, Settings } from "lucide-react";

// Import UI Components
import { Card } from "../../components/ui/Card";
import { DashboardLayout } from "../../components/layout/DashboardLayout";

// Import Auth
import { useAuth } from "../auth";

// Import Views
import { AdminOverview } from "./AdminOverview";
import { AdminEmployeeView } from "./AdminEmployeeView";
import { AdminLocationView } from "./AdminLocationView";
import { AdminMaintenanceView } from "./AdminMaintenanceView";
import { AdminSettingsView } from "./AdminSettingsView";

// Import Types
import type { NavItem } from "./types";

/* ── NAVIGATION  ── */
const navItems: NavItem[] = [
  { id: "oversikt", label: "Oversikt", icon: <LayoutGrid size={20} /> },
  { id: "ansatte", label: "Ansatte", icon: <Users size={20} /> },
  { id: "steder", label: "Steder", icon: <MapPin size={20} /> },
  { id: "arkiv", label: "Arkiv", icon: <Archive size={20} /> },
  { id: "vedlikehold", label: "Vedlikehold", icon: <Wrench size={20} /> },
  { id: "innstillinger", label: "Innstillinger", icon: <Settings size={20} /> },
];

// Helper to get titles
const getTabTitle = (tab: string) => {
  switch (tab) {
    case "oversikt": return { title: undefined, subtitle: undefined };
    case "ansatte": return { title: undefined, subtitle: undefined };
    case "steder": return { title: undefined, subtitle: undefined };
    case "vedlikehold": return { title: undefined, subtitle: undefined };
    case "arkiv": return { title: undefined, subtitle: undefined };
    case "innstillinger": return { title: undefined, subtitle: undefined };
    default: return { title: "Oversikt", subtitle: "" };
  }
};

export function AdminDashboard() {
  // Auth
  const { user, logout } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<string>("oversikt");

  const { title, subtitle } = getTabTitle(activeTab);

  return (
    <DashboardLayout
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      logout={logout}
      title={title}
      subtitle={subtitle}
    >

      {/* TABS SPECIFIC LOGIC */}
      {activeTab === "oversikt" && (
        <AdminOverview />
      )}

      {activeTab === "ansatte" && (
        <AdminEmployeeView />
      )}

      {activeTab === "steder" && (
        <AdminLocationView />
      )}

      {activeTab === "vedlikehold" && (
        <AdminMaintenanceView />
      )}

      {activeTab === "innstillinger" && (
        <AdminSettingsView />
      )}

      {/* Placeholder for Arkiv since we didn't make a dedicated view yet, reusing Overview for now or Placeholder */}
      {activeTab === "arkiv" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Arkiv</h1>
              <p className="text-sm text-gray-500 mt-1">Dokumenter og historikk</p>
            </div>
          </div>
          <Card className="flex h-64 items-center justify-center border-2 border-dashed border-slate-200 bg-transparent shadow-none">
            <span className="font-bold text-slate-400">Arkiv-modul kommer snart...</span>
          </Card>
        </div>
      )}

    </DashboardLayout>
  );
}