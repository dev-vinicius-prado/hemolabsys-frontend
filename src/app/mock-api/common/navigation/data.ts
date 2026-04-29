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
        id: 'insumos',
        title: 'Insumos',
        type: 'basic',
        icon: 'heroicons_outline:beaker',
        link: '/insumos',
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
        meta: {
            roles: ['ADMIN', 'GERENTE', 'COORDENADOR']
        }
    },
    {
        id: 'configuracao',
        title: 'Configurações',
        type: 'collapsable',
        icon: 'heroicons_outline:adjustments-horizontal',
        children: [
            {
                id: 'alertas',
                title: 'Alertas',
                type: 'basic',
                icon: 'heroicons_outline:bell-alert',
                link: '/alertas',
            },
            {
                id: 'almoxarifado',
                title: 'Almoxarifados',
                type: 'basic',
                icon: 'heroicons_outline:home-modern',
                link: '/almoxarifado',
            },
            {
                id: 'insumos',
                title: 'Insumos',
                type: 'basic',
                icon: 'heroicons_outline:beaker',
                link: '/insumos',
            },
            {
                id: 'fornecedores',
                title: 'Fornecedores',
                type: 'basic',
                icon: 'heroicons_outline:truck',
                link: '/fornecedores',
            },
            {
                id: 'lotes',
                title: 'Lotes',
                type: 'basic',
                icon: 'heroicons_outline:rectangle-stack',
                link: '/lotes',
            },
            {
                id: 'metas-estoque',
                title: 'Metas de Estoque',
                type: 'basic',
                icon: 'heroicons_outline:presentation-chart-line',
                link: '/metas',
            },
            {
                id: 'setores',
                title: 'Setores',
                type: 'basic',
                icon: 'heroicons_outline:building-office-2',
                link: '/setor',
            },
            {
                id: 'preferencias',
                title: 'Preferências',
                type: 'collapsable',
                icon: 'heroicons_outline:cog-6-tooth',
                children: [
                    {
                        id: 'preferencias.empresa',
                        title: 'Empresas',
                        type: 'basic',
                        icon: 'heroicons_outline:building-office',
                        link: '/preferencias/empresa',
                    }
                ]
            },
            {
                id: 'users',
                title: 'Usuários',
                type: 'basic',
                icon: 'heroicons_outline:users',
                link: '/users',
                meta: {
                    roles: ['ADMIN', 'GERENTE']
                }
            },
        ],
    },
];
