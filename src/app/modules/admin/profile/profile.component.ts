import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule } from '@ngneat/transloco';
import { ApiService } from 'app/core/api/api.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { take } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector       : 'app-profile',
    templateUrl    : './profile.component.html',
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
        MatSnackBarModule,
        TranslocoModule
    ],
})
export class ProfileComponent implements OnInit
{
    private _apiService = inject(ApiService);
    private _formBuilder = inject(UntypedFormBuilder);
    private _snackBar = inject(MatSnackBar);
    private _userService = inject(UserService);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _router = inject(Router);

    profileForm: UntypedFormGroup;
    user: User;

    /**
     * Constructor
     */
    constructor()
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.profileForm = this._formBuilder.group({
            nome    : ['', [Validators.required]],
            email   : ['', [Validators.required, Validators.email]],
            cpf     : [{ value: '', disabled: true }],
            role    : [{ value: '', disabled: true }],
            senha   : [''],
        });

        // Get the user data
        this._userService.user$.pipe(take(1)).subscribe((user: User) => {
            this.user = user;
            this.profileForm.patchValue(user);
            this._changeDetectorRef.markForCheck();
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update the profile
     */
    updateProfile(): void
    {
        if ( this.profileForm.invalid )
        {
            return;
        }

        const formData = this.profileForm.getRawValue();

        // Remove password if empty
        if (!formData.senha) {
            delete formData.senha;
        }

        this._apiService.update('users/me', this.user.id, formData).subscribe({
            next: (response: any) => {
                this._snackBar.open('Perfil atualizado com sucesso!', 'OK', {
                    duration: 5000,
                    panelClass: ['success-snackbar'],
                });

                // Update the user service data
                this._userService.user = response;
            },
            error: (error) => {
                this._snackBar.open(`Erro ao atualizar perfil: ${error.message}`, 'Fechar', {
                    duration: 5000,
                    panelClass: ['error-snackbar'],
                });
            }
        });
    }

    /**
     * Cancel and go back to dashboard
     */
    cancel(): void
    {
        this._router.navigate(['/dashboard']);
    }
}
