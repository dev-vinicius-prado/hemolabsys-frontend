import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ImportacaoNfePendencia } from 'app/core/models/importacao-nfe.types';
import { DependenciesService } from '../../../insumos/services/dependencies.service';
import { InsumosDataService } from '../../../insumos/services/insumos-data.service';
import { Categoria } from 'app/core/models/insumo.catalog.types';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'quick-insumo-dialog',
    template: `
        <div class="flex flex-col max-w-160">
            <div class="flex items-center justify-between px-6 py-4 bg-primary text-on-primary">
                <div class="text-lg font-semibold">Cadastrar Novo Insumo</div>
                <button mat-icon-button (click)="close()" [disabled]="isLoading">
                    <mat-icon class="text-current" [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
                </button>
            </div>

            <form [formGroup]="form" class="flex flex-col p-6 space-y-4">
                <div class="text-secondary mb-2">
                    Cadastrando insumo baseado no item <strong>{{data.pendencia.codigoExterno}}</strong>
                    do fornecedor <strong>{{data.pendencia.nomeFornecedor}}</strong>.
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <mat-form-field class="w-full">
                        <mat-label>Código Interno</mat-label>
                        <input matInput formControlName="codigo" placeholder="Ex: INS-001">
                        <mat-error *ngIf="form.get('codigo')?.hasError('required')">Obrigatório</mat-error>
                    </mat-form-field>

                    <mat-form-field class="w-full">
                        <mat-label>Categoria</mat-label>
                        <mat-select formControlName="categoria">
                            <mat-option *ngFor="let cat of categorias" [value]="cat">{{cat}}</mat-option>
                        </mat-select>
                    </mat-form-field>
                </div>

                <mat-form-field class="w-full">
                    <mat-label>Descrição</mat-label>
                    <textarea matInput formControlName="descricao" rows="2"></textarea>
                    <mat-error *ngIf="form.get('descricao')?.hasError('required')">Obrigatório</mat-error>
                </mat-form-field>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <mat-form-field class="w-full">
                        <mat-label>Unidade de Medida</mat-label>
                        <mat-select formControlName="unidadeMedidaId">
                            <mat-option *ngFor="let um of unidadesMedida$ | async" [value]="um.id">
                                {{um.simbolo}} - {{um.descricao}}
                            </mat-option>
                        </mat-select>
                        <mat-error *ngIf="form.get('unidadeMedidaId')?.hasError('required')">Obrigatório</mat-error>
                    </mat-form-field>

                    <div class="flex flex-col space-y-2 pt-2">
                        <mat-checkbox formControlName="perecivel">Perecível</mat-checkbox>
                        <mat-checkbox formControlName="loteObrigatorio">Lote Obrigatório</mat-checkbox>
                    </div>
                </div>

                <div class="flex items-center justify-end mt-4 space-x-3">
                    <button mat-button (click)="close()" [disabled]="isLoading">Cancelar</button>
                    <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid || isLoading">
                        <mat-icon *ngIf="!isLoading" [svgIcon]="'heroicons_outline:check'"></mat-icon>
                        <span class="ml-2">Cadastrar e Vincular</span>
                    </button>
                </div>
            </form>
        </div>
    `,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatIconModule
    ]
})
export class QuickInsumoDialogComponent implements OnInit {
    private _fb = inject(FormBuilder);
    private _dependenciesService = inject(DependenciesService);
    private _insumosDataService = inject(InsumosDataService);
    private _snackBar = inject(MatSnackBar);
    private _dialogRef = inject(MatDialogRef<QuickInsumoDialogComponent>);

    form: FormGroup;
    isLoading = false;
    categorias: Categoria[] = ['ADMINISTRATIVO', 'COLETA', 'EXAME', 'LIMPEZA', 'PROTECAO', 'OUTROS'];
    unidadesMedida$ = this._dependenciesService.unidadesMedida$;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { pendencia: ImportacaoNfePendencia }
    ) {}

    ngOnInit(): void {
        this.form = this._fb.group({
            codigo: ['', Validators.required],
            descricao: [this.data.pendencia.descricaoExterna, Validators.required],
            categoria: ['OUTROS', Validators.required],
            unidadeMedidaId: [null, Validators.required],
            perecivel: [false],
            loteObrigatorio: [true],
            fornecedorIds: [[null]] // Será preenchido no save
        });

        // Tenta pré-selecionar unidade de medida se houver match com a sigla da NFE
        this.unidadesMedida$.subscribe(ums => {
            const match = ums.find(u => u.simbolo.toUpperCase() === this.data.pendencia.unidadeMedidaExterna?.toUpperCase());
            if (match) {
                this.form.patchValue({ unidadeMedidaId: match.id });
            }
        });
    }

    save(): void {
        if (this.form.invalid) return;

        this.isLoading = true;

        // No backend, precisamos de uma lista de IDs de fornecedores
        // Mas o serviço de importação vai vincular automaticamente ao fornecedor da NFE
        // após a criação. Aqui, garantimos que o fornecedor da NFE esteja na lista.
        // Como não temos o ID do fornecedor na pendência (apenas CNPJ/Nome),
        // vamos buscar o ID nos fornecedores carregados.
        this._dependenciesService.fornecedores$.subscribe(fornecedores => {
            const fornecedor = fornecedores.find(f => f.cnpj === this.data.pendencia.cnpjFornecedor);
            const payload = {
                ...this.form.value,
                fornecedorIds: fornecedor ? [fornecedor.id] : []
            };

            this._insumosDataService.createInsumo(payload).subscribe({
                next: (insumo) => {
                    this._snackBar.open('Insumo cadastrado com sucesso!', 'OK', { duration: 3000 });
                    this._dialogRef.close(insumo.id);
                },
                error: (err) => {
                    this.isLoading = false;
                    this._snackBar.open('Erro ao cadastrar insumo: ' + (err.error?.message || 'Erro desconhecido'), 'Fechar');
                }
            });
        });
    }

    close(): void {
        this._dialogRef.close();
    }
}
