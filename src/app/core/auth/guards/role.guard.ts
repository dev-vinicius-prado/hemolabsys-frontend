import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { map, take } from 'rxjs';

/**
 * Guard para proteção de rotas baseado em roles.
 * Uso nas rotas: data: { roles: ['ADMIN', 'GERENTE'] }
 */
export const RoleGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const router: Router = inject(Router);
    const userService: UserService = inject(UserService);
    const expectedRoles = route.data.roles as string[];

    return userService.user$.pipe(
        take(1),
        map((user) => {
            if (!user || !user.role || (expectedRoles && !expectedRoles.includes(user.role))) {
                // Se não tiver permissão, redireciona para o dashboard ou outra página segura
                router.navigate(['/dashboard']);
                return false;
            }
            return true;
        })
    );
};
