import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/api/api.service';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { CreateSetorDTO, UpdateSetorDTO, SetorResponseDTO } from '../../../core/models/basic-catalog.types';

@Component({
    selector: 'setor',
    templateUrl: './setor.component.html',
    styleUrls: ['./setor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslocoModule],
})
export class SetorComponent {
    private readonly api = inject(ApiService);
    private readonly fb = inject(FormBuilder);
    private readonly snackBar = inject(MatSnackBar);
    private readonly transloco = inject(TranslocoService);

    // Signals para estado
    setores = signal<SetorResponseDTO[]>([]);
    search = signal('');
    selectedIds = signal<Set<number>>(new Set());
    mode = signal<'list' | 'create' | 'edit' | 'view'>('list');

    form: FormGroup = this.fb.group({
        id: [null],
        nome: ['', Validators.required],
    });

    filteredSetores = computed(() => {
        const term = this.search().trim().toLowerCase();
        return term ? this.setores().filter(s => s.nome.toLowerCase().includes(term)) : this.setores();
    });

    constructor() {
        this.loadSetores();
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

    editar(setor: SetorResponseDTO): void {
        this.form.patchValue(setor);
        this.mode.set('edit');
    }

    visualizar(setor: SetorResponseDTO): void {
        this.form.patchValue(setor);
        this.form.disable(); // Read-only
        this.mode.set('view');
    }

    salvar(): void {
        if (this.form.invalid) return;

        const data: CreateSetorDTO | UpdateSetorDTO = this.form.value;

        if (this.mode() === 'edit') {
            const updateData = data as UpdateSetorDTO;
            this.api.update<SetorResponseDTO>('/setores', updateData.id, updateData).subscribe({
                next: () => { this.loadSetores(); this.cancelar(); },
                error: err => this.showError('Erro ao atualizar: ' + err.message),
            });
        } else {
            this.api.create<SetorResponseDTO>('/setores', data).subscribe({
                next: () => { this.loadSetores(); this.cancelar(); },
                error: err => this.showError('Erro ao criar: ' + err.message),
            });
        }
    }

    excluir(setor: SetorResponseDTO): void {
        if (confirm(this.transloco.translate('confirm.excluir', { nome: setor.nome }))) {
            this.api.remove('/setores', setor.id).subscribe({
                next: () => this.loadSetores(),
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
        const header = ['ID', 'Nome'];
        const rows = this.filteredSetores().map(s => [
            String(s.id),
            s.nome,
        ]);
        const csv = [header, ...rows]
            .map(r => r.map(v => '"' + String(v).replaceAll('"', '""') + '"').join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'setores.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    private showError(message: string): void {
        this.snackBar.open(message, 'OK', { duration: 5000, panelClass: ['error-snackbar'] });
    }
}
