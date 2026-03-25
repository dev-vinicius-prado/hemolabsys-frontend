import { Routes } from '@angular/router';

export default [
    {
        path: 'empresa',
        loadChildren: () => import('app/modules/admin/preferencias/empresa/empresa.routes'),
    },
] as Routes;
