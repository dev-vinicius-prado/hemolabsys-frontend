import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from 'app/core/api/api.service';
import { TranslocoModule } from '@ngneat/transloco';
import { HasRoleDirective } from 'app/shared/directives/has-role.directive';

@Component({
    selector       : 'app-relatorios',
    templateUrl    : './relatorios.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTabsModule,
        TranslocoModule,
        HasRoleDirective
    ],
})
export class RelatoriosComponent implements OnInit
{
    private _apiService = inject(ApiService);
    private _formBuilder = inject(UntypedFormBuilder);
    private _cdr = inject(ChangeDetectorRef);

    filterForm: UntypedFormGroup;
    setores: any[] = [];
    
    relatorioConsumo: any[] = [];
    relatorioEstoqueBaixo: any[] = [];
    
    loadingConsumo = false;
    loadingEstoque = false;

    ngOnInit(): void
    {
        this.filterForm = this._formBuilder.group({
            dataInicio: [new Date(new Date().setDate(new Date().getDate() - 30))],
            dataFim: [new Date()],
            setorId: [null]
        });

        this.loadSetores();
        this.gerarRelatorioEstoqueBaixo();
    }

    loadSetores(): void
    {
        this._apiService.get('setores').subscribe((res: any) => {
            this.setores = res.content || [];
            this._cdr.markForCheck();
        });
    }

    gerarRelatorioConsumo(): void
    {
        this.loadingConsumo = true;
        const filters = this.filterForm.getRawValue();
        
        // Formatar datas para YYYY-MM-DD
        const params = {
            dataInicio: filters.dataInicio.toISOString().split('T')[0],
            dataFim: filters.dataFim.toISOString().split('T')[0],
            setorId: filters.setorId || ''
        };

        this._apiService.get('relatorios/consumo', params).subscribe({
            next: (res: any) => {
                this.relatorioConsumo = res;
                this.loadingConsumo = false;
                this._cdr.markForCheck();
            },
            error: () => {
                this.loadingConsumo = false;
                this._cdr.markForCheck();
            }
        });
    }

    gerarRelatorioEstoqueBaixo(): void
    {
        this.loadingEstoque = true;
        this._apiService.get('relatorios/estoque-baixo').subscribe({
            next: (res: any) => {
                this.relatorioEstoqueBaixo = res;
                this.loadingEstoque = false;
                this._cdr.markForCheck();
            },
            error: () => {
                this.loadingEstoque = false;
                this._cdr.markForCheck();
            }
        });
    }
}
