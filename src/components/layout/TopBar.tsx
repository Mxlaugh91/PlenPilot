
import type { User } from "../../features/auth";

interface TopBarProps {
    user: User | null;
    logout: () => Promise<void>;
}

export function TopBar({ user, logout }: TopBarProps) {
    return (
        <header className="hidden h-16 items-center justify-between border-b border-slate-200 bg-white px-8 lg:flex">
            {/* Search */}
            <div className="flex w-96 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder="Search employees, departments..."
                    className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                {/* Notifications */}
                <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>

                <div className="h-8 w-px bg-slate-200" />

                {/* User Dropdown */}
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                        {user?.displayName?.slice(0, 2).toUpperCase() || "AD"}
                    </div>
                    <div className="text-sm">
                        <p className="font-bold text-slate-900 leading-none">{user?.displayName || "Admin User"}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-500">Admin Console</p>
                            <button onClick={logout} className="text-xs font-semibold text-red-500 hover:underline">Logg ut</button>
                        </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
            </div>
        </header>
    );
}
