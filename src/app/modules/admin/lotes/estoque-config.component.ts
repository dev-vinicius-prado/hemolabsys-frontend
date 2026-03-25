import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { EstoqueInsumoConfigDTO, EstoqueInsumoResponseDTO } from 'app/core/models';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { EstoqueConfigService } from './estoque-config.service';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { HasRoleDirective } from 'app/shared/directives/has-role.directive';
import { DependenciesService } from '../insumos/services/dependencies.service';
import { InsumosDataService } from '../insumos/services/insumos-data.service';

@Component({
    selector: 'app-estoque-config',
    templateUrl: './estoque-config.component.html',
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
export class EstoqueConfigComponent implements OnInit, OnDestroy {
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _estoqueConfigService = inject(EstoqueConfigService);
    private _dependenciesService = inject(DependenciesService);
    private _insumosDataService = inject(InsumosDataService);
    private _snackBar = inject(MatSnackBar);
    private _fuseConfirmationService = inject(FuseConfirmationService);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    configs$ = this._estoqueConfigService.configs$;
    pagination$ = this._estoqueConfigService.pagination$;
    almoxarifados$ = this._dependenciesService.almoxarifados$;
    insumos$ = this._insumosDataService.insumos$;

    currentPage: number = 0;
    pageSize: number = 5;

    mode: 'list' | 'create' | 'edit' = 'list';
    selectedConfig: EstoqueInsumoResponseDTO | null = null;

    form: EstoqueInsumoConfigDTO = {
        almoxarifadoId: 0,
        insumoId: 0,
        estoqueMinimo: 0,
        estoqueMaximo: 0,
        localizacao: ''
    };

    ngOnInit(): void {
        this._estoqueConfigService.loadConfigs(this.currentPage, this.pageSize);
        this._dependenciesService.loadAlmoxarifados();
        this._insumosDataService.loadInsumos(0, 100);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this._estoqueConfigService.loadConfigs(this.currentPage, this.pageSize);
    }

    onSizeChange(size: number): void {
        this.pageSize = size;
        this.currentPage = 0;
        this._estoqueConfigService.loadConfigs(this.currentPage, this.pageSize);
    }

    novo(): void {
        this.mode = 'create';
        this.form = {
            almoxarifadoId: 0,
            insumoId: 0,
            estoqueMinimo: 0,
            estoqueMaximo: 0,
            localizacao: ''
        };
        this._changeDetectorRef.markForCheck();
    }

    editar(config: EstoqueInsumoResponseDTO): void {
        this.selectedConfig = config;
        this.mode = 'edit';
        this.form = {
            almoxarifadoId: config.almoxarifadoId,
            insumoId: config.insumoId,
            estoqueMinimo: config.estoqueMinimo,
            estoqueMaximo: config.estoqueMaximo || 0,
            localizacao: config.localizacao || ''
        };
        this._changeDetectorRef.markForCheck();
    }

    salvar(): void {
        if (!this.form.almoxarifadoId || !this.form.insumoId || this.form.estoqueMinimo === null) {
            this._snackBar.open('Preencha os campos obrigatórios', 'OK', {
                duration: 3000,
                panelClass: ['error-snackbar'],
            });
            return;
        }

        this._estoqueConfigService.saveConfig(this.form).subscribe({
            next: () => {
                this._snackBar.open('Meta de estoque salva com sucesso!', 'OK', {
                    duration: 3000,
                    panelClass: ['success-snackbar'],
                });
                this.cancelar();
            },
            error: (err) => {
                this._snackBar.open('Erro ao salvar meta: ' + (err.error?.message || err.message), 'OK', {
                    duration: 5000,
                    panelClass: ['error-snackbar'],
                });
            }
        });
    }

    excluir(config: EstoqueInsumoResponseDTO): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Excluir Meta de Estoque',
            message: `Deseja excluir a meta para o insumo NOME: ${config.insumoNome} no almoxarifado ${config.almoxarifadoNome}? <br><b class="text-red-500">Esta ação não pode ser desfeita!</b>`,
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
                this._estoqueConfigService.deleteConfig(config.id).subscribe({
                    next: () => {
                        this._snackBar.open('Meta excluída com sucesso!', 'OK', {
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
        this.selectedConfig = null;
        this._changeDetectorRef.markForCheck();
    }
}
