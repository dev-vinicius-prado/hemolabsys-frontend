import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ValidationStep } from 'app/core/models/importacao-nfe.types';

@Component({
    selector: 'nfe-validation-dialog',
    templateUrl: './validation-dialog.component.html',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
})
export class NfeValidationDialogComponent implements OnInit {
    steps = signal<ValidationStep[]>([]);
    currentStepIndex = signal<number>(0);
    isValid = signal<boolean>(false);
    isValidating = signal<boolean>(true);

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { 
            steps: ValidationStep[], 
            valid: boolean,
            numeroNfe: string,
            nomeFornecedor: string
        },
        private _dialogRef: MatDialogRef<NfeValidationDialogComponent>
    ) {}

    ngOnInit(): void {
        this.startSequentialValidation();
    }

    /**
     * Simula a validação sequencial para feedback visual (checklist)
     */
    async startSequentialValidation(): Promise<void> {
        const targetSteps = this.data.steps;
        const displaySteps: ValidationStep[] = targetSteps.map(s => ({ ...s, success: false }));
        this.steps.set(displaySteps);

        for (let i = 0; i < targetSteps.length; i++) {
            this.currentStepIndex.set(i);
            await new Promise(resolve => setTimeout(resolve, 600)); // Delay para efeito visual
            
            displaySteps[i].success = targetSteps[i].success;
            displaySteps[i].message = targetSteps[i].message;
            this.steps.set([...displaySteps]);

            if (!targetSteps[i].success && i < 2) { // Erros críticos (XML ou Data) param o fluxo visual
                this.isValidating.set(false);
                this.isValid.set(false);
                return;
            }
        }

        this.isValidating.set(false);
        this.isValid.set(this.data.valid);
    }

    confirm(): void {
        this._dialogRef.close(true);
    }

    cancel(): void {
        this._dialogRef.close(false);
    }
}
