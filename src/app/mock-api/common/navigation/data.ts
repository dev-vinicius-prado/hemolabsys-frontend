/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/dashboard',
    },
    {
        id: 'entradas',
        title: 'Entradas',
        type: 'basic',
        icon: 'heroicons_outline:arrow-down-on-square',
        link: '/entradas',
    },
    {
        id: 'saidas',
        title: 'Saídas',
        type: 'basic',
        icon: 'heroicons_outline:arrow-up-on-square',
        link: '/saidas',
    },
    {
        id: 'movimentacao',
        title: 'Movimentações',
        type: 'basic',
        icon: 'heroicons_outline:arrow-path',
        link: '/movimentacoes',
    },
    {
        id: 'relatorios',
        title: 'Relatórios',
        type: 'basic',
        icon: 'heroicons_outline:document-chart-bar',
        link: '/relatorios',
    },
    {
        id: 'configuracao',
        title: 'Configurações',
        type: 'collapsable',
        icon: 'heroicons_outline:adjustments-horizontal',
        children: [
            {
                id: 'preferencias',
                title: 'Preferências',
                type: 'basic',
                link: '/preferencias',
                icon: 'heroicons_outline:cog-6-tooth',
            },
            {
                id: 'insumos',
                title: 'Insumos',
                type: 'basic',
                icon: 'heroicons_outline:archive-box',
                link: '/insumos',
            },
            {
                id: 'setor',
                title: 'Setores',
                type: 'basic',
                link: '/setor',
                icon: 'heroicons_outline:building-office',
            },
        ],
    },
];
