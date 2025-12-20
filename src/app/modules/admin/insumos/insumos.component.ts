import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, startWith, tap } from 'rxjs';

import {
    InsumoResponseDTO,
    CreateInsumoDTO,
} from 'app/core/models/insumo.catalog.types';
import { InsumosDataService } from './services/insumos-data.service';
import { DependenciesService } from './services/dependencies.service';

@Component({
    selector: 'insumos',
    templateUrl: './insumos.component.html',
    styleUrls: ['./insumos.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, FormsModule],
})
export class InsumosComponent implements OnInit {
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private insumosDataService = inject(InsumosDataService);
    private dependenciesService = inject(DependenciesService);

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

    readonly fornecedores$ = this.dependenciesService.fornecedores$;
    readonly marcas$ = this.dependenciesService.marcas$;
    readonly almoxarifados$ = this.dependenciesService.almoxarifados$;
    readonly tiposEmbalagem$ = this.dependenciesService.tiposEmbalagem$;
    readonly unidadesMedida$ = this.dependenciesService.unidadesMedida$;

    selectedIds = new Set<number>();
    formVisible = false;
    viewOnly = false;
    editingId: number | null = null;

    form: CreateInsumoDTO = {
        codigo: '',
        descricao: '',
        quantidade: 0,
        loteObrigatorio: false,
    };

    constructor() {}

    ngOnInit(): void {
        this.insumosDataService.loadInsumos();
    }

    // Getters para listas filtradas
    readonly filteredInsumos$ = combineLatest([
        this.insumosDataService.insumos$.pipe(startWith([])),
        this.search$.pipe(startWith('')),
    ]).pipe(
        map(([insumos, search]) => {
            const s = search.trim().toLowerCase();

            return insumos.filter(
                (i) =>
                    i.codigo.toLowerCase().includes(s) ||
                i.descricao.toLowerCase().includes(s) ||
                i.fornecedorName.toLowerCase().includes(s) ||
                i.marcaName.toLowerCase().includes(s) ||
                i.almoxarifadoName.toLowerCase().includes(s) ||
                i.tipoEmbalagemName.toLowerCase().includes(s) ||
                i.unidadeMedidaName.toLowerCase().includes(s)
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

    novoInsumo(): void {
        this.viewOnly = false;
        this.editingId = null;
        this.formVisible = true;
        this.form = {
            codigo: '',
            descricao: '',
            quantidade: 0,
            fornecedorId: undefined,
            marcaId: undefined,
            almoxarifadoId: undefined,
            tipoEmbalagemId: undefined,
            unidadeMedidaId: undefined,
            loteObrigatorio: false,
        };
    }

    editar(insumo: InsumoResponseDTO): void {
        this.viewOnly = false;
        this.editingId = insumo.id;
        this.formVisible = true;
        this.form = {
            codigo: insumo.codigo,
            descricao: insumo.descricao,
            loteObrigatorio: insumo.loteObrigatorio,
            quantidade: insumo.quantidade,
            fornecedorId: insumo.fornecedorId,
            marcaId: insumo.marcaId,
            almoxarifadoId: insumo.almoxarifadoId,
            tipoEmbalagemId: insumo.tipoEmbalagemId,
            unidadeMedidaId: insumo.unidadeMedidaId,
        };
    }

    visualizar(insumo: InsumoResponseDTO): void {
        this.viewOnly = true;
        this.editingId = insumo.id;
        this.formVisible = true;
        this.form = {
            codigo: insumo.codigo,
            descricao: insumo.descricao,
            loteObrigatorio: insumo.loteObrigatorio,
            quantidade: insumo.quantidade,
            fornecedorId: insumo.fornecedorId,
            marcaId: insumo.marcaId,
            almoxarifadoId: insumo.almoxarifadoId,
            tipoEmbalagemId: insumo.tipoEmbalagemId,
            unidadeMedidaId: insumo.unidadeMedidaId,
        };
    }

    excluir(insumo: InsumoResponseDTO): void {
        if (confirm(`Excluir ${insumo.descricao}?`)) {
            this.insumosDataService.deleteInsumo(insumo.id);
            this.selectedIds.delete(insumo.id);
        }
    }

    salvar(): void {
        if (this.viewOnly) {
            this.cancelar();
            return;
        }
        const isEdit = this.editingId !== null;

        const insumoData = {
            codigo: this.form.codigo,
            descricao: this.form.descricao,
            loteObrigatorio: this.form.loteObrigatorio,
            quantidade: this.form.quantidade,
            fornecedorId: this.form.fornecedorId,
            marcaId: this.form.marcaId,
            almoxarifadoId: this.form.almoxarifadoId,
            tipoEmbalagemId: this.form.tipoEmbalagemId,
            unidadeMedidaId: this.form.unidadeMedidaId,
        };

        if (isEdit) {
            const updateDto: CreateInsumoDTO = { ...insumoData };
            this.insumosDataService
            .updateInsumo(this.editingId!, updateDto)
            .subscribe({
                next: () => {
                    this.formVisible = false;
                    this._changeDetectorRef.markForCheck();
                    this.cancelar();
                },
                error: (err) => {
                    console.error('Erro ao atualizar insumo:', err);
                    // Optionally, show an error message to the user
                },
            });
        } else {
            const createDto: CreateInsumoDTO = { ...insumoData };
            this.insumosDataService.createInsumo(createDto).subscribe({
                next: () => {
                    this.formVisible = false;
                    this._changeDetectorRef.markForCheck();
                    this.cancelar();
                },
                error: (err) => {
                    console.error('Erro ao criar insumo:', err);
                    // Optionally, show an error message to the user
                },
            });
}
    }

cancelar(): void {
    this.formVisible = false;
    this.viewOnly = false;
    this.editingId = null;
    this._changeDetectorRef.markForCheck();
}

exportCsv(): void {
    // Lógica de exportação CSV (manter como está, mas usar filteredInsumos$)
    this.filteredInsumos$.subscribe((filtered) => {
        const header = [
            'Código',
            'Descrição',
            'Quantidade',
            'Fornecedor',
            'Marca',
            'Almoxarifado',
            'Tipo Emb.',
            'Unid. Med.',
            'Lote Obrigatório?',
        ];
        const rows = filtered.map((i) => [
            i.codigo,
            i.descricao,
            i.quantidade,
            i.fornecedorName,
            i.marcaName,
            i.almoxarifadoName,
            i.tipoEmbalagemName,
            i.unidadeMedidaName,
            i.loteObrigatorio ? 'Sim' : 'Não',
        ]);
        const csv = [header, ...rows]
        .map((r) =>
            r
        .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
        .join(',')
    )
    .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'insumos.csv';
    a.click();
    URL.revokeObjectURL(url);
});
}

}
