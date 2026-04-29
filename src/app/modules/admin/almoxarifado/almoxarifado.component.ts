import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable, startWith, Subject, tap } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from "@angular/material/icon";

import {
    AlmoxarifadoResponseDTO,
    AlmoxarifadoCreateDTO,
    AlmoxarifadoUpdateDTO,
    TipoServico,
} from 'app/core/models/almoxarifado-catalog.types';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AlmoxarifadoDataService } from './services/almoxarifado-data.service';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { PageableResponse } from 'app/core/models';
import { HasRoleDirective } from 'app/shared/directives/has-role.directive';
import { AuditLog, AuditTimelineComponent } from 'app/shared/components/audit-timeline/audit-timeline.component';
import { ApiService } from 'app/core/api/api.service';

@Component({
    selector: 'almoxarifado',
    templateUrl: './almoxarifado.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatSnackBarModule,
        PaginationComponent,
        MatIconModule,
        HasRoleDirective,
        AuditTimelineComponent
    ],
})
export class AlmoxarifadoComponent implements OnInit, OnDestroy {
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private almoxarifadoDataService = inject(AlmoxarifadoDataService);
    private _apiService = inject(ApiService);
    private _snackBar = inject(MatSnackBar);
    private _fuseConfirmationService = inject(FuseConfirmationService);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Estado reativo para filtros
    private readonly searchSubject = new BehaviorSubject<string>('');

    pagination$: Observable<PageableResponse<AlmoxarifadoResponseDTO> | null> = this.almoxarifadoDataService.pagination$;

    currentPage: number = 0;
    pageSize: number = 5;

    // Estado UI
    _search = '';
    get search(): string {
        return this._search;
    }
    set search(v: string) {
        this._search = v ?? '';
        this.searchSubject.next(this._search);
    }
    readonly search$ = this.searchSubject.asObservable();

    selectedIds = new Set<number>();
    formVisible = false;
    viewOnly = false;
    auditVisible = false;
    editingId: number | null = null;
    selectedAlmoxarifado: AlmoxarifadoResponseDTO | null = null;
    auditLogs: AuditLog[] = [];

    form: {
        codigo: string;
        descricao: string;
        tipo: TipoServico;
        empresaId: number;
    } = {
        codigo: '',
        descricao: '',
        tipo: 'ALMOXARIFADO',
        empresaId: 1, // Default para a empresa do usuário (deve ser dinâmico no futuro)
    };

    constructor() {}

    ngOnInit(): void {
        this.almoxarifadoDataService.loadAlmoxarifados(this.currentPage, this.pageSize);
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.almoxarifadoDataService.loadAlmoxarifados(this.currentPage, this.pageSize);
    }

