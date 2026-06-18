import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    signal,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FuseAlertComponent } from '@fuse/components/alert';
import { ImportacaoNfeService } from './services/importacao-nfe.service';
import { ImportacaoNfePendencia } from 'app/core/models/importacao-nfe.types';
import { InsumosDataService } from '../insumos/services/insumos-data.service';
import { finalize } from 'rxjs';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NfeValidationDialogComponent } from './dialogs/validation-dialog/validation-dialog.component';
import { QuickInsumoDialogComponent } from './dialogs/quick-insumo-dialog/quick-insumo-dialog.component';

@Component({
    selector: 'importacao-nfe',
    templateUrl: './importacao-nfe.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatTableModule,
        MatTooltipModule,
        MatSelectModule,
        MatFormFieldModule,
        MatDialogModule,
        FuseAlertComponent,
    ],
})
export class ImportacaoNfeComponent implements OnInit {
    private _importacaoService = inject(ImportacaoNfeService);
    private _insumosService = inject(InsumosDataService);
    private _snackBar = inject(MatSnackBar);
    private _dialog = inject(MatDialog);

    // Signals para estado reativo (Angular 17+)
    pendencias = signal<ImportacaoNfePendencia[]>([]);
    isLoading = signal<boolean>(false);
    insumos = signal<any[]>([]); // Simplificado para o exemplo

    displayedColumns: string[] = [
        'numeroNfe',
        'fornecedor',
        'codigoExterno',
        'descricaoExterna',
        'quantidade',
        'validade',
        'acoes',
    ];

    ngOnInit(): void {
        this.carregarPendencias();
        this.carregarInsumos();
    }

    carregarPendencias(): void {
        this.isLoading.set(true);
        this._importacaoService
            .listarPendencias()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe((data) => {
                console.log('Pendências: ', data);
                this.pendencias.set(data);
            });


    }

    carregarInsumos(): void {
        // Carrega insumos para o dropdown de resolução
        this._insumosService.loadInsumos(0, 1000);
        this._insumosService.pagination$.subscribe((page) => {
            if (page) this.insumos.set(page.content);
        });
    }

    onFileUpload(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.isLoading.set(true);

            // Step 1: Pre-Validation
            this._importacaoService.validarNfe(file).subscribe({
                next: (preValidation) => {
                    const dialogRef = this._dialog.open(NfeValidationDialogComponent, {
                        data: preValidation,
                        disableClose: true,
                        width: '500px'
                    });

                    dialogRef.afterClosed().subscribe((confirmed) => {
                        if (confirmed) {
                            this.executarProcessamento(file);
                        } else {
                            this.isLoading.set(false);
                        }
                    });
                },
                error: (err) => {
                    this.isLoading.set(false);
                    const errorMessage = err.error?.message || 'Erro ao validar NF-e';
                    this._snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
                }
            });
        }
    }

    private executarProcessamento(file: File): void {
        this.isLoading.set(true);
        this._importacaoService
            .uploadNfe(file)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (resumo) => {
                    this._snackBar.open(
                        `NF-e ${resumo.numeroNfe} processada: ${resumo.itensProcessados} OK, ${resumo.itensPendentes} Pendentes`,
                        'Fechar',
                        { duration: 5000 }
                    );
                    this.carregarPendencias();
                },
                error: (err) => {
                    console.error('Erro na importação:', err);
                    const errorMessage = err.error?.message || 'Erro inesperado ao importar NF-e';
                    this._snackBar.open(`Falha na importação: ${errorMessage}`, 'Entendido', {
                        duration: 7000,
                        panelClass: ['error-snackbar']
                    });
                },
            });
    }

    resolver(pendencia: ImportacaoNfePendencia, insumoId: number): void {
        if (!insumoId) return;

        this.isLoading.set(true);
        this._importacaoService
            .resolverPendencia(pendencia.id, insumoId)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: () => {
                    this._snackBar.open('Mapeamento De/Para realizado com sucesso!', 'OK');
                    this.carregarPendencias();
                },
                error: (err) => {
                    const errorMessage = err.error?.message || 'Erro ao resolver pendência';
                    this._snackBar.open(`Falha na resolução: ${errorMessage}`, 'Fechar', {
                        duration: 5000
                    });
                },
            });
    }

    cadastrarNovoInsumo(pendencia: ImportacaoNfePendencia): void {
        const dialogRef = this._dialog.open(QuickInsumoDialogComponent, {
            data: { pendencia },
            width: '600px',
            disableClose: true
        });

        dialogRef.afterClosed().subscribe((insumoId) => {
            if (insumoId) {
                // Se o insumo foi cadastrado, resolve a pendência automaticamente
                this.resolver(pendencia, insumoId);
                // Recarrega a lista de insumos para os outros dropdowns
                this.carregarInsumos();
            }
        });
    }
}
