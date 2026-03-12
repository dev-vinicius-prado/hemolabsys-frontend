import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EntradaDataService } from './entrada-data.service';
import { InsumoLoteResponseDTO } from './types/entrada.types';
import { Observable } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'entrada',
    templateUrl: './entrada.component.html',
    styleUrls: ['./entrada.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatSnackBarModule,
        MatStepperModule
    ],
})
export class EntradaComponent implements OnInit {
    private entradaDataService = inject(EntradaDataService);
    private formBuilder = inject(FormBuilder);
    private snackBar = inject(MatSnackBar);

    entradaForm!: FormGroup;
    insumosLotes$: Observable<InsumoLoteResponseDTO[]> | undefined;
    selectedInsumoLote: InsumoLoteResponseDTO | undefined;

    ngOnInit(): void {
        // Inicializar formulário reativo com validações
        this.entradaForm = this.formBuilder.group({
            insumoLoteId: ['', Validators.required],
            quantidade: ['', [Validators.required, Validators.min(1)]],
            usuarioRegistroId: [''] // Preenchido por serviço de autenticação posteriormente
        });

        // Buscar insumos e lotes disponíveis do serviço
        this.insumosLotes$ = this.entradaDataService.getInsumosLotesDisponiveis();
    }

    submitEntrada(): void {
        if (this.entradaForm.invalid) {
            this.snackBar.open('Formulário inválido. Verifique os campos.', 'Fechar', { duration: 3000 });
            return;
        }

        const formValues = this.entradaForm.value;
        const entradaDTO = {
            insumoId: this.selectedInsumoLote?.insumoId,
            loteId: formValues.insumoLoteId,
            quantidade: formValues.quantidade,
            usuarioRegistroId: formValues.usuarioRegistroId
        } as unknown as import('./types/entrada.types').CreateEntradaDTO;

        if (!entradaDTO.insumoId) {
            this.snackBar.open('Selecione um insumo/lote válido.', 'Fechar', { duration: 3000 });
            return;
        }

        this.entradaDataService.createEntrada(entradaDTO)
            .subscribe({
                next: (response) => {
                    this.snackBar.open('Entrada registrada com sucesso!', 'Fechar', { duration: 3000 });
                    this.entradaForm.reset();
                    this.selectedInsumoLote = undefined;
                    // Atualizar UI com novo estoque (implementar com RxJS tap() no serviço posteriormente)
                },
                error: (err) => {
                    this.snackBar.open(`Erro ao registrar entrada: ${err.message}`, 'Fechar', { duration: 5000 });
                }
            });
    }

    onInsumoLoteSelect(lote: InsumoLoteResponseDTO): void {
        this.selectedInsumoLote = lote;
        this.entradaForm.patchValue({ insumoLoteId: lote.id });
    }
}
