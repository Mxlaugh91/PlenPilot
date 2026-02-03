import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import type { CardData } from "./types";
import { Button } from "../../components/ui/Button";


/* ── MOCK DATA FOR EMPLOYEES ── */
const employeeStats: CardData[] = [
    { label: "Aktive ansatte", value: "44", change: "Fulltid", up: null },
    { label: "Permisjon", value: "3", change: "1 tilbake snart", up: null },
    { label: "Nye denne mnd", value: "2", change: "Onboarding pågår", up: true },
    { label: "Avdelinger", value: "6", change: "Alle bemannet", up: true },
];

export function AdminEmployeeView() {
    return (
        <>
            <div className="mb-8 flex items-center justify-end gap-3">
                <Button
                    variant="secondary"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
                >
                    Eksportliste
                </Button>
                <Button
                    variant="primary"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}
                >
                    Legg til ansatt
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {employeeStats.map((c, i) => (
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
        </>
    );
}
