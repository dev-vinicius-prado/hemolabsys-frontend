import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ImportacaoNfeRelatorioDTO } from 'app/core/models';

@Component({
    selector: 'app-relatorio-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatTableModule
    ],
    templateUrl: './relatorio-dialog.component.html'
})
export class RelatorioDialogComponent implements OnInit {
    private readonly _dialogRef = inject(MatDialogRef<RelatorioDialogComponent>);
    
    relatorio: ImportacaoNfeRelatorioDTO | null = null;
    displayedColumns: string[] = ['item', 'produto', 'status', 'mensagem'];

    constructor(@Inject(MAT_DIALOG_DATA) public data: { relatorioJson: string }) {}

    ngOnInit(): void {
        if (this.data.relatorioJson) {
            try {
                this.relatorio = JSON.parse(this.data.relatorioJson);
            } catch (e) {
                console.error('Erro ao processar JSON do relatório', e);
            }
        }
    }

    fechar(): void {
        this._dialogRef.close();
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'SUCESSO': return 'text-green-600';
            case 'PENDENCIA': return 'text-orange-600';
            case 'FALHA': return 'text-red-600';
            default: return 'text-gray-600';
        }
    }
}
