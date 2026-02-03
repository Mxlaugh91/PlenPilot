import { type ReactNode } from "react";
import { VERSION } from "../../version";

interface NavItem {
    id: string;
    label: string;
    icon: ReactNode;
}

interface SidebarProps {
    navItems: NavItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export function Sidebar({ navItems, activeTab, onTabChange }: SidebarProps) {
    return (
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex sticky top-0 h-screen">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-500 font-bold text-white shadow-sm">
                    PP
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold tracking-tight text-slate-900">PlenPilot</span>
                    <span className="text-[10px] font-semibold text-slate-400 tracking-wider">{VERSION}</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3">
                <div className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Menu
                </div>
                <nav className="space-y-1">
                    {navItems.slice(0, 3).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeTab === item.id
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <span className={activeTab === item.id ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}>
                                {item.icon}
                            </span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-8 mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    System
                </div>
                <nav className="space-y-1">
                    {navItems.slice(3).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeTab === item.id
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <span className={activeTab === item.id ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}>
                                {item.icon}
                            </span>
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* User Footer (Optional, currently handled in TopBar but good to have a simple profile here or help link) */}
            <div className="border-t border-slate-200 p-4">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    Help Center
                </button>
            </div>
        </aside>
    );
}
