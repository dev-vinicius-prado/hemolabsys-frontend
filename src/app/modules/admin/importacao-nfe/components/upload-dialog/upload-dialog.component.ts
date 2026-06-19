import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AlmoxarifadoDataService } from 'app/modules/admin/almoxarifado/services/almoxarifado-data.service';
import { ImportacaoNfeService } from '../../services/importacao-nfe.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-upload-dialog',
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
        MatCheckboxModule
    ],
    templateUrl: './upload-dialog.component.html'
})
export class UploadDialogComponent {
    private readonly _dialogRef = inject(MatDialogRef<UploadDialogComponent>);
    private readonly _fb = inject(UntypedFormBuilder);
    private readonly _almoxarifadoService = inject(AlmoxarifadoDataService);
    private readonly _importacaoNfeService = inject(ImportacaoNfeService);

    uploadForm = this._fb.group({
        file: [null, Validators.required],
        idAlmoxarifado: [null, Validators.required],
        confirmacaoConferencia: [false, Validators.requiredTrue]
    });

    almoxarifados$ = this._almoxarifadoService.almoxarifados$;
    selectedFileName = '';
    isLoading = false;

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFileName = file.name;
            this.uploadForm.patchValue({ file });
        }
    }

    upload(): void {
        if (this.uploadForm.invalid) return;

        this.isLoading = true;
        const { file, idAlmoxarifado, confirmacaoConferencia } = this.uploadForm.value;

        this._importacaoNfeService.upload(file, confirmacaoConferencia, idAlmoxarifado)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: (response) => {
                    this._dialogRef.close(response);
                },
                error: (error) => {
                    // Erros de negócio são tratados pelo interceptor ou podem ser mostrados aqui
                    console.error('Erro no upload', error);
                }
            });
    }

    cancelar(): void {
        this._dialogRef.close();
    }
}
