import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { SaidaDataService } from './saida-data.service';
import { InsumoLoteSaidaResponseDTO } from './types/saida.types';
import { Observable } from 'rxjs';

@Component({
    selector: 'saida',
    templateUrl: './saida.component.html',
    styleUrls: ['./saida.component.scss'],
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
export class SaidaComponent implements OnInit {
    private saidaDataService = inject(SaidaDataService);
    private formBuilder = inject(FormBuilder);
    private snackBar = inject(MatSnackBar);

    saidaForm!: FormGroup;
    insumosLotesSaida$: Observable<InsumoLoteSaidaResponseDTO[]> | undefined;
    selectedInsumoLoteSaida: InsumoLoteSaidaResponseDTO | undefined;

    ngOnInit(): void {
        this.saidaForm = this.formBuilder.group({
            insumoLoteId: ['', Validators.required],
            quantidade: ['', [Validators.required, Validators.min(1)]],
            solicitante: ['', Validators.required],
            usuarioRegistroId: ['']
        });

        this.insumosLotesSaida$ = this.saidaDataService.insumosLotesSaida$;
        this.saidaDataService.getInsumosLotesDisponiveisParaSaida();
    }

    submitSaida(): void {
        if (this.saidaForm.invalid) {
            this.snackBar.open('Formulário inválido. Verifique os campos.', 'Fechar', { duration: 3000 });
            return;
        }

        const formValues = this.saidaForm.value;
        const saidaDTO = {
            insumoId: this.selectedInsumoLoteSaida?.insumoId,
            loteId: formValues.insumoLoteId,
            quantidade: formValues.quantidade,
            solicitante: formValues.solicitante,
            usuarioRegistroId: formValues.usuarioRegistroId
        } as unknown as import('./types/saida.types').CreateSaidaDTO;

        if (!saidaDTO.insumoId) {
            this.snackBar.open('Selecione um insumo/lote válido.', 'Fechar', { duration: 3000 });
            return;
        }

        this.saidaDataService.createSaida(saidaDTO)
            .subscribe({
                next: (response) => {
                    this.snackBar.open('Saída registrada com sucesso!', 'Fechar', { duration: 3000 });
                    this.saidaForm.reset();
                    this.selectedInsumoLoteSaida = undefined;
                },
                error: (err) => {
                    this.snackBar.open(`Erro ao registrar saída: ${err.message}`, 'Fechar', { duration: 5000 });
                }
            });
    }

    onInsumoLoteSaidaSelect(lote: InsumoLoteSaidaResponseDTO): void {
        this.selectedInsumoLoteSaida = lote;
        this.saidaForm.patchValue({ insumoLoteId: lote.id });

        // Update validators for 'quantidade' based on selected insumo/lote
        const quantidadeControl = this.saidaForm.get('quantidade');
        if (quantidadeControl) {
            quantidadeControl.setValidators([
                Validators.required,
                Validators.min(1),
                Validators.max(lote.quantidadeDisponivel)
            ]);
            quantidadeControl.updateValueAndValidity();
        }
    }
}
