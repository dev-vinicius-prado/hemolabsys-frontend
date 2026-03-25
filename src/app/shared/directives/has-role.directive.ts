import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';

/**
 * Diretiva estrutural para controle de acesso baseado em roles.
 * Uso: *hasRole="['ADMIN', 'GERENTE']"
 */
@Directive({
    selector: '[hasRole]',
    standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
    private _templateRef = inject(TemplateRef<any>);
    private _viewContainer = inject(ViewContainerRef);
    private _userService = inject(UserService);

    private _roles: string[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _isHidden = true;

    @Input()
    set hasRole(value: string | string[]) {
        this._roles = Array.isArray(value) ? value : [value];
        this._updateView();
    }

    ngOnInit(): void {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._updateView();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private _updateView(): void {
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user) => {
            if (!user || !user.role) {
                this._viewContainer.clear();
                this._isHidden = true;
                return;
            }

            const hasPermission = this._roles.includes(user.role);

            if (hasPermission && this._isHidden) {
                this._viewContainer.createEmbeddedView(this._templateRef);
                this._isHidden = false;
            } else if (!hasPermission && !this._isHidden) {
                this._viewContainer.clear();
                this._isHidden = true;
            }
        });
    }
}
