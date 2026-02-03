import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { VERSION } from "../../version";

export function AdminSettingsView() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [autoSchedules, setAutoSchedules] = useState(true);

    return (
        <div className="space-y-6 max-w-4xl">
            {/* General Settings */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Generelt</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-slate-700">Mørk modus</div>
                            <div className="text-sm text-slate-500">Endre utseendet på applikasjonen</div>
                        </div>
                        <Button
                            variant={darkMode ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setDarkMode(!darkMode)}
                        >
                            {darkMode ? "På" : "Av"}
                        </Button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-slate-700">Språk</div>
                            <div className="text-sm text-slate-500">Velg språk for grensesnittet</div>
                        </div>
                        <Badge variant="neutral">Norsk (Bokmål)</Badge>
                    </div>
                </div>
            </Card>

            {/* Notifications */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Varslinger</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-slate-700">Push-varsler</div>
                            <div className="text-sm text-slate-500">Motta varsler om nye oppdrag og meldinger</div>
                        </div>
                        <Button
                            variant={notificationsEnabled ? "success" : "secondary"}
                            size="sm"
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        >
                            {notificationsEnabled ? "Aktiv" : "Deaktivert"}
                        </Button>
                    </div>
                    <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                        <div>
                            <div className="font-medium text-slate-700">E-postvarsler</div>
                            <div className="text-sm text-slate-500">Motta daglige rapporter på e-post</div>
                        </div>
                        <Button variant="outline" size="sm" disabled>Kommer snart</Button>
                    </div>
                </div>
            </Card>

            {/* Automation */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Automasjon</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-slate-700">Automatisk planlegging</div>
                            <div className="text-sm text-slate-500">La systemet foreslå ruter basert på lokasjon</div>
                        </div>
                        <Button
                            variant={autoSchedules ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setAutoSchedules(!autoSchedules)}
                        >
                            {autoSchedules ? "På" : "Av"}
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="flex justify-end pt-4">
                <p className="text-xs text-slate-400">PlenPilot {VERSION}</p>
            </div>
        </div>
    );
}
