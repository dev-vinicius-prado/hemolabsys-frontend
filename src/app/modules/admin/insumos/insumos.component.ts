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

import {
    InsumoResponseDTO,
    InsumoCreateDTO,
    InsumoUpdateDTO,
    Categoria,
} from 'app/core/models/insumo.catalog.types';
import { InsumosDataService } from './services/insumos-data.service';
import { DependenciesService } from './services/dependencies.service';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { PageableResponse } from 'app/core/models';
import { MatIconModule } from "@angular/material/icon";

@Component({
    selector: 'insumos',
    templateUrl: './insumos.component.html',
    styleUrls: ['./insumos.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, FormsModule, MatSnackBarModule, PaginationComponent, MatIconModule],
})
export class InsumosComponent implements OnInit, OnDestroy {
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private insumosDataService = inject(InsumosDataService);
    private dependenciesService = inject(DependenciesService);
    private _snackBar = inject(MatSnackBar);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Estado reativo para filtros
    private readonly searchSubject = new BehaviorSubject<string>('');

    pagination$: Observable<PageableResponse<InsumoResponseDTO> | null> = this.insumosDataService.pagination$;

    currentPage: number = 0;
    pageSize: number = 10;

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
    readonly unidadesMedida$ = this.dependenciesService.unidadesMedida$;

    selectedIds = new Set<number>();
    formVisible = false;
    viewOnly = false;
    editingId: number | null = null;

    form: {
        categoria: Categoria;
        codigo: string;
        descricao: string;
        perecivel: boolean;
        loteObrigatorio: boolean;
        fornecedorId: number | null;
        unidadeMedidaId: number | null;
    } = {
        categoria: 'OUTROS',
        codigo: '',
        descricao: '',
        perecivel: false,
        loteObrigatorio: false,
        fornecedorId: null,
        unidadeMedidaId: null,
    };

    constructor() {}

    ngOnInit(): void {
        this.insumosDataService.loadInsumos(this.currentPage, this.pageSize);
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.insumosDataService.loadInsumos(this.currentPage, this.pageSize);
    }

    onSizeChange(size: number): void {
        this.pageSize = size;
        this.currentPage = 0;
        this.insumosDataService.loadInsumos(this.currentPage, this.pageSize);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
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
                (i.categoria ?? '').toLowerCase().includes(s) ||
                (i.unidadeMedida?.descricao ?? '').toLowerCase().includes(s) ||
                (i.fornecedores ?? []).some((f) => (f.nome ?? '').toLowerCase().includes(s))
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

    formatFornecedores(insumo: InsumoResponseDTO): string {
        return (insumo.fornecedores ?? []).map((f) => f.nome).filter(Boolean).join(' | ');
    }

    novoInsumo(): void {
        this.viewOnly = false;
        this.editingId = null;
        this.formVisible = true;
        this.form = {
            categoria: 'OUTROS',
            codigo: '',
            descricao: '',
            perecivel: false,
            loteObrigatorio: false,
            fornecedorId: null,
            unidadeMedidaId: null,
        };
    }

    editar(insumo: InsumoResponseDTO): void {
        this.viewOnly = false;
        this.editingId = insumo.id;
        this.formVisible = true;
        this.form = {
            categoria: insumo.categoria,
            codigo: insumo.codigo,
            descricao: insumo.descricao,
            loteObrigatorio: insumo.loteObrigatorio,
            perecivel: insumo.perecivel,
            fornecedorId: (insumo.fornecedores ?? [])[0]?.id ?? null,
            unidadeMedidaId: insumo.unidadeMedida?.id ?? null,
        };
    }

    visualizar(insumo: InsumoResponseDTO): void {
        this.viewOnly = true;
        this.editingId = insumo.id;
        this.formVisible = true;
        this.form = {
            categoria: insumo.categoria,
            codigo: insumo.codigo,
            descricao: insumo.descricao,
            loteObrigatorio: insumo.loteObrigatorio,
            perecivel: insumo.perecivel,
            fornecedorId: (insumo.fornecedores ?? [])[0]?.id ?? null,
            unidadeMedidaId: insumo.unidadeMedida?.id ?? null,
        };
    }

    excluir(insumo: InsumoResponseDTO): void {
        if (confirm(`Excluir ${insumo.descricao}?`)) {
            this.insumosDataService.deleteInsumo(insumo.id).subscribe({
                next: () => {
                    this._snackBar.open('Insumo excluído com sucesso!', 'OK', {
                        duration: 5000,
                        panelClass: ['success-snackbar'],
                    });
                    this.selectedIds.delete(insumo.id);
                },
                error: (err) => {
                    this._snackBar.open(`Erro ao excluir insumo: ${err.message}`, 'Fechar', {
                        duration: 5000,
                        panelClass: ['error-snackbar'],
                    });
                },
            });
        }
    }

    salvar(): void {
        if (this.viewOnly) {
            this.cancelar();
            return;
        }
        const isEdit = this.editingId !== null;

        if (!this.form.codigo || !this.form.descricao || !this.form.categoria) {
            return;
        }
        if (!this.form.fornecedorId || !this.form.unidadeMedidaId) {
            return;
        }

        const baseDto: InsumoCreateDTO = {
            categoria: this.form.categoria,
            codigo: this.form.codigo,
            descricao: this.form.descricao,
            fornecedorIds: [this.form.fornecedorId],
            loteObrigatorio: this.form.loteObrigatorio,
            perecivel: this.form.perecivel,
            unidadeMedidaId: this.form.unidadeMedidaId,
        };

        if (isEdit) {
            const updateDto: InsumoUpdateDTO = { ...baseDto, id: this.editingId! };
            this.insumosDataService
            .updateInsumo(this.editingId!, updateDto)
            .subscribe({
                next: () => {
                    this._snackBar.open('Insumo atualizado com sucesso!', 'OK', {
                        duration: 5000,
                        panelClass: ['success-snackbar'],
                    });
                    this.formVisible = false;
                    this._changeDetectorRef.markForCheck();
                    this.cancelar();
                },
                error: (err) => {
                    this._snackBar.open(`Erro ao atualizar insumo: ${err.message}`, 'Fechar', {
                        duration: 5000,
                        panelClass: ['error-snackbar'],
                    });
                },
            });
        } else {
            this.insumosDataService.createInsumo(baseDto).subscribe({
                next: () => {
                    this._snackBar.open('Insumo criado com sucesso!', 'OK', {
                        duration: 5000,
                        panelClass: ['success-snackbar'],
                    });
                    this.formVisible = false;
                    this._changeDetectorRef.markForCheck();
                    this.cancelar();
                },
                error: (err) => {
                    this._snackBar.open(`Erro ao criar insumo: ${err.message}`, 'Fechar', {
                        duration: 5000,
                        panelClass: ['error-snackbar'],
                    });
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
            'Categoria',
            'Perecível?',
            'Fornecedores',
            'Unid. Medida',
            'Lote Obrigatório?',
        ];
        const rows = filtered.map((i) => [
            i.codigo,
            i.descricao,
            i.categoria,
            i.perecivel ? 'Sim' : 'Não',
            (i.fornecedores ?? []).map((f) => f.nome).join(' | '),
            i.unidadeMedida?.descricao ?? '',
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
