import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
    OnInit,
    inject,
    ChangeDetectorRef,
} from '@angular/core';
import { NgForOf, NgIf, DatePipe, CommonModule } from '@angular/common';
import { Metric, Alert, Product } from 'app/core/dashboard/dashboard.types';
import { EstoqueService } from './services/estoque.service';
import { EstoqueLoteResponseDTO } from 'app/core/models/lote.types';
import { EstoqueTotalResponseDTO } from 'app/core/models/estoque.types';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from 'app/core/api/api.service';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';

@Component({
    selector: 'dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgForOf, NgIf, DatePipe, CommonModule, MatIconModule, NgApexchartsModule],
})
export class DashboardComponent implements OnInit {
    private estoqueService = inject(EstoqueService);
    private api = inject(ApiService);
    private cdr = inject(ChangeDetectorRef);

    metrics: any[] = [];
    alerts: Alert[] = [];
    products: Product[] = [];
    pendingApprovalsCount = 0;
    today = new Date();

    chartOptions: ApexOptions = {};

    ngOnInit(): void {
        this._initChart();
        this.loadDashboardData();
    }

    private _initChart(): void {
        this.chartOptions = {
            series: [
                {
                    name: 'Consumo',
                    data: [],
                },
            ],
            chart: {
                height: 350,
                type: 'area',
                toolbar: {
                    show: false,
                },
                fontFamily: 'inherit',
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth',
                width: 2,
            },
            colors: ['#6366f1'],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.5,
                    opacityTo: 0,
                    stops: [0, 90, 100],
                },
            },
            xaxis: {
                type: 'datetime',
                categories: [],
            },
            tooltip: {
                x: {
                    format: 'dd/MM/yy',
                },
            },
        };
    }

    private loadDashboardData(): void {
        // Load Expiring Lots
        this.estoqueService.getAlertasVencimento(30).subscribe({
            next: (lotes: EstoqueLoteResponseDTO[]) => {
                this.alerts = lotes.map(lote => ({
                    message: `${lote.insumoNome}`,
                    details: `Lote ${lote.codigoLote} - Vence em: ${lote.dataValidade}`,
                    statusIcon: 'heroicons_outline:exclamation-triangle'
                }));
                this.cdr.markForCheck();
            }
        });

        // Load Low Stock
        this.estoqueService.getAlertasBaixoEstoque().subscribe({
            next: (items: EstoqueTotalResponseDTO[]) => {
                this.products = items.map(item => ({
                    name: item.insumoNome,
                    currentQuantity: item.quantidadeTotal,
                    minQuantity: item.estoqueMinimo,
                    status: item.status,
                    statusIcon: item.status === 'CRITICO' ? 'heroicons_outline:exclamation-circle' : 'heroicons_outline:information-circle'
                }));
                this.cdr.markForCheck();
            }
        });

        // Load Dashboard Stats (Unified)
        this.estoqueService.getDashboardStats().subscribe({
            next: (stats) => {
                this.metrics = [
                    {
                        title: 'Estoque Total',
                        value: stats.totalInsumos.toString(),
                        label: 'Insumos Ativos',
                        icon: 'heroicons_outline:archive-box',
                        color: 'blue'
                    },
                    {
                        title: 'Alertas Ativos',
                        value: stats.alertasAtivos.toString(),
                        label: 'Vencimentos/Baixa',
                        icon: 'heroicons_outline:bell-alert',
                        color: 'amber'
                    },
                    {
                        title: 'Pendentes de Aprovação',
                        value: stats.pendentesAprovacao.toString(),
                        label: 'Aguardando Coordenador',
                        icon: 'heroicons_outline:clipboard-document-check',
                        color: 'indigo'
                    },
                    {
                        title: 'Consumo Hoje',
                        value: '0', // Could be added to DashboardStatsDTO later
                        label: 'Volume de Saída',
                        icon: 'heroicons_outline:presentation-chart-line',
                        color: 'red'
                    },
                ];
                this.cdr.markForCheck();
            }
        });

        // Load Weekly Consumption
        this.estoqueService.getConsumoSemanal().subscribe({
            next: (data) => {
                if (data && data.length > 0) {
                    const categories = data.map(d => d.data);
                    const seriesData = data.map(d => d.quantidade);

                    this.chartOptions = {
                        ...this.chartOptions,
                        series: [
                            {
                                name: 'Consumo',
                                data: seriesData,
                            },
                        ],
                        xaxis: {
                            ...this.chartOptions.xaxis,
                            categories: categories,
                        },
                    };
                    this.cdr.markForCheck();
                }
            }
        });
    }
}
