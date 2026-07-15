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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { NotificationService } from 'app/core/services/notification.service';
import { SaidaDataService } from './saida-data.service';
import { InsumoLoteSaidaResponseDTO, SetorOptionDTO } from './types/saida.types';
import { Observable, combineLatest, filter, shareReplay, startWith, switchMap, tap } from 'rxjs';
import { DependenciesService } from '../insumos/services/dependencies.service';
import { InsumosDataService } from '../insumos/services/insumos-data.service';
import { AlmoxarifadoResponseDTO } from 'app/core/models/almoxarifado-catalog.types';
import { InsumoResponseDTO } from 'app/core/models';
import { Router } from '@angular/router';

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
    private dependenciesService = inject(DependenciesService);
    private insumosDataService = inject(InsumosDataService);
    private formBuilder = inject(FormBuilder);
    private _notificationService = inject(NotificationService);
    private router = inject(Router);

    saidaForm!: FormGroup;
    insumosLotesSaida$: Observable<InsumoLoteSaidaResponseDTO[]> | undefined;
    almoxarifados$: Observable<AlmoxarifadoResponseDTO[]> = this.dependenciesService.almoxarifados$;
    insumos$: Observable<InsumoResponseDTO[]> = this.insumosDataService.insumos$;
    setores$!: Observable<SetorOptionDTO[]>;

    selectedInsumoLoteSaida: InsumoLoteSaidaResponseDTO | undefined;
    private lotesDisponiveis: InsumoLoteSaidaResponseDTO[] = [];

    ngOnInit(): void {
        this.saidaForm = this.formBuilder.group({
            almoxarifadoId: ['', Validators.required],
            insumoId: ['', Validators.required],
            codigoLote: ['', Validators.required],
            quantidade: ['', [Validators.required, Validators.min(1)]],
            idSetorSolicitante: [null, Validators.required],
            solicitante: ['', Validators.required],
            motivo: [''],
            usuarioRegistroId: ['']
        });

        this.insumosDataService.loadInsumos();
        this.dependenciesService.loadAlmoxarifados();
        this.setores$ = this.saidaDataService.getSetores().pipe(shareReplay(1));

        this.insumosLotesSaida$ = combineLatest([
            this.saidaForm.get('almoxarifadoId')!.valueChanges.pipe(startWith('')),
            this.saidaForm.get('insumoId')!.valueChanges.pipe(startWith(''))
        ]).pipe(
            filter(([almoxId, insumoId]) => !!almoxId && !!insumoId),
            switchMap(([almoxId, insumoId]) =>
                this.saidaDataService.getInsumosLotesDisponiveisParaSaida(insumoId, almoxId)
            ),
            tap((lotes) => {
                this.lotesDisponiveis = lotes ?? [];
                const currentCodigoLote = this.saidaForm.get('codigoLote')?.value;
                if (!currentCodigoLote && this.lotesDisponiveis.length > 0) {
                    this.onCodigoLoteSelect(this.lotesDisponiveis[0].codigoLote);
                }
            }),
        );
    }

    submitSaida(): void {
        if (this.saidaForm.invalid) {
            this._notificationService.warn('Formulário inválido. Verifique os campos.');
            return;
        }

        const formValues = this.saidaForm.value;
        const saidaDTO: import('./types/saida.types').CreateSaidaDTO = {
            almoxarifadoId: formValues.almoxarifadoId,
            insumoId: formValues.insumoId,
            codigoLote: formValues.codigoLote,
            quantidade: formValues.quantidade,
            idSetorSolicitante: formValues.idSetorSolicitante,
            solicitante: formValues.solicitante,
            motivo: formValues.motivo
        };

        this.saidaDataService.createSaida(saidaDTO)
            .subscribe({
                next: () => {
                    this._notificationService.success('Saída registrada com sucesso!');
                    this.router.navigate(['/movimentacoes']);
                },
                error: (err) => {
                    this._notificationService.error(`Erro ao registrar saída: ${err.message}`);
                }
            });
    }

    onCodigoLoteSelect(codigoLote: string): void {
        const lote = this.lotesDisponiveis.find((l) => l.codigoLote === codigoLote);
        if (!lote) {
            this.selectedInsumoLoteSaida = undefined;
            return;
        }

        this.selectedInsumoLoteSaida = lote;
        this.saidaForm.patchValue({ codigoLote: lote.codigoLote });

        const quantidadeControl = this.saidaForm.get('quantidade');
        if (quantidadeControl) {
            quantidadeControl.setValidators([
                Validators.required,
                Validators.min(1),
                Validators.max(lote.quantidade)
            ]);
            quantidadeControl.updateValueAndValidity();
        }
    }
}
