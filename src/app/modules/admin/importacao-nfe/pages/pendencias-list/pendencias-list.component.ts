import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ImportacaoNfeService } from '../../services/importacao-nfe.service';
import { InsumosDataService } from 'app/modules/admin/insumos/services/insumos-data.service';
import { PendenciaImportacaoResponseDTO } from 'app/core/models';
import { ResolucaoDialogComponent } from '../../components/resolucao-dialog/resolucao-dialog.component';
import { FuseAlertComponent } from '@fuse/components/alert';
import { NotificationService } from 'app/core/services/notification.service';

@Component({
    selector: 'app-pendencias-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatDialogModule,
        MatSelectModule,
        MatFormFieldModule,
        FuseAlertComponent
    ],
    templateUrl: './pendencias-list.component.html'
})
export class PendenciasListComponent implements OnInit {
    private readonly _activatedRoute = inject(ActivatedRoute);
    private readonly _router = inject(Router);
    private readonly _importacaoNfeService = inject(ImportacaoNfeService);
    private readonly _insumosService = inject(InsumosDataService);
    private readonly _dialog = inject(MatDialog);
    private readonly _notificationService = inject(NotificationService);
    private readonly _changeDetectorRef = inject(ChangeDetectorRef);

    importacaoId: number;
    pendencias: PendenciaImportacaoResponseDTO[] = [];
    insumos$ = this._insumosService.insumos$;
    displayedColumns: string[] = ['item', 'produto', 'motivo', 'status', 'acoes'];
    loading: boolean = true;

    // Controle de UI para associação direta
    associandoItemId: number | null = null;
    insumoSelecionadoId: number | null = null;

    ngOnInit(): void {
        this.importacaoId = Number(this._activatedRoute.snapshot.paramMap.get('id'));
        if (this.importacaoId) {
            // Carrega pendências e insumos para associação
            setTimeout(() => {
                this.carregarPendencias();
                this._insumosService.loadInsumos(0, 500); // Carrega lista maior para busca
            });
        } else {
            this._router.navigate(['/importacao-nfe']);
        }
    }

    carregarPendencias(): void {
        this.loading = true;
        this._importacaoNfeService.listarPendencias(this.importacaoId).subscribe({
            next: (pendencias) => {
                this.pendencias = pendencias;
                this.loading = false;
                this._changeDetectorRef.detectChanges();
            },
            error: () => {
                this.loading = false;
                this._notificationService.error('Erro ao carregar pendências.');
            }
        });
    }

    iniciarAssociacao(pendencia: PendenciaImportacaoResponseDTO): void {
        this.associandoItemId = pendencia.id;
        this.insumoSelecionadoId = null;
    }

    cancelarAssociacao(): void {
        this.associandoItemId = null;
        this.insumoSelecionadoId = null;
    }

    confirmarAssociacao(pendencia: PendenciaImportacaoResponseDTO): void {
        if (!this.insumoSelecionadoId) return;

        this.loading = true;
        // Chama a resolução direta com fator de conversão 1 como padrão (pode ser ajustado no futuro se necessário)
        const resolucao = {
            idInsumo: this.insumoSelecionadoId,
            unidadeComercialFornecedor: 'UN', // Valor padrão ou inferido
            fatorConversao: 1
        };

        this._importacaoNfeService.resolverPendencia(pendencia.id, resolucao).subscribe({
            next: () => {
                this._notificationService.success('Insumo associado com sucesso!');
                this.associandoItemId = null;
                this.carregarPendencias();
            },
            error: () => {
                this.loading = false;
                this._notificationService.error('Erro ao associar insumo.');
            }
        });
    }

    resolverNovoInsumo(pendencia: PendenciaImportacaoResponseDTO): void {
        this._dialog.open(ResolucaoDialogComponent, {
            width: '600px',
            data: {
                pendencia,
                modo: 'CRIAR_NOVO' // Passamos o modo para o diálogo preencher o cadastro
            }
        }).afterClosed().subscribe(result => {
            if (result) {
                this.carregarPendencias();
                this._notificationService.success('Novo insumo cadastrado e pendência resolvida!');
            }
        });
    }

    voltar(): void {
        this._router.navigate(['/importacao-nfe']);
    }
}
