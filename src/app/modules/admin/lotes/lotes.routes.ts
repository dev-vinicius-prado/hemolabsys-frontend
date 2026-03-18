import { Route } from '@angular/router';
import { LotesComponent } from './lotes.component';
import { EstoqueConfigComponent } from './estoque-config.component';

export default [
    {
        path     : '',
        component: LotesComponent
    },
    {
        path     : 'metas',
        component: EstoqueConfigComponent
    }
] as Route[];
