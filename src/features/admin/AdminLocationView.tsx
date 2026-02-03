import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { NewLocationModal } from "./components/NewLocationModal";
import type { Sted } from "./types";

const stederData: Sted[] = [
    { id: 1, name: "Frognerparken", address: "Kirkeveien 21, Oslo", status: "ferdig", dato: "Man 3. feb", type: "Park" },
    { id: 2, name: "Ekebergsletta", address: "Kongsveien 10, Oslo", status: "ferdig", dato: "Ons 5. feb", type: "Idrettsanlegg" },
    { id: 3, name: "Tøyenparken", address: "Helgesens gate 90, Oslo", status: "ferdig", dato: "Fre 7. feb", type: "Park" },
    { id: 4, name: "Sofienbergparken", address: "Sofienberggata 2, Oslo", status: "pågår", dato: "Uke 7", type: "Park" },
];

export function AdminLocationView() {
    const [stederFilter, setStederFilter] = useState<string>("alle");
    const [showNewSted, setShowNewSted] = useState<boolean>(false);

    const filteredSteder = stederFilter === "ferdig" ? stederData.filter((s) => s.status === "ferdig") : stederData;

    return (
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

            <NewLocationModal
                isOpen={showNewSted}
                onClose={() => setShowNewSted(false)}
            />
        </>
    );
}
