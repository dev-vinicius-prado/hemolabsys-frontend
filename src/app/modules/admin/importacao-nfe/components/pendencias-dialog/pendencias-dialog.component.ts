import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ImportacaoNfeService } from '../../services/importacao-nfe.service';
import { PendenciaImportacaoResponseDTO, StatusPendencia } from 'app/core/models';
import { ResolucaoDialogComponent } from '../resolucao-dialog/resolucao-dialog.component';

@Component({
    selector: 'app-pendencias-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatTableModule,
        MatTooltipModule,
        MatSnackBarModule
    ],
    templateUrl: './pendencias-dialog.component.html'
})
export class PendenciasDialogComponent implements OnInit {
    private readonly _dialogRef = inject(MatDialogRef<PendenciasDialogComponent>);
    private readonly _importacaoNfeService = inject(ImportacaoNfeService);
    private readonly _dialog = inject(MatDialog);
    private readonly _snackBar = inject(MatSnackBar);

    pendencias: PendenciaImportacaoResponseDTO[] = [];
    displayedColumns: string[] = ['item', 'produto', 'motivo', 'status', 'acoes'];

    constructor(@Inject(MAT_DIALOG_DATA) public data: { importacaoId: number }) {}

    ngOnInit(): void {
        this.carregarPendencias();
    }

    carregarPendencias(): void {
        this._importacaoNfeService.listarPendencias(this.data.importacaoId).subscribe({
            next: (pendencias) => {
                this.pendencias = pendencias;
            },
            error: () => {
                this._snackBar.open('Erro ao carregar pendências.', 'OK', { duration: 3000 });
            }
        });
    }

    resolver(pendencia: PendenciaImportacaoResponseDTO): void {
        this._dialog.open(ResolucaoDialogComponent, {
            width: '600px',
            data: { pendencia }
        }).afterClosed().subscribe(result => {
            if (result) {
                this.carregarPendencias();
                this._snackBar.open('Pendência resolvida com sucesso!', 'OK', { duration: 3000 });
            }
        });
    }

    fechar(): void {
        this._dialogRef.close();
    }
}
