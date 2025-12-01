export interface Metric {
    title: string;
    value: string;
    status: string;
    icon: string;
}

export interface Alert {
    message: string;
    details: string;
    statusIcon: string;
}

export interface Product {
    name: string;
    currentQuantity: number;
    minQuantity: number;
    status: string;
    statusIcon: string;
}
