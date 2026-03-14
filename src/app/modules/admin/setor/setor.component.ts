import { ChangeDetectionStrategy, Component, ViewEncapsulation, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import { PageableResponse, SetorCreateDTO, SetorResponseDTO, SetorUpdateDTO } from 'app/core/models';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'setor',
    templateUrl: './setor.component.html',
    styleUrls: ['./setor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, FormsModule, MatSnackBarModule],
})
export class SetorComponent {
    // Estado reativo
    setors$ = new BehaviorSubject<SetorResponseDTO[]>([]);
    searchTerm$ = new BehaviorSubject<string>('');
    searchTerm = '';

    // UI state
    selectedIds = new Set<number>();
    mode: 'list' | 'create' | 'edit' | 'view' = 'list';
    form: Partial<SetorCreateDTO & { id?: number }> = {};

    // Lista filtrada
    filteredSetores$ = combineLatest([this.setors$, this.searchTerm$]).pipe(
        map(([list, term]) => {
            const t = (term ?? '').trim().toLowerCase();
            if (!t) return list;
            return list.filter(s => s.nome.toLowerCase().includes(t));
        })
    );

    private readonly _snackBar = inject(MatSnackBar);

    constructor(private readonly api: ApiService, private _changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.loadSetores();
    }

    private loadSetores(): void {
        this.api.get<PageableResponse<SetorResponseDTO>>('setores', { size: 1000 }).subscribe({
            next: (data) => {
                this.setors$.next(data?.content ?? []);
            },
            error: () => {
                this.setors$.next([]);
            }
        });
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
                    const updated = this.setors$.value.filter(x => x.id !== s.id);
                    this.setors$.next(updated);
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
            next: (payload) => {
                this._snackBar.open(`Setor ${isEdit ? 'atualizado' : 'criado'} com sucesso!`, 'OK', {
                    duration: 5000,
                    panelClass: ['success-snackbar'],
                });
                const list = this.setors$.value.slice();
                const idx = list.findIndex(x => x.id === payload.id);
                if (idx > -1) list[idx] = payload; else list.push(payload);
                this.setors$.next(list);
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
