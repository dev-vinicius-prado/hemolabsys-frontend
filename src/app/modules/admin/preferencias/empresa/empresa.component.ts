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
    EmpresaResponseDTO,
    EmpresaCreateDTO,
    EmpresaUpdateDTO,
} from 'app/core/models/empresa.catalog.types';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { EmpresaDataService } from './services/empresa-data.service';
import { HasRoleDirective } from 'app/shared/directives/has-role.directive';

@Component({
    selector: 'empresa',
    templateUrl: './empresa.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatSnackBarModule,
        MatIconModule,
        HasRoleDirective
    ],
})
export class EmpresaComponent implements OnInit, OnDestroy {
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private empresaDataService = inject(EmpresaDataService);
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

    empresas$: Observable<EmpresaResponseDTO[]> = this.empresaDataService.empresas$;
    selectedIds = new Set<number>();
    formVisible = false;
    viewOnly = false;
    editingId: number | null = null;

    form: {
        razaoSocial: string;
        nomeFantasia: string;
        cnpj: string;
        indMatrizFilial: string;
        idEmpresaMatriz: number | null;
        ativo: boolean;
    } = {
        razaoSocial: '',
        nomeFantasia: '',
        cnpj: '',
        indMatrizFilial: 'M',
        idEmpresaMatriz: null,
        ativo: true,
    };

    constructor() {}

    ngOnInit(): void {
        this.empresaDataService.loadEmpresas();
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
    readonly filteredEmpresas$ = combineLatest([
        this.empresas$.pipe(startWith([])),
        this.search$.pipe(startWith('')),
    ]).pipe(
        map(([empresas, search]) => {
            const s = this.removeAccents(search.trim().toLowerCase());

            return empresas.filter(
                (e) =>
                    this.removeAccents(e.razaoSocial.toLowerCase()).includes(s) ||
                    this.removeAccents(e.nomeFantasia.toLowerCase()).includes(s) ||
                    e.cnpj.includes(s)
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

    novaEmpresa(): void {
        this.viewOnly = false;
        this.editingId = null;
        this.formVisible = true;
        this.form = {
            razaoSocial: '',
            nomeFantasia: '',
            cnpj: '',
            indMatrizFilial: 'M',
            idEmpresaMatriz: null,
            ativo: true,
        };
    }

    editar(empresa: EmpresaResponseDTO): void {
        this.viewOnly = false;
        this.editingId = empresa.id;
        this.formVisible = true;
        this.form = {
            razaoSocial: empresa.razaoSocial,
            nomeFantasia: empresa.nomeFantasia,
            cnpj: empresa.cnpj,
            indMatrizFilial: empresa.indMatrizFilial,
            idEmpresaMatriz: empresa.idEmpresaMatriz ?? null,
            ativo: empresa.ativo,
        };
    }

    visualizar(empresa: EmpresaResponseDTO): void {
        this.viewOnly = true;
        this.editingId = empresa.id;
        this.formVisible = true;
        this.form = {
            razaoSocial: empresa.razaoSocial,
            nomeFantasia: empresa.nomeFantasia,
            cnpj: empresa.cnpj,
            indMatrizFilial: empresa.indMatrizFilial,
            idEmpresaMatriz: empresa.idEmpresaMatriz ?? null,
            ativo: empresa.ativo,
        };
    }

    excluir(empresa: EmpresaResponseDTO): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Excluir Empresa',
            message: `Deseja excluir a empresa NOME: ${empresa.razaoSocial}? <br><b class="text-red-500">Esta ação não pode ser desfeita!</b>`,
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
                this.empresaDataService.deleteEmpresa(empresa.id).subscribe({
                    next: () => {
                        this._snackBar.open('Empresa excluída com sucesso!', 'OK', {
                            duration: 5000,
                            panelClass: ['success-snackbar'],
                        });
                        this.selectedIds.delete(empresa.id);
                    },
                    error: (err) => {
                        this._snackBar.open(`Erro ao excluir empresa: ${err.message}`, 'Fechar', {
                            duration: 5000,
                            panelClass: ['error-snackbar'],
                        });
                    }
                });
            }
        });
    }

    salvar(): void {
        if (this.viewOnly) {
            this.cancelar();
            return;
        }
        const isEdit = this.editingId !== null;

        if (!this.form.razaoSocial || !this.form.cnpj) {
            return;
        }

        const createDto: EmpresaCreateDTO = {
            razaoSocial: this.form.razaoSocial,
            nomeFantasia: this.form.nomeFantasia,
            cnpj: this.form.cnpj,
            indMatrizFilial: this.form.indMatrizFilial,
            idEmpresaMatriz: this.form.idEmpresaMatriz,
            ativo: this.form.ativo,
        };

        if (isEdit) {
            const updateDto: EmpresaUpdateDTO = {
                ...createDto,
                id: this.editingId!,
            };
            this.empresaDataService
                .updateEmpresa(this.editingId!, updateDto)
                .subscribe({
                    next: () => {
                        this._snackBar.open('Empresa atualizada com sucesso!', 'OK', {
                            duration: 5000,
                            panelClass: ['success-snackbar'],
                        });
                        this.cancelar();
                    },
                    error: (err) => {
                        this._snackBar.open(`Erro ao atualizar empresa: ${err.message}`, 'Fechar', {
                            duration: 5000,
                            panelClass: ['error-snackbar'],
                        });
                    }
                });
        } else {
            this.empresaDataService.createEmpresa(createDto).subscribe({
                next: () => {
                    this._snackBar.open('Empresa criada com sucesso!', 'OK', {
                        duration: 5000,
                        panelClass: ['success-snackbar'],
                    });
                    this.cancelar();
                },
                error: (err) => {
                    this._snackBar.open(`Erro ao criar empresa: ${err.message}`, 'Fechar', {
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
            razaoSocial: '',
            nomeFantasia: '',
            cnpj: '',
            indMatrizFilial: 'M',
            idEmpresaMatriz: null,
            ativo: true,
        };
        this._changeDetectorRef.markForCheck();
    }

    exportCsv(): void {
        this._snackBar.open('Funcionalidade de exportação em desenvolvimento', 'OK', { duration: 3000, panelClass: ["success-snackbar"]});
    }
}
