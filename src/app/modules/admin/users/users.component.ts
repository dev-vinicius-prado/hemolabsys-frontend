import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subject, take, takeUntil } from 'rxjs';
import { ApiService } from 'app/core/api/api.service';
import { UserService } from 'app/core/user/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule } from '@ngneat/transloco';
import { PageableResponse, UsuarioResponseDTO, UsuarioCreateDTO, UsuarioUpdateDTO, Role } from 'app/core/models';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';

@Component({
    selector       : 'app-users',
    templateUrl    : './users.component.html',
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
        MatCheckboxModule,
        MatSnackBarModule,
        TranslocoModule,
        PaginationComponent
    ],
})
export class UsersComponent implements OnInit, OnDestroy
{
    private _apiService = inject(ApiService);
    private _userService = inject(UserService);
    private _formBuilder = inject(UntypedFormBuilder);
    private _snackBar = inject(MatSnackBar);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    users$: BehaviorSubject<UsuarioResponseDTO[]> = new BehaviorSubject<UsuarioResponseDTO[]>([]);
    pagination$: BehaviorSubject<PageableResponse<UsuarioResponseDTO> | null> = new BehaviorSubject<PageableResponse<UsuarioResponseDTO> | null>(null);

    currentPage: number = 0;
    pageSize: number = 10;

    mode: 'list' | 'create' | 'edit' = 'list';
    userForm: UntypedFormGroup;
    selectedUser: UsuarioResponseDTO | null = null;
    roles = Object.values(Role);
    isAdmin: boolean = false;

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
        // Subscribe to user changes to check role
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user) => {
            this.isAdmin = user.role === 'ADMIN';
            this._changeDetectorRef.markForCheck();
        });

        // Create the form
        this.userForm = this._formBuilder.group({
            nome    : ['', [Validators.required]],
            email   : ['', [Validators.required, Validators.email]],
            cpf     : ['', [Validators.required]],
            telefone: ['', [Validators.pattern('\\d{10,11}')]],
            role    : ['ESTOQUISTA', [Validators.required]],
            senha   : ['', [Validators.required, Validators.minLength(8)]],
            ativo   : [true],
            empresaId: [null]
        });

        // Load users
        this.loadUsers();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Load users
     */
    loadUsers(): void
    {
        const params = {
            page: this.currentPage,
            size: this.pageSize,
            sort: 'nome,asc'
        };

        this._apiService.get<PageableResponse<UsuarioResponseDTO>>('users', params).subscribe({
            next: (response) => {
                this.users$.next(response?.content || []);
                this.pagination$.next(response);
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Erro ao carregar usuários', error);
            }
        });
    }

    /**
     * Change page
     */
    onPageChange(page: number): void
    {
        this.currentPage = page;
        this.loadUsers();
    }

    /**
     * Change size
     */
    onSizeChange(size: number): void
    {
        this.pageSize = size;
        this.currentPage = 0;
        this.loadUsers();
    }

    /**
     * Create user
     */
    createUser(): void
    {
        this.mode = 'create';
        this.selectedUser = null;

        // Buscar dados do usuário logado para obter a empresaId
         this._userService.user$.pipe(take(1)).subscribe((user) => {
             this.userForm.reset({
                role: 'ESTOQUISTA',
                ativo: true,
                empresaId: user.empresaId
            });
            this.userForm.get('senha').setValidators([Validators.required, Validators.minLength(8)]);
            this.userForm.get('cpf').enable();
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Edit user
     */
    editUser(user: UsuarioResponseDTO): void
    {
        this.mode = 'edit';
        this.selectedUser = user;
        this.userForm.patchValue(user);
        this.userForm.get('senha').clearValidators();
        this.userForm.get('senha').setValidators([Validators.minLength(8)]);
        this.userForm.get('senha').updateValueAndValidity();
        this.userForm.get('cpf').disable(); // CPF não deve ser editado
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Save user
     */
    saveUser(): void
    {
        if ( this.userForm.invalid )
        {
            return;
        }

        const formData = this.userForm.getRawValue();

        if (this.mode === 'create') {
            this._apiService.post('users', formData).subscribe({
                next: () => {
                    this._snackBar.open('Usuário criado com sucesso!', 'OK', { duration: 5000 });
                    this.cancel();
                    this.loadUsers();
                },
                error: (err) => {
                    this._snackBar.open(`Erro ao criar usuário: ${err.message}`, 'Fechar', { duration: 5000 });
                }
            });
        } else {
            // Remove password if empty in edit mode
            if (!formData.senha) {
                delete formData.senha;
            }

            this._apiService.update('users', this.selectedUser.id, formData).subscribe({
                next: () => {
                    this._snackBar.open('Usuário atualizado com sucesso!', 'OK', { duration: 5000 });
                    this.cancel();
                    this.loadUsers();
                },
                error: (err) => {
                    this._snackBar.open(`Erro ao atualizar usuário: ${err.message}`, 'Fechar', { duration: 5000 });
                }
            });
        }
    }

    /**
     * Delete user
     */
    deleteUser(user: UsuarioResponseDTO): void
    {
        if (confirm(`Deseja realmente excluir o usuário ${user.nome}?`)) {
            this._apiService.remove('users', user.id).subscribe({
                next: () => {
                    this._snackBar.open('Usuário excluído com sucesso!', 'OK', { duration: 5000 });
                    this.loadUsers();
                },
                error: (err) => {
                    this._snackBar.open(`Erro ao excluir usuário: ${err.message}`, 'Fechar', { duration: 5000 });
                }
            });
        }
    }

    /**
     * Cancel
     */
    cancel(): void
    {
        this.mode = 'list';
        this.selectedUser = null;
        this._changeDetectorRef.markForCheck();
    }
}
