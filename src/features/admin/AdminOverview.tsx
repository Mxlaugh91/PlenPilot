import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import type { CardData } from "./types";

/* ── MOCK DATA FOR OVERVIEW ── */
const overviewStats: CardData[] = [
    { label: "Totalt ansatte", value: "47", change: "+3 denne mnd", up: true },
    { label: "Aktive steder", value: "12", change: "2 under vedlikehold", up: false },
    { label: "Åpne saker", value: "8", change: "-2 fra forrige uke", up: true },
    { label: "Neste vedlikehold", value: "3 dager", change: "Planlagt 4. feb", up: null },
];

export function AdminOverview() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Oversikt</h1>
                    <p className="text-sm text-gray-500 mt-1">Hovedoversikt over bedriften</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {overviewStats.map((c, i) => (
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
        </div>
    );
}
