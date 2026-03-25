import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { LoteResponseDTO, LoteCreateDTO } from 'app/core/models/lote.types';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { LotesDataService } from './lotes.service';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { HasRoleDirective } from 'app/shared/directives/has-role.directive';
import { DependenciesService } from '../insumos/services/dependencies.service';
import { InsumosDataService } from '../insumos/services/insumos-data.service';

@Component({
    selector: 'app-lotes',
    templateUrl: './lotes.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatSnackBarModule,
        PaginationComponent,
        HasRoleDirective
    ],
})
export class LotesComponent implements OnInit, OnDestroy {
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _lotesDataService = inject(LotesDataService);
    private _dependenciesService = inject(DependenciesService);
    private _insumosDataService = inject(InsumosDataService);
    private _snackBar = inject(MatSnackBar);
    private _fuseConfirmationService = inject(FuseConfirmationService);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    lotes$ = this._lotesDataService.lotes$;
    pagination$ = this._lotesDataService.pagination$;
    fornecedores$ = this._dependenciesService.fornecedores$;
    insumos$ = this._insumosDataService.insumos$;

    currentPage: number = 0;
    pageSize: number = 5;

    mode: 'list' | 'create' | 'edit' | 'view' = 'list';
    selectedLote: LoteResponseDTO | null = null;

    form: LoteCreateDTO = {
        codigoLote: '',
        dataFabricacao: '',
        dataValidade: '',
        quantidadeInicial: 0,
        insumoId: 0,
        fornecedorId: 0,
        numeroNotaFiscal: ''
    };

    ngOnInit(): void {
        this._lotesDataService.loadLotes(this.currentPage, this.pageSize);
        this._dependenciesService.loadFornecedores();
        this._insumosDataService.loadInsumos(0, 100);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this._lotesDataService.loadLotes(this.currentPage, this.pageSize);
    }

    onSizeChange(size: number): void {
        this.pageSize = size;
        this.currentPage = 0;
        this._lotesDataService.loadLotes(this.currentPage, this.pageSize);
    }

    novo(): void {
        this.mode = 'create';
        this.form = {
            codigoLote: '',
            dataFabricacao: '',
            dataValidade: '',
            quantidadeInicial: 0,
            insumoId: 0,
            fornecedorId: 0,
            numeroNotaFiscal: ''
        };
        this._changeDetectorRef.markForCheck();
    }

    editar(lote: LoteResponseDTO): void {
        this.selectedLote = lote;
        this.mode = 'edit';
        this.form = {
            codigoLote: lote.codigoLote,
            dataFabricacao: lote.dataFabricacao,
            dataValidade: lote.dataValidade,
            quantidadeInicial: lote.quantidadeInicial,
            insumoId: lote.insumoId,
            fornecedorId: lote.fornecedorId,
            numeroNotaFiscal: lote.numeroNotaFiscal || ''
        };
        this._changeDetectorRef.markForCheck();
    }

    visualizar(lote: LoteResponseDTO): void {
        this.selectedLote = lote;
        this.mode = 'view';
        this.form = {
            codigoLote: lote.codigoLote,
            dataFabricacao: lote.dataFabricacao,
            dataValidade: lote.dataValidade,
            quantidadeInicial: lote.quantidadeInicial,
            insumoId: lote.insumoId,
            fornecedorId: lote.fornecedorId,
            numeroNotaFiscal: lote.numeroNotaFiscal || ''
        };
        this._changeDetectorRef.markForCheck();
    }

    salvar(): void {
        if (!this.form.codigoLote || !this.form.insumoId || !this.form.fornecedorId) {
            this._snackBar.open('Preencha os campos obrigatórios', 'OK', {
                duration: 3000,
                panelClass: ['error-snackbar'],
            });
            return;
        }

        const request = this.mode === 'create'
            ? this._lotesDataService.createLote(this.form)
            : this._lotesDataService.updateLote(this.selectedLote!.id, this.form);

        request.subscribe({
            next: () => {
                this._snackBar.open(this.mode === 'create' ? 'Lote criado com sucesso!' : 'Lote atualizado com sucesso!', 'OK', {
                    duration: 3000,
                    panelClass: ['success-snackbar'],
                });
                this.cancelar();
            },
            error: (err) => {
                this._snackBar.open('Erro ao salvar lote: ' + (err.error?.message || err.message), 'OK', {
                    duration: 5000,
                    panelClass: ['error-snackbar'],
                });
            }
        });
    }

    toggleStatus(lote: LoteResponseDTO): void {
        this._lotesDataService.toggleStatus(lote.id).subscribe({
            next: () => {
                this._snackBar.open('Status do lote atualizado!', 'OK', {
                    duration: 3000,
                    panelClass: ['success-snackbar'],
                });
            }
        });
    }

    excluir(lote: LoteResponseDTO): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Excluir Lote',
            message: `Deseja excluir o lote NOME: ${lote.codigoLote}? <br><b class="text-red-500">Esta ação não pode ser desfeita!</b>`,
            actions: {
                confirm: {
                    label: 'EXCLUIR',
                    color: 'warn'
                },
                cancel: {
                    label: 'Cancelar'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._lotesDataService.deleteLote(lote.id).subscribe({
                    next: () => {
                        this._snackBar.open('Lote excluído com sucesso!', 'OK', {
                            duration: 3000,
                            panelClass: ['success-snackbar'],
                        });
                    }
                });
            }
        });
    }

    cancelar(): void {
        this.mode = 'list';
        this.selectedLote = null;
        this._changeDetectorRef.markForCheck();
    }
}
