import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
    OnInit,
} from '@angular/core';
import { NgForOf } from '@angular/common';
import { Metric, Alert, Product } from 'app/core/dashboard/dashboard.types';

@Component({
    selector: 'dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgForOf],
})
export class DashboardComponent implements OnInit {
    metrics: Metric[] = [];
    alerts: Alert[] = [];
    products: Product[] = [];

    /**
     * Constructor
     */
    constructor() {}

    ngOnInit(): void {
        this.metrics = [
            {
                title: 'Estoque Total',
                value: '1.250 itens',
                status: 'OK',
                icon: '🟢',
            },
            {
                title: 'Itens Críticos',
                value: '15 (Alerta!)',
                status: 'Ação Necessária',
                icon: '🔴',
            },
            {
                title: 'Consumo Hoje',
                value: '120 unid.',
                status: 'Mini-Chart (placeholder)',
                icon: '📈',
            },
        ];

        this.alerts = [
            {
                message: 'Reagente Hemograma: Baixo (5 unid.)',
                details: 'Validade: 10 dias',
                statusIcon: '🔴',
            },
            {
                message: 'Pipetas: Expirado #ABC123',
                details: 'Ação: Descartar',
                statusIcon: '🔴',
            },
        ];

        this.products = [
            {
                name: 'Kit Glic.',
                currentQuantity: 50,
                minQuantity: 20,
                status: 'OK',
                statusIcon: '🟢',
            },
        ];
    }
}
