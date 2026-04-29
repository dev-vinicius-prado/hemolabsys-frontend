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
import { MatIconModule } from '@angular/material/icon';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

import { FornecedorResponseDTO, FornecedorCreateDTO, FornecedorUpdateDTO } from 'app/core/models/fornecedor.catalog.types';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FornecedorDataService } from './services/fornecedor-data.service';
import { HasRoleDirective } from 'app/shared/directives/has-role.directive';
import { AuditLog, AuditTimelineComponent } from 'app/shared/components/audit-timeline/audit-timeline.component';
import { ApiService } from 'app/core/api/api.service';

@Component({
    selector: 'fornecedores',
    templateUrl: './fornecedores.component.html',
    styleUrls: ['./fornecedores.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatSnackBarModule,
        MatIconModule,
        HasRoleDirective,
        AuditTimelineComponent,
        NgxMaskDirective,
        NgxMaskPipe
    ],
})
export class FornecedoresComponent implements OnInit, OnDestroy {
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _fornecedorDataService = inject(FornecedorDataService);
    private _apiService = inject(ApiService);
    private _snackBar = inject(MatSnackBar);
    private _fuseConfirmationService = inject(FuseConfirmationService);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Estado reativo para filtros
    private readonly searchSubject = new BehaviorSubject<string>('');

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

    formVisible = false;
    viewOnly = false;
    auditVisible = false;
    editingId: number | null = null;
    selectedFornecedor: FornecedorResponseDTO | null = null;
    auditLogs: AuditLog[] = [];

    form: {
        nome: string;
        cnpj: string;
        ativo: boolean;
    } = {
        nome: '',
        cnpj: '',
        ativo: true,
    };

    constructor() {}

    ngOnInit(): void {
        this._fornecedorDataService.loadFornecedores(0, 1000); // Carrega todos para a lista com filtro local
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
    readonly filteredFornecedores$ = combineLatest([
        this._fornecedorDataService.fornecedores$.pipe(startWith([])),
        this.search$.pipe(startWith('')),
    ]).pipe(
        map(([fornecedores, search]) => {
            const s = this.removeAccents(search.trim().toLowerCase());

            return fornecedores.filter(
                (f) =>
                    this.removeAccents(f.nome.toLowerCase()).includes(s) ||
                    f.cnpj.toLowerCase().includes(s)
            );
        }),
        tap(() => {
            this._changeDetectorRef.markForCheck();
        })
    );

    // Métodos de UI
    novoFornecedor(): void {
        this.viewOnly = false;
        this.editingId = null;
        this.formVisible = true;
        this.form = {
            nome: '',
            cnpj: '',
            ativo: true,
        };
    }

    editar(fornecedor: FornecedorResponseDTO): void {
        this.viewOnly = false;
        this.editingId = fornecedor.id;
        this.formVisible = true;
        this.form = {
            nome: fornecedor.nome,
            cnpj: fornecedor.cnpj,
            ativo: fornecedor.ativo,
        };
    }

    visualizar(fornecedor: FornecedorResponseDTO): void {
        this.viewOnly = true;
        this.editingId = fornecedor.id;
        this.formVisible = true;
        this.form = {
            nome: fornecedor.nome,
            cnpj: fornecedor.cnpj,
            ativo: fornecedor.ativo,
        };
    }

    cancelar(): void {
        this.formVisible = false;
        this.editingId = null;
    }

    salvar(): void {
        if (this.editingId) {
            const updateDTO: FornecedorUpdateDTO = {
                id: this.editingId,
                nome: this.form.nome,
                cnpj: this.form.cnpj,
                ativo: this.form.ativo,
            };

            this._fornecedorDataService.updateFornecedor(this.editingId, updateDTO).subscribe({
                next: () => {
                    this._snackBar.open('Fornecedor atualizado com sucesso!', 'OK', {
                        duration: 3000,
                        panelClass: ['success-snackbar']
                    });
                    this.formVisible = false;
                },
                error: (err) => {
                    this._snackBar.open('Erro ao atualizar fornecedor: ' + (err.error?.message || err.message), 'Fechar', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    });
                }
            });
        } else {
            const createDTO: FornecedorCreateDTO = {
                nome: this.form.nome,
                cnpj: this.form.cnpj,
            };

            this._fornecedorDataService.createFornecedor(createDTO).subscribe({
                next: () => {
                    this._snackBar.open('Fornecedor criado com sucesso!', 'OK', {
                        duration: 3000,
                        panelClass: ['success-snackbar']
                    });
                    this.formVisible = false;
                },
                error: (err) => {
                    this._snackBar.open('Erro ao criar fornecedor: ' + (err.error?.message || err.message), 'Fechar', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    });
                }
            });
        }
    }

    excluir(fornecedor: FornecedorResponseDTO): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Excluir Fornecedor',
            message: `Deseja excluir o fornecedor: ${fornecedor.nome}? <br><b class="text-red-500">Esta ação não pode ser desfeita!</b>`,
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
                this._fornecedorDataService.deleteFornecedor(fornecedor.id).subscribe({
                    next: () => {
                        this._snackBar.open('Fornecedor excluído com sucesso!', 'OK', {
                            duration: 3000,
                            panelClass: ['success-snackbar']
                        });
                    },
                    error: (err) => {
                        this._snackBar.open('Erro ao excluir fornecedor: ' + (err.error?.message || err.message), 'Fechar', {
                            duration: 5000,
                            panelClass: ['error-snackbar']
                        });
                    }
                });
            }
        });
    }

    viewAudit(fornecedor: FornecedorResponseDTO): void {
        this.selectedFornecedor = fornecedor;
        this.auditVisible = true;
        this.auditLogs = [];
        this._changeDetectorRef.markForCheck();

        this._apiService.get<AuditLog[]>(`audit/fornecedor/${fornecedor.id}`).subscribe({
            next: (logs) => {
                this.auditLogs = logs;
                this._changeDetectorRef.markForCheck();
            },
            error: (err) => {
                console.error('Erro ao carregar auditoria', err);
                this._snackBar.open('Erro ao carregar histórico de auditoria', 'Fechar', {
                    duration: 3000,
                    panelClass: ['error-snackbar']
                });
            }
        });
    }

    closeAudit(): void {
        this.auditVisible = false;
        this.selectedFornecedor = null;
        this.auditLogs = [];
    }
}
