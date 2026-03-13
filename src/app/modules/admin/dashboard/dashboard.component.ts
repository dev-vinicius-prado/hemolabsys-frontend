import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
    OnInit,
    inject,
    ChangeDetectorRef,
} from '@angular/core';
import { NgForOf, NgIf, DatePipe } from '@angular/common';
import { Metric, Alert, Product } from 'app/core/dashboard/dashboard.types';
import { EstoqueService } from './services/estoque.service';
import { EstoqueLoteResponseDTO } from 'app/core/models/lote.types';
import { EstoqueTotalResponseDTO } from 'app/core/models/estoque.types';

@Component({
    selector: 'dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgForOf, NgIf, DatePipe],
})
export class DashboardComponent implements OnInit {
    private estoqueService = inject(EstoqueService);
    private cdr = inject(ChangeDetectorRef);

    metrics: Metric[] = [];
    alerts: Alert[] = [];
    products: Product[] = [];

    constructor() {}

    ngOnInit(): void {
        this.loadDashboardData();
    }

    private loadDashboardData(): void {
        this.estoqueService.getAlertasVencimento(30).subscribe({
            next: (lotes: EstoqueLoteResponseDTO[]) => {
                this.alerts = lotes.map(lote => ({
                    message: `${lote.insumoNome} - Lote ${lote.codigoLote}`,
                    details: `Vence em: ${lote.dataValidade}`,
                    statusIcon: '🔴'
                }));
                this.cdr.markForCheck();
            }
        });

        this.estoqueService.getAlertasBaixoEstoque().subscribe({
            next: (items: EstoqueTotalResponseDTO[]) => {
                this.products = items.map(item => ({
                    name: item.insumoNome,
                    currentQuantity: item.quantidadeTotal,
                    minQuantity: item.estoqueMinimo,
                    status: item.status,
                    statusIcon: item.status === 'CRITICO' ? '🔴' : '🟠'
                }));

                this.updateMetrics(items.length);
                this.cdr.markForCheck();
            }
        });
    }

    private updateMetrics(criticalItemsCount: number): void {
        this.metrics = [
            {
                title: 'Estoque Total',
                value: '---',
                status: 'OK',
                icon: '🟢',
            },
            {
                title: 'Itens Críticos',
                value: `${criticalItemsCount} (Baixo/Crítico)`,
                status: criticalItemsCount > 0 ? 'Ação Necessária' : 'OK',
                icon: criticalItemsCount > 0 ? '🔴' : '🟢',
            },
            {
                title: 'Consumo Hoje',
                value: '---',
                status: 'Atualizado',
                icon: '📈',
            },
        ];
    }
}
