import { useState } from "react";
import '../../App.css';

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

/* ── NAVIGATION CONFIG ── */
const navItems: NavItem[] = [
  { id: "oversikt", label: "Oversikt", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
  { id: "ansatte", label: "Ansatte", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { id: "steder", label: "Steder", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg> },
  { id: "arkiv", label: "Arkiv", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg> },
  { id: "vedlikehold", label: "Vedlikehold", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg> },
  { id: "innstillinger", label: "Innstillinger", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
];

// Helper to get titles
const getTabTitle = (tab: string) => {
  switch (tab) {
    case "oversikt": return { title: "Oversikt", subtitle: "Hovedoversikt over bedriften" };
    case "ansatte": return { title: "Ansatte", subtitle: "Administrer ansatte og tilganger" };
    case "steder": return { title: "Steder", subtitle: "Lokasjoner og driftssteder" };
    case "vedlikehold": return { title: "Vedlikehold", subtitle: "Planlegging og oppfølging" };
    case "arkiv": return { title: "Arkiv", subtitle: "Dokumenter og historikk" };
    case "innstillinger": return { title: "Innstillinger", subtitle: "Administrer systemet og dine preferanser" };
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
        <Card className="flex h-64 items-center justify-center border-2 border-dashed border-slate-200 bg-transparent shadow-none">
          <span className="font-bold text-slate-400">Arkiv-modul kommer snart...</span>
        </Card>
      )}

    </DashboardLayout>
  );
}