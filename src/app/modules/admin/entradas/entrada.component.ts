import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EntradaDataService } from './entrada-data.service';
import {
    AlmoxarifadoOptionDTO,
    FornecedorOptionDTO,
    InsumoOptionDTO,
} from './types/entrada.types';
import { Observable, shareReplay, tap } from 'rxjs';
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
    private router = inject(Router);

    insumos$!: Observable<InsumoOptionDTO[]>;
    almoxarifados$!: Observable<AlmoxarifadoOptionDTO[]>;
    fornecedores$!: Observable<FornecedorOptionDTO[]>;

    entradaForm!: FormGroup;

    private insumosCache: InsumoOptionDTO[] = [];

    ngOnInit(): void {
        this.entradaForm = this.formBuilder.group({
            contexto: this.formBuilder.group({
                almoxarifadoId: [null, Validators.required],
                insumoId: [null, Validators.required],
                fornecedorId: [null, Validators.required],
            }),
            lote: this.formBuilder.group({
                numeroLote: ['', Validators.required],
                dataFabricacao: [''],
                dataValidade: ['', Validators.required],
                numeroNotaFiscal: ['', Validators.required],
            }),
            quantidade: this.formBuilder.group({
                quantidade: [null, [Validators.required, Validators.min(1)]],
            }),
        });

        this.insumos$ = this.entradaDataService.getInsumos().pipe(
            tap((insumos) => (this.insumosCache = insumos)),
            shareReplay(1)
        );
        this.almoxarifados$ = this.entradaDataService.getAlmoxarifados().pipe(shareReplay(1));
        this.fornecedores$ = this.entradaDataService.getFornecedores().pipe(shareReplay(1));
    }

    submitEntrada(): void {
        if (this.entradaForm.invalid) {
            this.snackBar.open('Formulário inválido. Verifique os campos.', 'Fechar', { duration: 3000 });
            return;
        }

        const rawValue = this.entradaForm.getRawValue() as {
            contexto: { almoxarifadoId: number; insumoId: number; fornecedorId: number };
            lote: { numeroLote: string; dataFabricacao?: string; dataValidade: string; numeroNotaFiscal: string };
            quantidade: { quantidade: number };
        };

        const payload = {
            almoxarifadoId: rawValue.contexto.almoxarifadoId,
            insumoId: rawValue.contexto.insumoId,
            fornecedorId: rawValue.contexto.fornecedorId,
            numeroLote: rawValue.lote.numeroLote,
            dataFabricacao: rawValue.lote.dataFabricacao || undefined,
            dataValidade: rawValue.lote.dataValidade,
            numeroNotaFiscal: rawValue.lote.numeroNotaFiscal,
            quantidade: rawValue.quantidade.quantidade,
        };

        this.entradaDataService.createEntrada(payload)
            .subscribe({
                next: () => {
                    this.snackBar.open('Entrada registrada com sucesso!', 'OK', {
                        duration: 5000,
                        panelClass: ['success-snackbar'],
                    });
                    this.router.navigate(['/movimentacoes']);
                },
                error: (err) => {
                    this.snackBar.open(`Erro ao registrar entrada: ${err.message}`, 'Fechar', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    });
                }
            });
    }

    onInsumoSelect(insumoId: number): void {
        const insumo = this.insumosCache.find((i) => i.id === insumoId);
        if (!insumo) {
            return;
        }
    }
}
