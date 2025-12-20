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
import {
    AlmoxarifadoResponseDTO,
    FornecedorResponseDTO,
} from 'app/core/models';
import { BehaviorSubject, combineLatest, map, startWith, tap } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import {
    InsumoResponseDTO,
    CreateInsumoDTO,
} from 'app/core/models/insumo.catalog.types';
import { MarcaResponseDTO } from 'app/core/models/marca.catalog.types';
import { TipoEmbalagemResponseDTO } from 'app/core/models/tipo-embalagem.catalog.types';
import { UnidadeMedidaResponseDTO } from 'app/core/models/unidade-medida.catalog.types';

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
    private readonly api = inject(ApiService);
    private _changeDetectorRef = inject(ChangeDetectorRef);

    // Estado reativo para insumos
    private readonly insumosSubject = new BehaviorSubject<InsumoResponseDTO[]>([]);
    readonly insumos$ = this.insumosSubject.asObservable();

    // Estado reativo para filtros
    private readonly searchSubject = new BehaviorSubject<string>('');

    // Estado reativo para listas de seleção
    private readonly marcasSubject = new BehaviorSubject<MarcaResponseDTO[]>([]);
    readonly marcas$ = this.marcasSubject.asObservable();

    private readonly tiposEmbalagemSubject = new BehaviorSubject<TipoEmbalagemResponseDTO[]>([]);
    readonly tiposEmbalagem$ = this.tiposEmbalagemSubject.asObservable();

    private readonly fornecedoresSubject = new BehaviorSubject<FornecedorResponseDTO[]>([]);
    readonly fornecedores$ = this.fornecedoresSubject.asObservable();

    private readonly almoxarifadosSubject = new BehaviorSubject<AlmoxarifadoResponseDTO[]>([]);
    readonly almoxarifados$ = this.almoxarifadosSubject.asObservable();

    private readonly unidadesMedidaSubject = new BehaviorSubject<UnidadeMedidaResponseDTO[]>([]);
    readonly unidadesMedida$ = this.unidadesMedidaSubject.asObservable();

    // Dados simulados para insumos (serão removidos após integração com API)
    private _insumos: InsumoResponseDTO[] = [
        {
            id: 1,
            codigo: 'INSUMO001',
            descricao: 'Reagente Hemograma',
            loteObrigatorio: true,
            quantidade: 100,
            fornecedorId: 1,
            fornecedorName: 'Fornecedor A',
            marcaId: 1,
            marcaName: 'Marca X',
            almoxarifadoId: 1,
            almoxarifadoName: 'Almoxarifado Principal',
            tipoEmbalagemId: 1,
            tipoEmbalagemName: 'Caixa',
            unidadeMedidaId: 1,
            unidadeMedidaName: 'Unid.',
            audityInfo: '2023-01-01T10:00:00Z, Sistema',
        },
    ];

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
    editingId: number | null = null;

    form: CreateInsumoDTO = {
        codigo: '',
        descricao: '',
        quantidade: 0,
        loteObrigatorio: false,
    };

    constructor() {}

    ngOnInit(): void {
        this.loadInsumos();
        this.loadMarcas();
        this.loadTiposEmbalagem();
        this.loadFornecedores();
        this.loadAlmoxarifados();
        this.loadUnidadesMedida();
    }

    // Métodos de carregamento da API
    private loadInsumos(): void {
        // Simulação de carregamento de insumos (substituir por chamada API real)
        this.insumosSubject.next(this._insumos);
    }

    private loadMarcas(): void {
        this.api.list<MarcaResponseDTO>('marcas').subscribe({
            next: (data) => {
                this.marcasSubject.next(data || []);
            },
            error: () => {
                this.marcasSubject.next([
                    { id: 1, nome: 'Roche', audityInfo: 'N/A' },
                    { id: 2, nome: 'Abbott', audityInfo: 'N/A' },
                    { id: 3, nome: 'Siemens', audityInfo: 'N/A' },
                ]);
            },
        });
    }

    private loadTiposEmbalagem(): void {
        this.api.list<TipoEmbalagemResponseDTO>('tipo-embalagem').subscribe({
            next: (data) => {
                this.tiposEmbalagemSubject.next(data || []);
            },
            error: () => {
                this.tiposEmbalagemSubject.next([
                    { id: 1, descricao: 'Caixa', audityInfo: 'N/A' },
                    { id: 2, descricao: 'Frasco', audityInfo: 'N/A' },
                    { id: 3, descricao: 'Saco', audityInfo: 'N/A' },
                ]);
            },
        });
    }

    private loadFornecedores(): void {
        this.api.list<FornecedorResponseDTO>('fornecedores').subscribe({
            next: (data) => {
                const normalized = (data as any)?.content ?? data ?? [];
                this.fornecedoresSubject.next(normalized);
            },
            error: () => {
                this.fornecedoresSubject.next([
                    {
                        id: 1,
                        nome: 'Fornecedor A',
                        cnpj: '12345678000195',
                        audityInfo: 'N/A',
                    },
                    {
                        id: 2,
                        nome: 'Fornecedor B',
                        cnpj: '98765432000100',
                        audityInfo: 'N/A',
                    },
                ]);
            },
        });
    }

    private loadAlmoxarifados(): void {
        this.api.list<AlmoxarifadoResponseDTO>('almoxarifados').subscribe({
            next: (data) => {
                this.almoxarifadosSubject.next(data || []);
            },
            error: () => {
                this.almoxarifadosSubject.next([
                    {
                        id: 1,
                        nome: 'Almoxarifado Principal',
                        audityInfo: 'N/A',
                    },
                    {
                        id: 2,
                        nome: 'Almoxarifado Secundário',
                        audityInfo: 'N/A',
                    },
                ]);
            },
        });
    }

    private loadUnidadesMedida(): void {
        this.api.list<UnidadeMedidaResponseDTO>('unidades-medida').subscribe({
            next: (data) => {
                this.unidadesMedidaSubject.next(data || []);
            },
            error: () => {
                this.unidadesMedidaSubject.next([
                    { id: 1, descricao: 'Unid.', audityInfo: 'N/A' },
                    { id: 2, descricao: 'Kg', audityInfo: 'N/A' },
                    { id: 3, descricao: 'Litro', audityInfo: 'N/A' },
                ]);
            },
        });
    }

    // Getters para listas filtradas
    readonly filteredInsumos$ = combineLatest([
        this.insumos$,
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
            // Simulação de exclusão (substituir por chamada API real)
            this._insumos = this._insumos.filter((i) => i.id !== insumo.id);
            this.insumosSubject.next(this._insumos);
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
            this.api
                .update<InsumoResponseDTO>(
                    'insumos',
                    this.editingId!,
                    updateDto
                )
                .subscribe({
                    next: (updatedInsumo) => {
                        this._insumos = this._insumos.map((i) =>
                            i.id === updatedInsumo.id ? updatedInsumo : i
                        );
                        this.insumosSubject.next(this._insumos);
                        this.cancelar();
                    },
                    error: (err) => {
                        console.error('Erro ao atualizar insumo:', err);
                        // Optionally, show an error message to the user
                    },
                });
        } else {
            const createDto: CreateInsumoDTO = insumoData;
            this.api.create<InsumoResponseDTO>('insumos', createDto).subscribe({
                next: (newInsumo) => {
                    this._insumos = [...this._insumos, newInsumo];
                    this.insumosSubject.next(this._insumos);
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
