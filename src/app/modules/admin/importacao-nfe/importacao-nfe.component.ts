import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { FuseAlertComponent } from '@fuse/components/alert';
import { ImportacaoNfeService } from './services/importacao-nfe.service';
import { ImportacaoNfeResponseDTO, StatusImportacao } from 'app/core/models';
import { Observable } from 'rxjs';
import { AlmoxarifadoDataService } from '../almoxarifado/services/almoxarifado-data.service';
import { UploadDialogComponent } from './components/upload-dialog/upload-dialog.component';
import { RelatorioDialogComponent } from './components/relatorio-dialog/relatorio-dialog.component';
import { NotificationService } from 'app/core/services/notification.service';

@Component({
    selector: 'app-importacao-nfe',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatDialogModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatInputModule,
        FuseAlertComponent
    ],
    templateUrl: './importacao-nfe.component.html',
})
export class ImportacaoNfeComponent implements OnInit {
    private readonly _importacaoNfeService = inject(ImportacaoNfeService);
    private readonly _almoxarifadoService = inject(AlmoxarifadoDataService);
    private readonly _dialog = inject(MatDialog);
    private readonly _notificationService = inject(NotificationService);
    private readonly _router = inject(Router);

    importacoes$: Observable<ImportacaoNfeResponseDTO[]> = this._importacaoNfeService.importacoes$;
    almoxarifados$ = this._almoxarifadoService.almoxarifados$;

    displayedColumns: string[] = ['data', 'nota', 'fornecedor', 'status', 'acoes'];

    // Filtros
    filters = {
        chaveAcesso: '',
        status: null as StatusImportacao | null,
        dataInicio: null as string | null,
        dataFim: null as string | null
    };

    statusOptions = Object.values(StatusImportacao);

    ngOnInit(): void {
        // Delay the initial data load to avoid NG0100 error with the global loading bar
        setTimeout(() => {
            this._importacaoNfeService.listarHistorico().subscribe();
            this._almoxarifadoService.loadAlmoxarifados();
        });
    }

    aplicarFiltros(): void {
        this._importacaoNfeService.listarHistorico(this.filters).subscribe();
    }

    abrirUpload(): void {
        this._dialog.open(UploadDialogComponent, {
            width: '500px',
            disableClose: true
        }).afterClosed().subscribe(result => {
            if (result) {
                this._notificationService.success('Importação iniciada com sucesso! O processamento ocorre em segundo plano.');
                this._importacaoNfeService.listarHistorico().subscribe();
            }
        });
    }

    verRelatorio(id: number): void {
        this._importacaoNfeService.obterRelatorio(id).subscribe({
            next: (relatorioJson) => {
                this._dialog.open(RelatorioDialogComponent, {
                    width: '800px',
                    data: { relatorioJson }
                });
            },
            error: () => {
                this._notificationService.error('Não foi possível carregar o relatório.');
            }
        });
    }

    verPendencias(id: number): void {
        this._router.navigate(['/importacao-nfe', id, 'pendencias']);
    }

    getStatusColor(status: StatusImportacao): string {
        switch (status) {
            case StatusImportacao.IMPORTADA: return 'text-green-600 bg-green-100';
            case StatusImportacao.PROCESSANDO: return 'text-blue-600 bg-blue-100';
            case StatusImportacao.PARCIALMENTE_IMPORTADA: return 'text-orange-600 bg-orange-100';
            case StatusImportacao.FALHA_TECNICA: return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    }
}
