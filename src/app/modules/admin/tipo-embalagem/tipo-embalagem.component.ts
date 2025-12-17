import { ChangeDetectionStrategy, Component, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';

interface TipoEmbalagem {
    idTipo_embalagem: number;
    descricaoTipoEmbalagem: string;
    dataAtualizacao: Date;
    usuario: number; // id_usuario
}

@Component({
    selector: 'tipo-embalagem',
    templateUrl: './tipo-embalagem.component.html',
    styleUrls: ['./tipo-embalagem.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, FormsModule],
})
export class TipoEmbalagemComponent {
    private readonly usuarioLogadoId = 1;

    // Estado reativo
    tipos$ = new BehaviorSubject<TipoEmbalagem[]>([]);
    searchTerm$ = new BehaviorSubject<string>('');
    searchTerm = '';

    // UI state
    selectedIds = new Set<number>();
    mode: 'list' | 'create' | 'edit' | 'view' = 'list';
    form: Partial<TipoEmbalagem> = {};

    // Lista filtrada
    filteredTipos$ = combineLatest([this.tipos$, this.searchTerm$]).pipe(
        map(([list, term]) => {
            const t = (term ?? '').trim().toLowerCase();
            if (!t) return list;
            return list.filter(x => x.descricaoTipoEmbalagem.toLowerCase().includes(t));
        })
    );

    constructor(private readonly api: ApiService, private _changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.loadTipos();
    }

    private loadTipos(): void {
        this.api.list<TipoEmbalagem>('tipos-embalagem').subscribe({
            next: (data) => {
                const normalized = (data ?? []).map((t: any) => ({
                    idTipo_embalagem: t.idTipo_embalagem ?? t.id ?? t.id_tipo_embalagem,
                    descricaoTipoEmbalagem: t.descricaoTipoEmbalagem ?? t.descricao ?? t.descricao_tipo_embalagem,
                    dataAtualizacao: t.dataAtualizacao ? new Date(t.dataAtualizacao) : new Date(),
                    usuario: t.usuario ?? this.usuarioLogadoId,
                } as TipoEmbalagem));
                this.tipos$.next(normalized);
            },
            error: () => {
                this.tipos$.next([
                    { idTipo_embalagem: 1, descricaoTipoEmbalagem: 'Caixa', dataAtualizacao: new Date(), usuario: this.usuarioLogadoId },
                    { idTipo_embalagem: 2, descricaoTipoEmbalagem: 'Frasco', dataAtualizacao: new Date(), usuario: this.usuarioLogadoId },
                ]);
            }
        });
    }

    novo(): void {
        this.mode = 'create';
        this.form = { idTipo_embalagem: this.nextId(), descricaoTipoEmbalagem: '' };
    }

    editar(t: TipoEmbalagem): void {
        this.mode = 'edit';
        this.form = { ...t };
    }

    visualizar(t: TipoEmbalagem): void {
        this.mode = 'view';
        this.form = { ...t };
    }

    excluir(t: TipoEmbalagem): void {
        this.api.remove('tipos-embalagem', t.idTipo_embalagem).subscribe({
            next: () => {
                const updated = this.tipos$.value.filter(x => x.idTipo_embalagem !== t.idTipo_embalagem);
                this.tipos$.next(updated);
                this.selectedIds.delete(t.idTipo_embalagem);
            },
            error: () => {
                const updated = this.tipos$.value.filter(x => x.idTipo_embalagem !== t.idTipo_embalagem);
                this.tipos$.next(updated);
                this.selectedIds.delete(t.idTipo_embalagem);
            }
        });
    }

    salvar(): void {
        if (!this.form.idTipo_embalagem || !this.form.descricaoTipoEmbalagem) {
            return;
        }
        const now = new Date();
        const record: TipoEmbalagem = {
            idTipo_embalagem: this.form.idTipo_embalagem,
            descricaoTipoEmbalagem: this.form.descricaoTipoEmbalagem,
            dataAtualizacao: now,
            usuario: this.usuarioLogadoId,
        };
        const exists = this.tipos$.value.some(x => x.idTipo_embalagem === record.idTipo_embalagem);
        const op$ = exists
            ? this.api.update('tipos-embalagem', record.idTipo_embalagem, record)
            : this.api.create('tipos-embalagem', record);

        op$.subscribe({
            next: (res: any) => {
                const payload = {
                    idTipo_embalagem: res?.idTipo_embalagem ?? record.idTipo_embalagem,
                    descricaoTipoEmbalagem: res?.descricaoTipoEmbalagem ?? record.descricaoTipoEmbalagem,
                    dataAtualizacao: res?.dataAtualizacao ? new Date(res.dataAtualizacao) : now,
                    usuario: res?.usuario ?? record.usuario,
                } as TipoEmbalagem;
                const list = this.tipos$.value.slice();
                const idx = list.findIndex(x => x.idTipo_embalagem === payload.idTipo_embalagem);
                if (idx > -1) list[idx] = payload; else list.push(payload);
                this.tipos$.next(list);
                this.cancelar();
            },
            error: () => {
                const list = this.tipos$.value.slice();
                const idx = list.findIndex(x => x.idTipo_embalagem === record.idTipo_embalagem);
                if (idx > -1) list[idx] = record; else list.push(record);
                this.tipos$.next(list);
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
        const list = this.tipos$.value.filter(t => t.descricaoTipoEmbalagem.toLowerCase().includes(term));
        const rows = [['idTipo_embalagem', 'descricaoTipoEmbalagem', 'dataAtualizacao', 'usuario'], ...list.map(t => [
            String(t.idTipo_embalagem), t.descricaoTipoEmbalagem, t.dataAtualizacao.toISOString(), String(t.usuario),
        ])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tipos-embalagem.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    private nextId(): number {
        return (this.tipos$.value.at(-1)?.idTipo_embalagem ?? 0) + 1;
    }
}
