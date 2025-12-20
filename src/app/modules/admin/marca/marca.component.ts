import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
    inject,
    ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/api/api.service';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { MarcaResponseDTO } from 'app/core/models/marca.catalog.types';

@Component({
    selector: 'marca',
    templateUrl: './marca.component.html',
    styleUrls: ['./marca.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, FormsModule],
})
export class MarcaComponent {

    private readonly api = inject(ApiService);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    // Estado reativo
    private readonly marcasSubject = new BehaviorSubject<MarcaResponseDTO[]>([]);
    readonly marcas$ = this.marcasSubject.asObservable();

    private readonly searchSubject = new BehaviorSubject<string>('');
    readonly filteredMarcas$ = combineLatest([
        this.marcas$,
        this.searchSubject,
    ]).pipe(
        map(([marcas, term]) => {
            const t = term.trim().toLowerCase();
            return t
                ? marcas.filter((m) => m.nome.toLowerCase().includes(t))
                : marcas;
        })
    );

    // Estado UI
    private _searchTerm = '';
    get searchTerm(): string {
        return this._searchTerm;
    }
    set searchTerm(v: string) {
        this._searchTerm = v ?? '';
        this.searchSubject.next(this._searchTerm);
    }
    selectedIds = new Set<number>();
    mode: 'list' | 'create' | 'edit' | 'view' = 'list';
    form: Partial<MarcaResponseDTO> = {};

    ngOnInit(): void {
        this.loadMarcas();
    }

    private loadMarcas(): void {
        this.api.list<MarcaResponseDTO>('marcas').subscribe({
            next: (data) => {
                this.marcasSubject.next(
                    data?.map((x) => ({
                        id: x.id,
                        nome: x.nome,
                        audityInfo: x.audityInfo,
                    })) || []
                );
            },
            error: () => {
                // Fallback simples em caso de API indisponível
                this.marcasSubject.next([
                    { id: 1, nome: 'Acme', audityInfo: 'N/A' },
                    { id: 2, nome: 'Globex', audityInfo: 'N/A' },
                ]);
            },
        });
    }

    novo(): void {
        this.mode = 'create';
        this.form = { id: this.nextId(), nome: '', audityInfo: 'N/A' };
    }

    editar(m: MarcaResponseDTO): void {
        this.mode = 'edit';
        this.form = { ...m };
    }

    visualizar(m: MarcaResponseDTO): void {
        this.mode = 'view';
        this.form = { ...m };
    }

    excluir(m: MarcaResponseDTO): void {
        this.api.remove('marcas', m.id).subscribe({
            next: () => {
                const next = this.marcasSubject.value.filter(
                    (x) => x.id !== m.id
                );
                this.marcasSubject.next(next);
                this.selectedIds.delete(m.id);
            },
            error: () => {
                // Fallback local
                const next = this.marcasSubject.value.filter(
                    (x) => x.id !== m.id
                );
                this.marcasSubject.next(next);
                this.selectedIds.delete(m.id);
            },
        });
    }

    salvar(): void {
        if (!this.form.nome) {
            return;
        }
        const now = new Date();
        const record: MarcaResponseDTO = {
            id: this.form.id ?? this.nextId(),
            nome: this.form.nome,
            audityInfo: this.form.audityInfo,
        };

        const isEdit = this.marcasSubject.value.some((x) => x.id === record.id);

        if (isEdit) {
            this.api
                .update<MarcaResponseDTO>('marcas', record.id, record)
                .subscribe({
                    next: (updated) => {
                        const current = this.marcasSubject.value;
                        const idx = current.findIndex(
                            (x) => x.id === record.id
                        );
                        current[idx] = updated ?? record;
                        this.marcasSubject.next([...current]);
                        this.cancelar();
                    },
                    error: () => {
                        const current = this.marcasSubject.value;
                        const idx = current.findIndex(
                            (x) => x.id === record.id
                        );
                        current[idx] = record;
                        this.marcasSubject.next([...current]);
                        this.cancelar();
                    },
                });
        } else {
            this.api.create<MarcaResponseDTO>('marcas', record).subscribe({
                next: (created) => {
                    const next = [
                        ...this.marcasSubject.value,
                        created ?? record,
                    ];
                    this.marcasSubject.next(next);
                    this.cancelar();
                },
                error: () => {
                    const next = [...this.marcasSubject.value, record];
                    this.marcasSubject.next(next);
                    this.cancelar();
                },
            });
        }
    }

    cancelar(): void {
        this.mode = 'list';
        this.form = {};
        this._changeDetectorRef.markForCheck();
    }

    toggleSelection(id: number, checked: boolean): void {
        if (checked) this.selectedIds.add(id);
        else this.selectedIds.delete(id);
    }

    exportCsv(): void {
        const term = this._searchTerm.trim().toLowerCase();
        const list = this.marcasSubject.value;
        const filtered = term
            ? list.filter((m) => m.nome.toLowerCase().includes(term))
            : list;
        const rows = [
            ['id', 'nome'],
            ...filtered.map((m) => [String(m.id), m.nome]),
        ];
        const csv = rows.map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'marcas.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    private nextId(): number {
        const lastId = this.marcasSubject.value.at(-1)?.id ?? 0;
        return lastId + 1;
    }
}
