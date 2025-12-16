import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
    inject,
    signal,
    computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/api/api.service';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import {
    CreateTipoEmbalagemDTO,
    UpdateTipoEmbalagemDTO,
    TipoEmbalagemResponseDTO,
} from '../../../core/models/basic-catalog.types';

@Component({
    selector: 'tipo-embalagem',
    templateUrl: './tipo-embalagem.component.html',
    styleUrls: ['./tipo-embalagem.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslocoModule],
})
export class TipoEmbalagemComponent {
    private readonly api = inject(ApiService);
    private readonly fb = inject(FormBuilder);
    private readonly snackBar = inject(MatSnackBar);
    private readonly transloco = inject(TranslocoService);

    // Signals para estado
    tiposEmbalagem = signal<TipoEmbalagemResponseDTO[]>([]);
    search = signal('');
    selectedIds = signal<Set<number>>(new Set());
    mode = signal<'list' | 'create' | 'edit' | 'view'>('list');

    form: FormGroup = this.fb.group({
        id: [null],
        descricao: ['', Validators.required],
    });

    filteredTiposEmbalagem = computed(() => {
        const term = this.search().trim().toLowerCase();
        return term
            ? this.tiposEmbalagem().filter((t) =>
                  t.descricao.toLowerCase().includes(term)
              )
            : this.tiposEmbalagem();
    });

    constructor() {
        this.loadTiposEmbalagem();
    }

    loadTiposEmbalagem(): void {
        this.api.list<TipoEmbalagemResponseDTO>('/tipos-embalagem').subscribe({
            next: (data) => this.tiposEmbalagem.set(data),
            error: (err) =>
                this.showError(
                    'Erro ao carregar tipos de embalagem: ' + err.message
                ),
        });
    }

    novo(): void {
        this.form.reset();
        this.mode.set('create');
    }

    editar(tipoEmbalagem: TipoEmbalagemResponseDTO): void {
        this.form.patchValue(tipoEmbalagem);
        this.mode.set('edit');
    }

    visualizar(tipoEmbalagem: TipoEmbalagemResponseDTO): void {
        this.form.patchValue(tipoEmbalagem);
        this.form.disable(); // Read-only
        this.mode.set('view');
    }

    salvar(): void {
        if (this.form.invalid) return;

        const data: CreateTipoEmbalagemDTO | UpdateTipoEmbalagemDTO = {
            ...this.form.value,
            usuario: 'admin', // Substituir pelo usuário logado
            dataAtualizacao: new Date().toISOString(),
        };

        if (this.mode() === 'edit') {
            const updateData = data as UpdateTipoEmbalagemDTO;
            this.api
                .update<TipoEmbalagemResponseDTO>(
                    '/tipos-embalagem',
                    updateData.id,
                    updateData
                )
                .subscribe({
                    next: () => {
                        this.loadTiposEmbalagem();
                        this.cancelar();
                    },
                    error: (err) =>
                        this.showError('Erro ao atualizar: ' + err.message),
                });
        } else {
            this.api
                .create<TipoEmbalagemResponseDTO>('/tipos-embalagem', data)
                .subscribe({
                    next: () => {
                        this.loadTiposEmbalagem();
                        this.cancelar();
                    },
                    error: (err) =>
                        this.showError('Erro ao criar: ' + err.message),
                });
        }
    }

    excluir(tipoEmbalagem: TipoEmbalagemResponseDTO): void {
        if (
            confirm(
                this.transloco.translate('confirm.excluir', {
                    nome: tipoEmbalagem.descricao,
                })
            )
        ) {
            this.api.remove('/tipos-embalagem', tipoEmbalagem.id).subscribe({
                next: () => this.loadTiposEmbalagem(),
                error: (err) =>
                    this.showError('Erro ao excluir: ' + err.message),
            });
        }
    }

    cancelar(): void {
        this.mode.set('list');
        this.form.enable();
        this.form.reset();
    }

    toggleSelection(id: number, checked: boolean): void {
        this.selectedIds.update((set) => {
            checked ? set.add(id) : set.delete(id);
            return new Set(set);
        });
    }

    exportCsv(): void {
        const header = ['ID', 'Descrição'];
        const rows = this.filteredTiposEmbalagem().map((t) => [
            String(t.id),
            t.descricao,
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
        a.download = 'tipos-embalagem.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    private showError(message: string): void {
        this.snackBar.open(message, 'OK', {
            duration: 5000,
            panelClass: ['error-snackbar'],
        });
    }
}
