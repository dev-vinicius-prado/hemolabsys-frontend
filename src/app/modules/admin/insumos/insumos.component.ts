import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/api/api.service';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { SetorResponseDTO } from 'app/core/models';

interface InsumoResponseDTO {
    id: number;
    codigo: string;
    descricao: string;
    marca: string;
    setor: string;
    tipoEmbalagem: string;
    unidadeMedida: string;
    lote: boolean;
}

interface CreateInsumoDTO {
    codigo: string;
    descricao: string;
    marca: string;
    setor: string;
    tipoEmbalagem: string;
    unidadeMedida: string;
    lote: boolean;
}

interface UpdateInsumoDTO extends CreateInsumoDTO {
    id: number;
}

@Component({
    selector: 'insumos',
    templateUrl: './insumos.component.html',
    styleUrls: ['./insumos.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslocoModule],
})
export class InsumosComponent {
    private readonly api = inject(ApiService);
    private readonly fb = inject(FormBuilder);
    private readonly snackBar = inject(MatSnackBar);
    private readonly transloco = inject(TranslocoService);

    // Signals para estado
    insumos = signal<InsumoResponseDTO[]>([]);
    setores = signal<SetorResponseDTO[]>([]);
    search = signal('');
    setorFiltro = signal('');
    selectedIds = signal<Set<number>>(new Set());
    mode = signal<'list' | 'create' | 'edit' | 'view'>('list');

    form: FormGroup = this.fb.group({
        id: [null],
        codigo: ['', Validators.required],
        descricao: ['', Validators.required],
        marca: ['', Validators.required],
        setor: ['', Validators.required],
        tipoEmbalagem: ['', Validators.required],
        unidadeMedida: ['Unid.', Validators.required],
        lote: [false],
    });

    filteredInsumos = computed(() => {
        const term = this.search().trim().toLowerCase();
        const setor = this.setorFiltro().toLowerCase();
        return this.insumos().filter(i => {
            const matchesSearch = term
                ? (i.codigo + ' ' + i.descricao + ' ' + i.marca + ' ' + i.setor)
                      .toLowerCase()
                      .includes(term)
                : true;
            const matchesSetor = setor ? i.setor.toLowerCase() === setor : true;
            return matchesSearch && matchesSetor;
        });
    });

    constructor() {
        this.loadInsumos();
        this.loadSetores();
    }

    loadInsumos(): void {
        this.api.list<InsumoResponseDTO>('/insumos').subscribe({
            next: data => this.insumos.set(data),
            error: err => this.showError('Erro ao carregar insumos: ' + err.message),
        });
    }

    loadSetores(): void {
        this.api.list<SetorResponseDTO>('/setores').subscribe({
            next: data => this.setores.set(data),
            error: err => this.showError('Erro ao carregar setores: ' + err.message),
        });
    }

    novo(): void {
        this.form.reset();
        this.mode.set('create');
    }

    editar(insumo: InsumoResponseDTO): void {
        this.form.patchValue(insumo);
        this.mode.set('edit');
    }

    visualizar(insumo: InsumoResponseDTO): void {
        this.form.patchValue(insumo);
        this.form.disable(); // Read-only
        this.mode.set('view');
    }

    salvar(): void {
        if (this.form.invalid) return;

        const data: CreateInsumoDTO | UpdateInsumoDTO = this.form.value;

        if (this.mode() === 'edit') {
            const updateData = data as UpdateInsumoDTO;
            this.api.update<InsumoResponseDTO>('/insumos', updateData.id, updateData).subscribe({
                next: () => { this.loadInsumos(); this.cancelar(); },
                error: err => this.showError('Erro ao atualizar: ' + err.message),
            });
        } else {
            this.api.create<InsumoResponseDTO>('/insumos', data).subscribe({
                next: () => { this.loadInsumos(); this.cancelar(); },
                error: err => this.showError('Erro ao criar: ' + err.message),
            });
        }
    }

    excluir(insumo: InsumoResponseDTO): void {
        if (confirm(this.transloco.translate('confirm.excluir', { nome: insumo.descricao }))) {
            this.api.remove('/insumos', insumo.id).subscribe({
                next: () => this.loadInsumos(),
                error: err => this.showError('Erro ao excluir: ' + err.message),
            });
        }
    }

    cancelar(): void {
        this.mode.set('list');
        this.form.enable();
        this.form.reset();
    }

    toggleSelection(id: number, checked: boolean): void {
        this.selectedIds.update(set => {
            checked ? set.add(id) : set.delete(id);
            return new Set(set);
        });
    }

    exportCsv(): void {
        const header = ['Código', 'Descrição', 'Marca', 'Setor', 'Tipo Emb.', 'Unid. Med.', 'Lote?'];
        const rows = this.filteredInsumos().map(i => [
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

    private showError(message: string): void {
        this.snackBar.open(message, 'OK', { duration: 5000, panelClass: ['error-snackbar'] });
    }
}
