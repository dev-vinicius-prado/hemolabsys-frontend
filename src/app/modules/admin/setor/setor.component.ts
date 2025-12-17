import { ChangeDetectionStrategy, Component, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';

interface Setor {
    idSetor: number;
    nomeSetor: string;
    dataAtualizacao: Date;
    usuario: number; // id_usuario
}

@Component({
    selector: 'setor',
    templateUrl: './setor.component.html',
    styleUrls: ['./setor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, FormsModule],
})
export class SetorComponent {
    private readonly usuarioLogadoId = 1;

    // Estado reativo
    setors$ = new BehaviorSubject<Setor[]>([]);
    searchTerm$ = new BehaviorSubject<string>('');
    searchTerm = '';

    // UI state
    selectedIds = new Set<number>();
    mode: 'list' | 'create' | 'edit' | 'view' = 'list';
    form: Partial<Setor> = {};

    // Lista filtrada
    filteredSetores$ = combineLatest([this.setors$, this.searchTerm$]).pipe(
        map(([list, term]) => {
            const t = (term ?? '').trim().toLowerCase();
            if (!t) return list;
            return list.filter(s => s.nomeSetor.toLowerCase().includes(t));
        })
    );

    constructor(private readonly api: ApiService, private _changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.loadSetores();
    }

    private loadSetores(): void {
        this.api.list<Setor>('setores').subscribe({
            next: (data) => {
                // Garantir campos esperados
                const normalized = (data ?? []).map((s: any) => ({
                    idSetor: s.idSetor ?? s.id ?? s.id_setor,
                    nomeSetor: s.nomeSetor ?? s.nome ?? s.nome_setor,
                    dataAtualizacao: s.dataAtualizacao ? new Date(s.dataAtualizacao) : new Date(),
                    usuario: s.usuario ?? this.usuarioLogadoId,
                } as Setor));
                this.setors$.next(normalized);
            },
            error: () => {
                // Fallback local (mantém experiência)
                this.setors$.next([
                    { idSetor: 1, nomeSetor: 'Hemocentro', dataAtualizacao: new Date(), usuario: this.usuarioLogadoId },
                    { idSetor: 2, nomeSetor: 'Laboratório', dataAtualizacao: new Date(), usuario: this.usuarioLogadoId },
                ]);
            }
        });
    }

    novo(): void {
        this.mode = 'create';
        this.form = { idSetor: this.nextId(), nomeSetor: '' };
    }

    editar(s: Setor): void {
        this.mode = 'edit';
        this.form = { ...s };
    }

    visualizar(s: Setor): void {
        this.mode = 'view';
        this.form = { ...s };
    }

    excluir(s: Setor): void {
        this.api.remove('setores', s.idSetor).subscribe({
            next: () => {
                const updated = this.setors$.value.filter(x => x.idSetor !== s.idSetor);
                this.setors$.next(updated);
                this.selectedIds.delete(s.idSetor);
            },
            error: () => {
                const updated = this.setors$.value.filter(x => x.idSetor !== s.idSetor);
                this.setors$.next(updated);
                this.selectedIds.delete(s.idSetor);
            }
        });
    }

    salvar(): void {
        if (!this.form.idSetor || !this.form.nomeSetor) {
            return;
        }
        const now = new Date();
        const record: Setor = {
            idSetor: this.form.idSetor,
            nomeSetor: this.form.nomeSetor,
            dataAtualizacao: now,
            usuario: this.usuarioLogadoId,
        };
        const exists = this.setors$.value.some(x => x.idSetor === record.idSetor);
        const op$ = exists
            ? this.api.update('setores', record.idSetor, record)
            : this.api.create('setores', record);

        op$.subscribe({
            next: (res: any) => {
                const payload = {
                    idSetor: res?.idSetor ?? record.idSetor,
                    nomeSetor: res?.nomeSetor ?? record.nomeSetor,
                    dataAtualizacao: res?.dataAtualizacao ? new Date(res.dataAtualizacao) : now,
                    usuario: res?.usuario ?? record.usuario,
                } as Setor;
                const list = this.setors$.value.slice();
                const idx = list.findIndex(x => x.idSetor === payload.idSetor);
                if (idx > -1) list[idx] = payload; else list.push(payload);
                this.setors$.next(list);
                this.cancelar();
            },
            error: () => {
                const list = this.setors$.value.slice();
                const idx = list.findIndex(x => x.idSetor === record.idSetor);
                if (idx > -1) list[idx] = record; else list.push(record);
                this.setors$.next(list);
                this.cancelar();
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
        const list = this.setors$.value.filter(s => s.nomeSetor.toLowerCase().includes(term));
        const rows = [['idSetor', 'nomeSetor', 'dataAtualizacao', 'usuario'], ...list.map(s => [
            String(s.idSetor), s.nomeSetor, s.dataAtualizacao.toISOString(), String(s.usuario),
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

    private nextId(): number {
        return (this.setors$.value.at(-1)?.idSetor ?? 0) + 1;
    }
}
