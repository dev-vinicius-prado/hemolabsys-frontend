import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { RoleGuard } from 'app/core/auth/guards/role.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { EntradaComponent } from 'app/modules/admin/entradas/entrada.component';
import { SaidaComponent } from 'app/modules/admin/saidas/saida.component';


// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: 'dashboard'},

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'dashboard'},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes')},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes')}
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes')}
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        // children: [
        //     {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},
        // ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'dashboard', loadChildren: () => import('app/modules/admin/dashboard/dashboard.routes') },
            { path: 'insumos', loadChildren: () => import('app/modules/admin/insumos/insumos.routes') },
            { path: 'setor', loadChildren: () => import('app/modules/admin/setor/setor.routes') },
            { path: 'lotes', loadChildren: () => import('app/modules/admin/lotes/lotes.routes') },
            { path: 'movimentacoes', loadChildren: () => import('app/modules/admin/movimentacoes/movimentacoes.routes') },
            { path: 'alertas', loadChildren: () => import('app/modules/admin/alertas/alertas.routes') },
            { path: 'entradas', component: EntradaComponent },
            { path: 'saidas', component: SaidaComponent },
            {
                path: 'users',
                loadComponent: () => import('app/modules/admin/users/users.component').then(m => m.UsersComponent),
                canActivate: [RoleGuard],
                data: { roles: ['ADMIN', 'GERENTE'] }
            },
            { path: 'profile', loadComponent: () => import('app/modules/admin/profile/profile.component').then(m => m.ProfileComponent) },
            {
                path: 'relatorios',
                loadComponent: () => import('app/modules/admin/relatorios/relatorios.component').then(m => m.RelatoriosComponent),
                canActivate: [RoleGuard],
                data: { roles: ['ADMIN', 'GERENTE', 'COORDENADOR'] }
            },
            // { path: 'preferencias', loadChildren: () => import('app/modules/admin/preferencias/preferencias.routes') },
        ]
    },
];
