import { ChangeDetectionStrategy, Component, ViewEncapsulation, ChangeDetectorRef, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import { PageableResponse, SetorCreateDTO, SetorResponseDTO, SetorUpdateDTO } from 'app/core/models';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';

@Component({
    selector: 'setor',
    templateUrl: './setor.component.html',
    styleUrls: ['./setor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, FormsModule, MatSnackBarModule, PaginationComponent],
})
export class SetorComponent implements OnInit, OnDestroy {
    // Estado reativo
    setors$ = new BehaviorSubject<SetorResponseDTO[]>([]);
    pagination$ = new BehaviorSubject<PageableResponse<SetorResponseDTO> | null>(null);
    searchTerm$ = new BehaviorSubject<string>('');
    searchTerm = '';

    // UI state
    selectedIds = new Set<number>();
    mode: 'list' | 'create' | 'edit' | 'view' = 'list';
    form: Partial<SetorCreateDTO & { id?: number }> = {};

    currentPage: number = 0;
    pageSize: number = 10;

    // Lista filtrada
    filteredSetores$ = combineLatest([this.setors$, this.searchTerm$]).pipe(
        map(([list, term]) => {
            const t = (term ?? '').trim().toLowerCase();
            if (!t) return list;
            return list.filter(s => s.nome.toLowerCase().includes(t));
        })
    );

    private readonly _snackBar = inject(MatSnackBar);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private readonly api: ApiService, private _changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.loadSetores();
    }

    private loadSetores(): void {
        const params = {
            page: this.currentPage,
            size: this.pageSize,
            sort: 'nome,asc'
        };

        this.api.get<PageableResponse<SetorResponseDTO>>('setores', params).subscribe({
            next: (data) => {
                this.setors$.next(data?.content ?? []);
                this.pagination$.next(data);
                this._changeDetectorRef.markForCheck();
            },
            error: () => {
                this.setors$.next([]);
                this.pagination$.next(null);
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.loadSetores();
    }

    onSizeChange(size: number): void {
        this.pageSize = size;
        this.currentPage = 0;
        this.loadSetores();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    novo(): void {
        this.mode = 'create';
        this.form = { ativo: true, empresaId: 1, nome: '', descricao: '' };
    }

    editar(s: SetorResponseDTO): void {
        this.mode = 'edit';
        this.form = { ...s };
    }

    visualizar(s: SetorResponseDTO): void {
        this.mode = 'view';
        this.form = { ...s };
    }

    excluir(s: SetorResponseDTO): void {
        if (confirm(`Excluir setor ${s.nome}?`)) {
            this.api.remove('setores', s.id).subscribe({
                next: () => {
                    this._snackBar.open('Setor excluído com sucesso!', 'OK', {
                        duration: 5000,
                        panelClass: ['success-snackbar'],
                    });
                    this.loadSetores();
                    this.selectedIds.delete(s.id);
                },
                error: (err) => {
                    this._snackBar.open(`Erro ao excluir setor: ${err.message}`, 'Fechar', {
                        duration: 5000,
                        panelClass: ['error-snackbar'],
                    });
                }
            });
        }
    }

    salvar(): void {
        if (!this.form.nome || !this.form.empresaId) {
            return;
        }
        const isEdit = this.mode === 'edit' && !!this.form.id;

        const createDto: SetorCreateDTO = {
            ativo: this.form.ativo ?? true,
            descricao: this.form.descricao,
            empresaId: this.form.empresaId,
            nome: this.form.nome,
        };

        const op$ = isEdit
            ? this.api.update<SetorResponseDTO>('setores', this.form.id!, {
                ...createDto,
                id: this.form.id!,
            } as SetorUpdateDTO)
            : this.api.create<SetorResponseDTO>('setores', createDto);

        op$.subscribe({
            next: () => {
                this._snackBar.open(`Setor ${isEdit ? 'atualizado' : 'criado'} com sucesso!`, 'OK', {
                    duration: 5000,
                    panelClass: ['success-snackbar'],
                });
                this.loadSetores();
                this.cancelar();
            },
            error: (err) => {
                this._snackBar.open(`Erro ao salvar setor: ${err.message}`, 'Fechar', {
                    duration: 5000,
                    panelClass: ['error-snackbar'],
                });
            }
        });
    }

    cancelar(): void {
        this.mode = 'list';
        this.form = {};
        this._changeDetectorRef.markForCheck();
    }

    toggleSelection(id: number, checked: boolean): void {
        if (checked) this.selectedIds.add(id); else this.selectedIds.delete(id);
    }

    exportCsv(): void {
        const term = this.searchTerm.trim().toLowerCase();
        const list = this.setors$.value.filter(s => s.nome.toLowerCase().includes(term));
        const rows = [['id', 'nome', 'empresaId', 'ativo'], ...list.map(s => [
            String(s.id), s.nome, String(s.empresaId), String(s.ativo),
        ])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'setores.csv';
        a.click();
        URL.revokeObjectURL(url);
    }
}
