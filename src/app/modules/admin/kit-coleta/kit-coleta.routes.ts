import { Routes } from '@angular/router';
import { KitColetaComponent } from './kit-coleta.component';
import { ExamesListComponent } from './master-data/exames-list.component';

export default [
  {
    path: '',
    component: KitColetaComponent
  },
  {
    path: 'exames',
    component: ExamesListComponent
  }
] as Routes;
