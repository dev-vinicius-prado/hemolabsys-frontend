import { Routes } from '@angular/router';
import { ImportacaoNfeComponent } from './importacao-nfe.component';

export default [
    {
        path: '',
        component: ImportacaoNfeComponent,
    },
    {
        path: ':id/pendencias',
        loadComponent: () => import('./pages/pendencias-list/pendencias-list.component').then(m => m.PendenciasListComponent),
    },
] as Routes;
