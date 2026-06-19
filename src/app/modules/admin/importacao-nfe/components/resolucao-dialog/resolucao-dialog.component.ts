import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ImportacaoNfeService } from '../../services/importacao-nfe.service';
import { InsumosDataService } from 'app/modules/admin/insumos/services/insumos-data.service';
import { PendenciaImportacaoResponseDTO } from 'app/core/models';
import { finalize } from 'rxjs';

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
        MatInputModule
    ],
    templateUrl: './resolucao-dialog.component.html'
})
export class ResolucaoDialogComponent implements OnInit {
    private readonly _dialogRef = inject(MatDialogRef<ResolucaoDialogComponent>);
    private readonly _fb = inject(UntypedFormBuilder);
    private readonly _insumosService = inject(InsumosDataService);
    private readonly _importacaoNfeService = inject(ImportacaoNfeService);

    resolucaoForm = this._fb.group({
        idInsumo: [null, Validators.required],
        unidadeComercialFornecedor: ['', Validators.required],
        fatorConversao: [1, [Validators.required, Validators.min(0.0001)]]
    });

    insumos$ = this._insumosService.insumos$;
    isLoading = false;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { pendencia: PendenciaImportacaoResponseDTO }) {}

    ngOnInit(): void {
        this._insumosService.loadInsumos(0, 100); // Carrega primeiros 100 insumos para o select
        
        // Pré-preencher unidade comercial se disponível
        if (this.data.pendencia) {
            // No MVP, a unidade vem nos dados originais que não estão no DTO simplificado, 
            // mas podemos deixar o usuário preencher ou inferir.
        }
    }

    salvar(): void {
        if (this.resolucaoForm.invalid) return;

        this.isLoading = true;
        this._importacaoNfeService.resolverPendencia(this.data.pendencia.id, this.resolucaoForm.value)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: (response) => {
                    this._dialogRef.close(response);
                },
                error: (error) => {
                    console.error('Erro ao resolver pendência', error);
                }
            });
    }

    cancelar(): void {
        this._dialogRef.close();
    }
}
