import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ImportacaoNfeService } from '../../services/importacao-nfe.service';
import { InsumosDataService } from 'app/modules/admin/insumos/services/insumos-data.service';
import { DependenciesService } from 'app/modules/admin/insumos/services/dependencies.service';
import { PendenciaImportacaoResponseDTO, InsumoCreateDTO } from 'app/core/models';
import { finalize, switchMap } from 'rxjs';

@Component({
    selector: 'app-resolucao-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        MatInputModule,
        MatCheckboxModule
    ],
    templateUrl: './resolucao-dialog.component.html'
})
export class ResolucaoDialogComponent implements OnInit {
    private readonly _dialogRef = inject(MatDialogRef<ResolucaoDialogComponent>);
    private readonly _fb = inject(UntypedFormBuilder);
    private readonly _insumosService = inject(InsumosDataService);
    private readonly _dependenciesService = inject(DependenciesService);
    private readonly _importacaoNfeService = inject(ImportacaoNfeService);

    // Formulário híbrido: Cadastro de Insumo + Resolução
    resolucaoForm = this._fb.group({
        // Dados do Insumo
        codigo: ['', Validators.required],
        descricao: ['', Validators.required],
        categoria: ['COLETA', Validators.required],
        unidadeMedidaId: [null, Validators.required],
        loteObrigatorio: [true],
        perecivel: [false],
        fornecedorIds: [[]],

        // Dados da Resolução
        unidadeComercialFornecedor: ['UN', Validators.required],
        fatorConversao: [1, [Validators.required, Validators.min(0.0001)]]
    });

    unidadesMedida$ = this._dependenciesService.unidadesMedida$;
    categorias = ['COLETA', 'LIMPEZA', 'ESCRITORIO', 'REAGENTE', 'OUTROS'];
    isLoading = false;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { pendencia: PendenciaImportacaoResponseDTO, modo?: string }) {}

    ngOnInit(): void {
        this._dependenciesService.loadUnidadesMedida();

        if (this.data.pendencia) {
            this.resolucaoForm.patchValue({
                codigo: this.data.pendencia.cprod,
                descricao: this.data.pendencia.xprod,
                unidadeComercialFornecedor: 'UN', // Valor padrão para início
                fornecedorIds: [this.data.pendencia.fornecedorId]
            });
        }
    }

    salvar(): void {
        if (this.resolucaoForm.invalid) return;

        this.isLoading = true;
        const formValue = this.resolucaoForm.value;

        // 1. Criar o Insumo
        const insumoDTO: InsumoCreateDTO = {
            codigo: formValue.codigo,
            descricao: formValue.descricao,
            categoria: formValue.categoria,
            unidadeMedidaId: formValue.unidadeMedidaId,
            loteObrigatorio: formValue.loteObrigatorio,
            perecivel: formValue.perecivel,
            fornecedorIds: formValue.fornecedorIds,
        };

        this._insumosService.createInsumo(insumoDTO).pipe(
            // 2. Com o Insumo criado, resolver a pendência
            switchMap((novoInsumo) => {
                const resolucaoDTO = {
                    idInsumo: novoInsumo.id,
                    unidadeComercialFornecedor: formValue.unidadeComercialFornecedor,
                    fatorConversao: formValue.fatorConversao
                };
                return this._importacaoNfeService.resolverPendencia(this.data.pendencia.id, resolucaoDTO);
            }),
            finalize(() => this.isLoading = false)
        ).subscribe({
            next: (response) => {
                this._dialogRef.close(response);
            },
            error: (error) => {
                console.error('Erro no fluxo de resolução', error);
            }
        });
    }

    cancelar(): void {
        this._dialogRef.close();
    }
}
