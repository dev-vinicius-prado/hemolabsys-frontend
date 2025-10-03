/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'rotina',
        title: 'Rotina',
        type : 'basic',
        icon: 'heroicons_outline:pencil-square',
        link : '/rotina'
    },
    {
        id   : 'estoque',
        title: 'Estoque',
        type : 'basic',
        icon: 'heroicons_outline:archive-box-arrow-down',
        link : '/estoque'
    },
    {
        id   : 'financeiro',
        title: 'Financeiro',
        type : 'basic',
        icon: 'heroicons_outline:banknotes',
        link : '/financeiro'
    },
    {
        id   : 'clinica',
        title: 'Clínica',
        type : 'basic',
        icon: 'heroicons_outline:beaker',
        link : '/clinica'
    },
    {
        id   : 'integracao',
        title: 'Integração',
        type : 'basic',
        icon: 'heroicons_outline:arrow-path-rounded-square',
        link : '/integracao'
    },
    {
        id   : 'configuracao',
        title: 'Configuracoes',
        type : 'collapsable',
        icon : 'heroicons_outline:adjustments-horizontal',
        children: [
            {
                id   : 'preferencias',
                title: 'Preferências',
                type : 'basic',
                link : '/preferencias',
                icon : 'heroicons_outline:cog-6-tooth'
            },
        ],
    }
];
