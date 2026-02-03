import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import type { CardData } from "./types";

/* ── MOCK DATA FOR EMPLOYEES ── */
const employeeStats: CardData[] = [
    { label: "Aktive ansatte", value: "44", change: "Fulltid", up: null },
    { label: "Permisjon", value: "3", change: "1 tilbake snart", up: null },
    { label: "Nye denne mnd", value: "2", change: "Onboarding pågår", up: true },
    { label: "Avdelinger", value: "6", change: "Alle bemannet", up: true },
];

export function AdminEmployeeView() {
    return (
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
    );
}
