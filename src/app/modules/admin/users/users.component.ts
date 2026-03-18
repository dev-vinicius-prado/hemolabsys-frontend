import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subject, take, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ApiService } from 'app/core/api/api.service';
import { UserService } from 'app/core/user/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule } from '@ngneat/transloco';
import { PageableResponse, UsuarioResponseDTO, UsuarioCreateDTO, UsuarioUpdateDTO, Role } from 'app/core/models';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { HasRoleDirective } from 'app/shared/directives/has-role.directive';
import { AuditLog, AuditTimelineComponent } from 'app/shared/components/audit-timeline/audit-timeline.component';

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
        MatDialogModule,
        TranslocoModule,
        PaginationComponent,
        HasRoleDirective,
        AuditTimelineComponent
    ],
})
export class UsersComponent implements OnInit, OnDestroy
{
    private _apiService = inject(ApiService);
    private _userService = inject(UserService);
    private _formBuilder = inject(UntypedFormBuilder);
    private _snackBar = inject(MatSnackBar);
    private _fuseConfirmationService = inject(FuseConfirmationService);
    private _dialog = inject(MatDialog);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    users$: BehaviorSubject<UsuarioResponseDTO[]> = new BehaviorSubject<UsuarioResponseDTO[]>([]);
    pagination$: BehaviorSubject<PageableResponse<UsuarioResponseDTO> | null> = new BehaviorSubject<PageableResponse<UsuarioResponseDTO> | null>(null);

    currentPage: number = 0;
    pageSize: number = 5;

    mode: 'list' | 'create' | 'edit' | 'audit' = 'list';
    userForm: UntypedFormGroup;
    selectedUser: UsuarioResponseDTO | null = null;
    roles = Object.values(Role);
    auditLogs: AuditLog[] = [];

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

        // Buscar dados do usuário logado para obter a empresaId como fallback
         this._userService.user$.pipe(take(1)).subscribe((user) => {
             this.userForm.reset({
                role: 'ESTOQUISTA',
                ativo: true,
                empresaId: user?.empresaId || null
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
        const confirmation = this._fuseConfirmationService.open({
            title: 'Excluir Usuário',
            message: `Deseja excluir o usuário NOME: ${user.nome}? <br><b class="text-red-500">Esta ação não pode ser desfeita!</b>`,
            actions: {
                confirm: {
                    label: 'EXCLUIR',
                    color: 'warn'
                },
                cancel: {
                    label: 'Cancelar'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
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
        });
    }

    /**
     * View audit logs
     */
    viewAudit(user: UsuarioResponseDTO): void
    {
        this.selectedUser = user;
        this.mode = 'audit';
        this.auditLogs = [];
        this._changeDetectorRef.markForCheck();

        this._apiService.get<AuditLog[]>(`audit/user/${user.id}`).subscribe({
            next: (logs) => {
                this.auditLogs = logs;
                this._changeDetectorRef.markForCheck();
            },
            error: (err) => {
                this._snackBar.open('Erro ao carregar logs de auditoria', 'Fechar', { duration: 5000 });
                this.mode = 'list';
                this._changeDetectorRef.markForCheck();
            }
        });
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
