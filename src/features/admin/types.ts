export interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

export interface CardData {
    label: string;
    value: string;
    change: string;
    up: boolean | null;
}

export interface TabContentItem {
    title: string;
    subtitle: string;
    cards: CardData[];
}

export interface TabContent {
    [key: string]: TabContentItem;
}

export interface Sted {
    id: number;
    name: string;
    address: string;
    status: 'ferdig' | 'pågår' | 'planlagt' | string;
    dato: string;
    type: string;
}

export interface Service {
    id: number;
    type: string;
    intervall: number;
    timerSiden: number;
    sistUtført: string;
}

export interface Klipper {
    id: number;
    navn: string;
    modell: string;
    timer: number;
    services: Service[];
}

export interface Employee {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Bruker';
    department: string;
    status: 'Aktiv' | 'Inaktiv';
    lastActive: string;
    avatar?: string;
}
