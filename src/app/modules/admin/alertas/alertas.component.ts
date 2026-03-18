import { AsyncPipe, CommonModule, DatePipe, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Alerta, ConfiguracaoAlerta } from 'app/core/models/alerta.types';
import { AlertasService } from 'app/core/services/alertas.service';
import { finalize, Observable } from 'rxjs';
import { HasRoleDirective } from 'app/shared/directives/has-role.directive';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { InsumosDataService } from '../insumos/services/insumos-data.service';
import { InsumoResponseDTO } from 'app/core/models';

@Component({
    selector: 'alertas',
    standalone: true,
    templateUrl: './alertas.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule, NgIf, NgForOf, DatePipe, AsyncPipe, FormsModule, ReactiveFormsModule,
        MatButtonModule, MatIconModule, MatTableModule, MatMenuModule, MatTabsModule,
        MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule,
        HasRoleDirective
    ],
})
export class AlertasComponent implements OnInit {
    private _alertasService = inject(AlertasService);
    private _insumosService = inject(InsumosDataService);
    private _cdr = inject(ChangeDetectorRef);
    private _fb = inject(UntypedFormBuilder);

    alertas: Alerta[] = [];
    configuracoes: ConfiguracaoAlerta[] = [];
    insumos$: Observable<InsumoResponseDTO[]> = this._insumosService.insumos$;

    isLoading = false;
    configForm: UntypedFormGroup;
    selectedConfig: ConfiguracaoAlerta | null = null;
    showConfigForm = false;

    displayedColumnsAlertas = ['data', 'tipo', 'mensagem', 'severidade', 'acoes'];
    displayedColumnsConfigs = ['insumo', 'tipo', 'regra', 'status', 'acoes'];

    ngOnInit(): void {
        this.loadAlertas();
        this.loadConfigs();
        this.loadInsumos();
        this.initForm();
    }

    initForm(): void {
        this.configForm = this._fb.group({
            id: [null],
            insumoId: [null, [Validators.required]],
            tipoAlerta: ['VENCIMENTO_PROXIMO', [Validators.required]],
            diasAntecedenciaVencimento: [30, [Validators.min(1)]],
            ativo: [true]
        });
    }

    loadAlertas(): void {
        this.isLoading = true;
        this._alertasService.getAlertasAtivos()
            .pipe(finalize(() => {
                this.isLoading = false;
                this._cdr.markForCheck();
            }))
            .subscribe(alertas => this.alertas = alertas);
    }

    loadConfigs(): void {
        this._alertasService.getConfiguracoes()
            .subscribe(configs => {
                this.configuracoes = configs;
                this._cdr.markForCheck();
            });
    }

    loadInsumos(): void {
        this._insumosService.loadInsumos(0, 100);
    }

    marcarComoLido(alerta: Alerta): void {
        this._alertasService.marcarComoLido(alerta.id).subscribe(() => {
            this.loadAlertas();
        });
    }

    editConfig(config: ConfiguracaoAlerta): void {
        this.selectedConfig = config;
        this.configForm.patchValue(config);
        this.showConfigForm = true;
    }

    createNewConfig(): void {
        this.selectedConfig = null;
        this.configForm.reset({
            tipoAlerta: 'VENCIMENTO_PROXIMO',
            diasAntecedenciaVencimento: 30,
            ativo: true
        });
        this.showConfigForm = true;
    }

    saveConfig(): void {
        if (this.configForm.invalid) return;

        const config = this.configForm.value;
        this._alertasService.saveConfiguracao(config).subscribe(() => {
            this.loadConfigs();
            this.showConfigForm = false;
        });
    }

    deleteConfig(id: number): void {
        this._alertasService.deleteConfiguracao(id).subscribe(() => {
            this.loadConfigs();
        });
    }

    cancelConfig(): void {
        this.showConfigForm = false;
    }

    getSeverityClass(severity: string): string {
        switch (severity) {
            case 'CRITICA': return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-500';
            case 'ALTA': return 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-500';
            case 'MEDIA': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500';
            default: return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-500';
        }
    }
}
