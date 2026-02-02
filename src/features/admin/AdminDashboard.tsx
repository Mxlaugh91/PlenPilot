import { useState, type ReactNode } from "react";
import '../../App.css';

// Import UI Components
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { NewLocationModal } from "./components/NewLocationModal";

// Import Auth
import { useAuth } from "../auth";

/* ── INTERFACES ── */
interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface CardData {
  label: string;
  value: string;
  change: string;
  up: boolean | null;
}

interface TabContentItem {
  title: string;
  subtitle: string;
  cards: CardData[];
}

interface TabContent {
  [key: string]: TabContentItem;
}

interface Sted {
  id: number;
  name: string;
  address: string;
  status: 'ferdig' | 'pågår' | 'planlagt' | string;
  dato: string;
  type: string;
}

interface Service {
  id: number;
  type: string;
  intervall: number;
  timerSiden: number;
  sistUtført: string;
}

interface Klipper {
  id: number;
  navn: string;
  modell: string;
  timer: number;
  services: Service[];
}

/* ── MOCK DATA ── */
const navItems: NavItem[] = [
  { id: "oversikt", label: "Oversikt", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
  { id: "ansatte", label: "Ansatte", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { id: "steder", label: "Steder", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg> },
  { id: "arkiv", label: "Arkiv", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg> },
  { id: "vedlikehold", label: "Vedlikehold", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg> },
  { id: "innstillinger", label: "Innstillinger", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
];

const tabContent: TabContent = {
  oversikt: {
    title: "Oversikt", subtitle: "Hovedoversikt over bedriften", cards: [
      { label: "Totalt ansatte", value: "47", change: "+3 denne mnd", up: true },
      { label: "Aktive steder", value: "12", change: "2 under vedlikehold", up: false },
      { label: "Åpne saker", value: "8", change: "-2 fra forrige uke", up: true },
      { label: "Neste vedlikehold", value: "3 dager", change: "Planlagt 4. feb", up: null },
    ]
  },
  ansatte: {
    title: "Ansatte", subtitle: "Administrer ansatte og tilganger", cards: [
      { label: "Aktive ansatte", value: "44", change: "Fulltid", up: null },
      { label: "Permisjon", value: "3", change: "1 tilbake snart", up: null },
      { label: "Nye denne mnd", value: "2", change: "Onboarding pågår", up: true },
      { label: "Avdelinger", value: "6", change: "Alle bemannet", up: true },
    ]
  },
  steder: { title: "Steder", subtitle: "Lokasjoner og driftssteder", cards: [] },
  arkiv: {
    title: "Arkiv", subtitle: "Dokumenter og historikk", cards: [
      { label: "Dokumenter", value: "1 284", change: "34 nye denne mnd", up: true },
      { label: "Kategorier", value: "18", change: "Alle organisert", up: null },
      { label: "Sist oppdatert", value: "I dag", change: "kl 09:42", up: null },
      { label: "Lagringsbruk", value: "64%", change: "12.8 GB av 20 GB", up: false },
    ]
  },
  vedlikehold: {
    title: "Vedlikehold", subtitle: "Planlegging og oppfølging", cards: [
      { label: "Aktiv gressklipper", value: "5", change: "Alle i drift", up: true },
      { label: "Service forfalt", value: "2", change: "Overskridet intervall", up: false },
      { label: "Timer totalt", value: "1 842", change: "+126 denne mnd", up: null },
    ]
  },
};

const stederData: Sted[] = [
  { id: 1, name: "Frognerparken", address: "Kirkeveien 21, Oslo", status: "ferdig", dato: "Man 3. feb", type: "Park" },
  { id: 2, name: "Ekebergsletta", address: "Kongsveien 10, Oslo", status: "ferdig", dato: "Ons 5. feb", type: "Idrettsanlegg" },
  { id: 3, name: "Tøyenparken", address: "Helgesens gate 90, Oslo", status: "ferdig", dato: "Fre 7. feb", type: "Park" },
  { id: 4, name: "Sofienbergparken", address: "Sofienberggata 2, Oslo", status: "pågår", dato: "Uke 7", type: "Park" },
];

const initialKlippere: Klipper[] = [
  {
    id: 1, navn: "Husqvarna Automower 450X", modell: "450X", timer: 482, services: [
      { id: 1, type: "Oljeskift", intervall: 100, timerSiden: 82, sistUtført: "12. jan 2026" },
      { id: 2, type: "Skifte filter", intervall: 200, timerSiden: 182, sistUtført: "8. nov 2025" },
      { id: 3, type: "Skifte kniver", intervall: 50, timerSiden: 32, sistUtført: "20. jan 2026" },
    ]
  },
  {
    id: 2, navn: "John Deere X350", modell: "X350", timer: 1024, services: [
      { id: 1, type: "Oljeskift", intervall: 100, timerSiden: 124, sistUtført: "28. nov 2025" },
      { id: 2, type: "Skifte kniver", intervall: 50, timerSiden: 50, sistUtført: "28. des 2025" },
    ]
  },
];

/* ── HELPERS ── */
const getServiceColor = (pct: number) => pct >= 100 ? "bg-red-600" : pct >= 80 ? "bg-amber-500" : "bg-green-600";
const getServiceTextColor = (pct: number) => pct >= 100 ? "text-red-600" : pct >= 80 ? "text-amber-600" : "text-green-600";

export function AdminDashboard() {
  // Auth
  const { user, logout } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<string>("oversikt");
  const [stederFilter, setStederFilter] = useState<string>("alle");
  const [showNewSted, setShowNewSted] = useState<boolean>(false);
  const [_showNewKlipper, setShowNewKlipper] = useState<boolean>(false);
  const [klippere, setKlippere] = useState<Klipper[]>(initialKlippere);
  const [expandedKlipper, setExpandedKlipper] = useState<number | null>(null);
  const [addingServiceTo, setAddingServiceTo] = useState<number | null>(null);
  const [newServiceType, setNewServiceType] = useState<string>("");
  const [newServiceIntervall, setNewServiceIntervall] = useState<string>("");
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  const content = tabContent[activeTab] || tabContent.oversikt;
  const filteredSteder = stederFilter === "ferdig" ? stederData.filter((s) => s.status === "ferdig") : stederData;

  const handleResetService = (klipperId: number, serviceId: number) => {
    const today = new Date().toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
    setKlippere(p => p.map(k => k.id === klipperId ? {
      ...k,
      services: k.services.map(s => s.id === serviceId ? { ...s, timerSiden: 0, sistUtført: today } : s)
    } : k));
  };

  const handleAddService = (klipperId: number) => {
    if (!newServiceType || !newServiceIntervall) return;
    setKlippere(p => p.map(k => k.id === klipperId ? {
      ...k,
      services: [...k.services, { id: Date.now(), type: newServiceType, intervall: parseInt(newServiceIntervall), timerSiden: 0, sistUtført: "Ikke utført" }]
    } : k));
    setAddingServiceTo(null); setNewServiceType(""); setNewServiceIntervall("");
  };

  const getKlipperStatusVariant = (k: Klipper): "success" | "warning" | "danger" | "info" => {
    if (!k.services.length) return "info";
    const worst = Math.max(...k.services.map(s => (s.timerSiden / s.intervall) * 100));
    if (worst >= 100) return "danger";
    if (worst >= 80) return "warning";
    return "success";
  };

  const getKlipperStatusText = (k: Klipper): string => {
    if (!k.services.length) return "Ny";
    const worst = Math.max(...k.services.map(s => (s.timerSiden / s.intervall) * 100));
    if (worst >= 100) return "Service forfalt";
    if (worst >= 80) return "Service snart";
    return "OK";
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 font-sans text-slate-900 antialiased pb-24 lg:pb-0">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 font-bold text-white shadow-lg">PP</div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">PlenPilot</h1>
            </div>
            <nav className="hidden h-16 items-center gap-1 lg:flex">
              {navItems.map(n => (
                <button
                  key={n.id}
                  onClick={() => setActiveTab(n.id)}
                  className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all hover:bg-slate-100 ${activeTab === n.id ? "bg-blue-50 text-blue-600" : "text-slate-500"}`}
                >
                  {n.icon}
                  {n.label}
                  {activeTab === n.id && <div className="absolute -bottom-[13px] left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-blue-600" />}
                </button>
              ))}
            </nav>
          </div>
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 font-bold text-white shadow-md cursor-pointer hover:scale-105 transition-transform"
              aria-label="Brukermeny"
              aria-expanded={showUserMenu}
            >
              {user?.displayName?.slice(0, 2).toUpperCase() || "AD"}
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                {/* User Info */}
                <div className="border-b border-slate-100 p-4">
                  <p className="text-sm font-bold text-slate-900">
                    {user?.displayName || "Admin"}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <Badge variant="info" dot={false} className="mt-2">
                    {user?.role === "admin" ? "Administrator" : "Ansatt"}
                  </Badge>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await logout();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <svg
                      className="h-5 w-5"
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
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-10">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">{content.title}</h2>
          <p className="mt-1 text-slate-500 font-medium">{content.subtitle}</p>
        </div>

        {/* TABS SPECIFIC LOGIC */}
        {activeTab === "steder" && (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex rounded-xl bg-slate-200 p-1">
                <button onClick={() => setStederFilter("alle")} className={`rounded-lg px-5 py-1.5 text-sm font-bold transition-all ${stederFilter === "alle" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Alle steder</button>
                <button onClick={() => setStederFilter("ferdig")} className={`rounded-lg px-5 py-1.5 text-sm font-bold transition-all ${stederFilter === "ferdig" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Fullført uke 5</button>
              </div>
              <Button
                onClick={() => setShowNewSted(true)}
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}
              >
                Nytt sted
              </Button>
            </div>
            <div className="space-y-3">
              {filteredSteder.map(st => (
                <Card
                  key={st.id}
                  hoverEffect
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4 sm:gap-0 group hover:translate-x-1"
                >
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[22px] sm:h-[22px]"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm sm:text-base">{st.name}</div>
                      <div className="text-xs sm:text-sm text-slate-500 font-medium">{st.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-10 w-full sm:w-auto pl-[56px] sm:pl-0">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{st.type}</div>
                      <div className="text-sm font-bold text-slate-700">{st.dato}</div>
                    </div>
                    <Badge variant={st.status === "ferdig" ? "success" : st.status === "pågår" ? "warning" : "neutral"}>
                      {st.status.charAt(0).toUpperCase() + st.status.slice(1)}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* DEFAULT CARDS GRID */}
        {activeTab !== "steder" && activeTab !== "vedlikehold" && content.cards.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.cards.map((c, i) => (
              <Card key={i} hoverEffect className="p-4 sm:p-7">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{c.label}</div>
                <div className="mt-2 sm:mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">{c.value}</div>
                <div className="mt-3 sm:mt-5">
                  <Badge variant={c.up === true ? "success" : c.up === false ? "danger" : "neutral"}>
                    {c.change}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* VEDLIKEHOLD SECTION */}
        {activeTab === "vedlikehold" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">Maskinpark</h3>
              <Button onClick={() => setShowNewKlipper(true)}>Legg til maskin</Button>
            </div>

            <div className="grid gap-4">
              {klippere.map(k => {
                const isExpanded = expandedKlipper === k.id;
                return (
                  <div key={k.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 sm:px-8 sm:py-6 hover:bg-slate-50 cursor-pointer gap-4 sm:gap-0" onClick={() => setExpandedKlipper(isExpanded ? null : k.id)}>
                      <div className="flex items-center gap-4 sm:gap-5">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 shrink-0">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm sm:text-base">{k.navn}</div>
                          <div className="text-xs sm:text-sm text-slate-500 font-medium">{k.modell} • {k.services.length} servicer</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-[54px] sm:pl-0">
                        <div className="flex items-center gap-3">
                           <div className="rounded-lg bg-slate-100 px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-bold text-slate-600 whitespace-nowrap">{k.timer} t</div>
                           <Badge variant={getKlipperStatusVariant(k)}>
                             {getKlipperStatusText(k)}
                           </Badge>
                        </div>
                        <svg className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-8 sm:pt-6">
                        <div className="space-y-3">
                          {k.services.map(svc => {
                            const pct = Math.min((svc.timerSiden / svc.intervall) * 100, 100);
                            return (
                              <Card key={svc.id} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 sm:p-5">
                                <div className="w-full sm:w-40 flex-shrink-0 flex justify-between sm:block">
                                  <div className="text-sm font-bold text-slate-900">{svc.type}</div>
                                  <div className="text-[10px] font-bold text-slate-400 mt-0 sm:mt-1 uppercase">Sist: {svc.sistUtført}</div>
                                </div>
                                <div className="flex-1 w-full sm:min-w-[200px]">
                                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                    <div className={`h-full transition-all duration-700 ${getServiceColor(pct)}`} style={{ width: `${pct}%` }} />
                                  </div>
                                  <div className="mt-2 flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                    <span>{svc.timerSiden} / {svc.intervall} timer</span>
                                    <span className={getServiceTextColor(pct)}>{Math.round(pct)}%</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                                  <Button variant="success" size="icon" onClick={() => handleResetService(k.id, svc.id)}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                  </Button>
                                  <Button variant="ghost" size="icon" className="border border-slate-100 bg-white">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                  </Button>
                                </div>
                              </Card>
                            );
                          })}
                        </div>

                        {addingServiceTo === k.id ? (
                          <div className="mt-4 flex flex-col sm:flex-row gap-3 rounded-2xl bg-white p-4 sm:p-6 border border-slate-200 animate-in fade-in slide-in-from-top-2 shadow-sm">
                            <input className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" placeholder="Hva skal gjøres?" value={newServiceType} onChange={e => setNewServiceType(e.target.value)} />
                            <div className="flex gap-3">
                              <input className="flex-1 sm:w-28 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" type="number" placeholder="Timer" value={newServiceIntervall} onChange={e => setNewServiceIntervall(e.target.value)} />
                              <Button onClick={() => handleAddService(k.id)} className="flex-1 sm:flex-none">Lagre</Button>
                              <Button variant="ghost" onClick={() => setAddingServiceTo(null)}>×</Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            className="mt-5 w-full py-4 !rounded-2xl"
                            onClick={() => setAddingServiceTo(k.id)}
                          >
                            + Legg til service-intervall
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PLACEHOLDER */}
        {activeTab !== "oversikt" && activeTab !== "steder" && activeTab !== "vedlikehold" && activeTab !== "ansatte" && (
          <Card className="mt-10 flex h-64 items-center justify-center border-2 border-dashed border-slate-200 bg-transparent shadow-none">
            <span className="font-bold text-slate-400">Denne modulen er under utvikling...</span>
          </Card>
        )}
      </main>

      {/* MOBILE NAV */}
      <nav className="fixed bottom-0 z-50 flex w-full justify-around border-t border-slate-200 bg-white/80 p-3 pb-8 backdrop-blur-md lg:hidden">
        {navItems.slice(0, 5).map(n => (
          <button key={n.id} onClick={() => setActiveTab(n.id)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === n.id ? "text-blue-600" : "text-slate-400"}`}>
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === n.id ? "bg-blue-50" : ""}`}>{n.icon}</div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{n.label}</span>
          </button>
        ))}
      </nav>

      {/* MODAL OVERLAY */}
      <NewLocationModal 
        isOpen={showNewSted} 
        onClose={() => setShowNewSted(false)} 
      />
    </div>
  );
}