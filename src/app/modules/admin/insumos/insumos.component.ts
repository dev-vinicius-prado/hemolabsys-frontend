import { ChangeDetectionStrategy, Component, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Insumo {
    id: number;
    codigo: string;
    descricao: string;
    marca: string;
    setor: string;
    tipoEmbalagem: string;
    unidadeMedida: string;
    lote: boolean;
}

@Component({
    selector: 'insumos',
    templateUrl: './insumos.component.html',
    styleUrls: ['./insumos.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, FormsModule],
})
export class InsumosComponent {
    constructor(private _changeDetectorRef: ChangeDetectorRef) {}
    // Dados simulados
    insumos: Insumo[] = [
        {
            id: 1,
            codigo: 'INSUMO001',
            descricao: 'Reagente Hemograma',
            marca: 'Roche',
            setor: 'Bioquímica',
            tipoEmbalagem: 'Caixa',
            unidadeMedida: 'Unid.',
            lote: true,
        },
    ];

    // Estado de UI
    search = '';
    setorFiltro = '';
    selectedIds = new Set<number>();

    formVisible = false;
    viewOnly = false;
    editingId: number | null = null;

    form: Partial<Insumo> = {
        codigo: '',
        descricao: '',
        marca: '',
        setor: '',
        tipoEmbalagem: '',
        unidadeMedida: 'Unid.',
        lote: false,
    };

    get setores(): string[] {
        const s = Array.from(new Set(this.insumos.map(i => i.setor))).sort();
        return s.length ? s : ['Bioquímica', 'Hematologia', 'Microbiologia'];
    }

    get marcas(): string[] {
        const m = Array.from(new Set(this.insumos.map(i => i.marca))).sort();
        return m.length ? m : ['Roche', 'Abbott', 'Siemens'];
    }

    get tiposEmbalagem(): string[] {
        const t = Array.from(new Set(this.insumos.map(i => i.tipoEmbalagem))).sort();
        return t.length ? t : ['Caixa', 'Frasco', 'Saco'];
    }

    get filteredInsumos(): Insumo[] {
        return this.insumos.filter(i => {
            const matchesSearch = this.search
                ? (i.codigo + ' ' + i.descricao + ' ' + i.marca + ' ' + i.setor)
                      .toLowerCase()
                      .includes(this.search.toLowerCase())
                : true;
            const matchesSetor = this.setorFiltro ? i.setor === this.setorFiltro : true;
            return matchesSearch && matchesSetor;
        });
    }

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
            marca: '',
            setor: '',
            tipoEmbalagem: '',
            unidadeMedida: 'Unid.',
            lote: false,
        };
    }

    editar(insumo: Insumo): void {
        this.viewOnly = false;
        this.editingId = insumo.id;
        this.formVisible = true;
        this.form = { ...insumo };
    }

    visualizar(insumo: Insumo): void {
        this.viewOnly = true;
        this.editingId = insumo.id;
        this.formVisible = true;
        this.form = { ...insumo };
    }

    excluir(insumo: Insumo): void {
        if (confirm(`Excluir ${insumo.descricao}?`)) {
            this.insumos = this.insumos.filter(i => i.id !== insumo.id);
            this.selectedIds.delete(insumo.id);
        }
    }

    salvar(): void {
        if (this.viewOnly) {
            this.cancelar();
            return;
        }
        const isEdit = this.editingId !== null;
        if (isEdit) {
            this.insumos = this.insumos.map(i => (i.id === this.editingId ? { ...i, ...(this.form as Insumo) } : i));
        } else {
            const nextId = (this.insumos.at(-1)?.id ?? 0) + 1;
            this.insumos = [
                ...this.insumos,
                {
                    id: nextId,
                    codigo: this.form.codigo || `INS-${nextId}`,
                    descricao: this.form.descricao || '',
                    marca: this.form.marca || '',
                    setor: this.form.setor || '',
                    tipoEmbalagem: this.form.tipoEmbalagem || '',
                    unidadeMedida: this.form.unidadeMedida || 'Unid.',
                    lote: !!this.form.lote,
                },
            ];
        }
        this.cancelar();
    }

    cancelar(): void {
        this.formVisible = false;
        this.viewOnly = false;
        this.editingId = null;
        this._changeDetectorRef.markForCheck();
    }

    exportCsv(): void {
        const header = ['Código', 'Descrição', 'Marca', 'Setor', 'Tipo Emb.', 'Unid. Med.', 'Lote?'];
        const rows = this.filteredInsumos.map(i => [
            i.codigo,
            i.descricao,
            i.marca,
            i.setor,
            i.tipoEmbalagem,
            i.unidadeMedida,
            i.lote ? 'Sim' : 'Não',
        ]);
        const csv = [header, ...rows]
            .map(r => r.map(v => '"' + String(v).replaceAll('"', '""') + '"').join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'insumos.csv';
        a.click();
        URL.revokeObjectURL(url);
    }
}
