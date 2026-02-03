import { type ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Badge } from "../ui/Badge";
import type { User } from "../../features/auth";
import { VERSION } from "../../version";

interface NavItem {
    id: string;
    label: string;
    icon: ReactNode;
}

interface DashboardLayoutProps {
    children: ReactNode;
    navItems: NavItem[];
    activeTab: string;
    setActiveTab: (id: string) => void;
    user: User | null;
    logout: () => Promise<void>;
    title: string;
    subtitle?: string;
}

export function DashboardLayout({
    children,
    navItems,
    activeTab,
    setActiveTab,
    user,
    logout,
    title,
    subtitle
}: DashboardLayoutProps) {
    // Mobile menu state (optional, if we want a hamburger menu on mobile top bar later)
    // For now we keep the bottom nav for mobile as per request "Mobilvisning fungerer bra"
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-900 antialiased flex">
            {/* DESKTOP SIDEBAR */}
            <Sidebar navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* DESKTOP TOP BAR */}
                <TopBar user={user} logout={logout} />

                {/* MOBILE HEADER (Keep existing style or simplify) */}
                <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 py-3 lg:hidden flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 font-bold text-white shadow-lg">PP</div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold tracking-tight text-slate-900">PlenPilot</h1>
                            <span className="text-[9px] font-semibold text-slate-400 tracking-wider">{VERSION}</span>
                        </div>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 font-bold text-white shadow-md"
                        >
                            {user?.displayName?.slice(0, 2).toUpperCase() || "AD"}
                        </button>
                        {/* Mobile User Dropdown */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg z-50 p-2">
                                <div className="border-b border-slate-100 p-2 mb-2">
                                    <p className="text-sm font-bold">{user?.displayName}</p>
                                    <Badge variant="info">{user?.role === "admin" ? "Administrator" : "Ansatt"}</Badge>
                                </div>
                                <button
                                    onClick={async () => {
                                        setShowUserMenu(false);
                                        await logout();
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    Logg ut
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto px-4 py-8 lg:p-10 pb-24 lg:pb-10">
                    <div className="w-full">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
                            {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
                        </div>
                        {children}
                    </div>
                </main>

                {/* MOBILE BOTTOM NAV */}
                <nav className="fixed bottom-0 z-50 flex w-full justify-around border-t border-slate-200 bg-white/80 p-3 pb-8 backdrop-blur-md lg:hidden">
                    {navItems.slice(0, 5).map(n => (
                        <button key={n.id} onClick={() => setActiveTab(n.id)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === n.id ? "text-blue-600" : "text-slate-400"}`}>
                            <div className={`p-1.5 rounded-xl transition-all ${activeTab === n.id ? "bg-blue-50" : ""}`}>{n.icon}</div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{n.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
}
