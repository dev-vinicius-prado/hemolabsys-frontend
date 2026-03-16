import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
    OnInit,
    inject,
    ChangeDetectorRef,
} from '@angular/core';
import { NgForOf, NgIf, DatePipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Metric, Alert, Product } from 'app/core/dashboard/dashboard.types';
import { EstoqueService } from './services/estoque.service';
import { EstoqueLoteResponseDTO } from 'app/core/models/lote.types';
import { EstoqueTotalResponseDTO } from 'app/core/models/estoque.types';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from 'app/core/api/api.service';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Observable } from 'rxjs';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgForOf, NgIf, DatePipe, CommonModule, MatIconModule, NgApexchartsModule, TranslocoModule],
})
export class DashboardComponent implements OnInit {

    private estoqueService = inject(EstoqueService);
    private api = inject(ApiService);
    private cdr = inject(ChangeDetectorRef);
    private _router = inject(Router);
    private _userService = inject(UserService);

    user$: Observable<User>;
    greeting: string = '';
    metrics: any[] = [];
    alerts: Alert[] = [];
    products: Product[] = [];
    pendingApprovalsCount = 0;
    today = new Date();

    chartOptions: ApexOptions = {};

    ngOnInit(): void {
        this.user$ = this._userService.user$;
        this._updateGreeting();
        this._initChart();
        this.loadDashboardData();
    }

    /**
     * Atualiza a saudação baseada no horário atual
     * @private
     */
    private _updateGreeting(): void {
        const hours = new Date().getHours();
        if (hours < 12) {
            this.greeting = 'BOM_DIA';
        } else if (hours < 18) {
            this.greeting = 'BOA_TARDE';
        } else {
            this.greeting = 'BOA_NOITE';
        }
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

    /**
     * Navegar para a tela de nova entrada
     */
    criarEntrada(): void
    {
        this._router.navigate(['/entradas']);
    }
    /**
     * Navegar para a tela de relatórios
     */
    visualizarRelatorios(): void
    {
        this._router.navigate(['/relatorios']);
    }
}