    onSizeChange(size: number): void {
        this.pageSize = size;
        this.currentPage = 0;
        this.almoxarifadoDataService.loadAlmoxarifados(this.currentPage, this.pageSize);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // Normaliza a string removendo acentos
    private removeAccents = (str: string) => {
        if (!str) return '';
        return str.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    };

    // Getters para listas filtradas
    readonly filteredAlmoxarifados$ = combineLatest([
        this.almoxarifadoDataService.almoxarifados$.pipe(startWith([])),
        this.search$.pipe(startWith('')),
    ]).pipe(
        map(([almoxarifados, search]) => {
            const s = this.removeAccents(search.trim().toLowerCase());

            return almoxarifados.filter(
                (a) =>
                    a.codigo.toLowerCase().includes(s) ||
                    this.removeAccents(a.descricao.toLowerCase()).includes(s) ||
                    this.removeAccents((a.tipo ?? '').toLowerCase()).includes(s)
            );
        }),
        tap(() => {
            this._changeDetectorRef.markForCheck();
        })
    );

    // Métodos de UI
    toggleSelect(id: number): void {
        if (this.selectedIds.has(id)) {
            this.selectedIds.delete(id);
        } else {
            this.selectedIds.add(id);
        }
    }

    novoAlmoxarifado(): void {
        this.viewOnly = false;
        this.editingId = null;
        this.formVisible = true;
        this.form = {
            codigo: '',
            descricao: '',
            tipo: 'ALMOXARIFADO',
            empresaId: 1,
        };
    }

    editar(almoxarifado: AlmoxarifadoResponseDTO): void {
        this.viewOnly = false;
        this.editingId = almoxarifado.id;
        this.formVisible = true;
        this.form = {
            codigo: almoxarifado.codigo,
            descricao: almoxarifado.descricao,
            tipo: almoxarifado.tipo,
            empresaId: almoxarifado.empresaId,
        };
    }

    visualizar(almoxarifado: AlmoxarifadoResponseDTO): void {
        this.viewOnly = true;
        this.editingId = almoxarifado.id;
        this.formVisible = true;
        this.form = {
            codigo: almoxarifado.codigo,
            descricao: almoxarifado.descricao,
            tipo: almoxarifado.tipo,
            empresaId: almoxarifado.empresaId,
        };
    }

    excluir(almoxarifado: AlmoxarifadoResponseDTO): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Excluir Almoxarifado',
            message: `Deseja excluir o almoxarifado NOME: ${almoxarifado.descricao}? <br><b class="text-red-500">Esta ação não pode ser desfeita!</b>`,
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
                this.almoxarifadoDataService.deleteAlmoxarifado(almoxarifado.id).subscribe({
                    next: () => {
                        this._snackBar.open('Almoxarifado excluído com sucesso!', 'OK', {
                            duration: 5000,
                            panelClass: ['success-snackbar'],
                        });
                        this.selectedIds.delete(almoxarifado.id);
                    },
                    error: (err) => {
                        this._snackBar.open(`Erro ao excluir almoxarifado: ${err.message}`, 'Fechar', {
                            duration: 5000,
                            panelClass: ['error-snackbar'],
                        });
                    }
                });
            }
        });
    }

    viewAudit(almoxarifado: AlmoxarifadoResponseDTO): void {
        this.selectedAlmoxarifado = almoxarifado;
        this.auditVisible = true;
        this.auditLogs = [];
        this._changeDetectorRef.markForCheck();

        this._apiService.get<AuditLog[]>(`audit/almoxarifado/${almoxarifado.id}`).subscribe({
            next: (logs) => {
                this.auditLogs = logs;
                this._changeDetectorRef.markForCheck();
            },
            error: (err) => {
                this._snackBar.open('Erro ao carregar logs de auditoria', 'Fechar', {
                    duration: 5000,
                    panelClass: ['error-snackbar'],
                });
                this.auditVisible = false;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    closeAudit(): void {
        this.auditVisible = false;
        this.selectedAlmoxarifado = null;
        this.auditLogs = [];
        this._changeDetectorRef.markForCheck();
    }

    salvar(): void {
        if (this.viewOnly) {
            this.cancelar();
            return;
        }
        const isEdit = this.editingId !== null;

        if (!this.form.codigo || !this.form.descricao || !this.form.tipo) {
            return;
        }

        const createDto: AlmoxarifadoCreateDTO = {
            codigo: this.form.codigo,
            descricao: this.form.descricao,
            tipo: this.form.tipo,
            empresaId: this.form.empresaId,
        };

        if (isEdit) {
            const updateDto: AlmoxarifadoUpdateDTO = {
                ...createDto,
                id: this.editingId!,
                auditInfo: `Alteração realizada por usuário logado` // Idealmente viria de um campo ou serviço
            };
            this.almoxarifadoDataService
                .updateAlmoxarifado(this.editingId!, updateDto)
                .subscribe({
                    next: () => {
                        this._snackBar.open('Almoxarifado atualizado com sucesso!', 'OK', {
                            duration: 5000,
                            panelClass: ['success-snackbar'],
                        });
                        this.cancelar();
                    },
                    error: (err) => {
                        this._snackBar.open(`Erro ao atualizar almoxarifado: ${err.message}`, 'Fechar', {
                            duration: 5000,
                            panelClass: ['error-snackbar'],
                        });
                    }
                });
        } else {
            this.almoxarifadoDataService.createAlmoxarifado(createDto).subscribe({
                next: () => {
                    this._snackBar.open('Almoxarifado criado com sucesso!', 'OK', {
                        duration: 5000,
                        panelClass: ['success-snackbar'],
                    });
                    this.cancelar();
                },
                error: (err) => {
                    this._snackBar.open(`Erro ao criar almoxarifado: ${err.message}`, 'Fechar', {
                        duration: 5000,
                        panelClass: ['error-snackbar'],
                    });
                }
            });
        }
    }

    cancelar(): void {
        this.formVisible = false;
        this.viewOnly = false;
        this.editingId = null;
        this.form = {
            codigo: '',
            descricao: '',
            tipo: 'ALMOXARIFADO',
            empresaId: 1,
        };
        this._changeDetectorRef.markForCheck();
    }

    exportCsv(): void {
        // Implementar exportação se necessário
        this._snackBar.open('Funcionalidade de exportação em desenvolvimento', 'OK', { duration: 3000, panelClass: ["success-snackbar"]});
    }
}
