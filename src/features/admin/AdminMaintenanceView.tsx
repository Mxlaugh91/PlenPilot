import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import type { Klipper } from "./types";
import { Columns } from "lucide-react";

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

const getServiceColor = (pct: number) => pct >= 100 ? "bg-red-600" : pct >= 80 ? "bg-amber-500" : "bg-green-600";
const getServiceTextColor = (pct: number) => pct >= 100 ? "text-red-600" : pct >= 80 ? "text-amber-600" : "text-green-600";

export function AdminMaintenanceView() {
    const [klippere, setKlippere] = useState<Klipper[]>(initialKlippere);
    const [expandedKlipper, setExpandedKlipper] = useState<number | null>(null);
    const [addingServiceTo, setAddingServiceTo] = useState<number | null>(null);
    const [newServiceType, setNewServiceType] = useState<string>("");
    const [newServiceIntervall, setNewServiceIntervall] = useState<string>("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_showNewKlipper, setShowNewKlipper] = useState<boolean>(false);

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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vedlikehold</h1>
                    <p className="text-sm text-gray-500 mt-1">Planlegging og oppfølging</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button onClick={() => setShowNewKlipper(true)} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}>
                        Legg til maskin
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {klippere.map(k => {
                    const isExpanded = expandedKlipper === k.id;
                    return (
                        <div key={k.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 sm:px-8 sm:py-6 hover:bg-slate-50 cursor-pointer gap-4 sm:gap-0" onClick={() => setExpandedKlipper(isExpanded ? null : k.id)}>
                                <div className="flex items-center gap-4 sm:gap-5">
                                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 shrink-0">
                                        <Columns className="size-5 sm:size-6" />
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
    );
}
