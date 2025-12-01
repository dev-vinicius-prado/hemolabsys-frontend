/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Dashboard',
        type : 'basic',
        icon: 'heroicons_outline:chart-pie',
        link : '/dashboard'
    },
    {
        id   : 'produtos',
        title: 'Produtos',
        type : 'basic',
        icon: 'heroicons_outline:archive-box-arrow-down',
        link : '/produtos'
    },
    {
        id   : 'entradas',
        title: 'Entradas',
        type : 'basic',
        icon: 'heroicons_outline:arrow-down-on-square',
        link : '/entradas'
    },
    {
        id   : 'saidas',
        title: 'Saídas',
        type : 'basic',
        icon: 'heroicons_outline:arrow-up-on-square',
        link : '/saidas'
    },
    {
        id   : 'relatorios',
        title: 'Relatórios',
        type : 'basic',
        icon: 'heroicons_outline:document-chart-bar',
        link : '/relatorios'
    },
    {
        id   : 'configuracao',
        title: 'Configurações',
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
