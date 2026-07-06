export enum StatusImportacao {
    PENDENTE = 'PENDENTE',
    PROCESSANDO = 'PROCESSANDO',
    IMPORTADA = 'IMPORTADA',
    PARCIALMENTE_IMPORTADA = 'PARCIALMENTE_IMPORTADA',
    FALHA_TECNICA = 'FALHA_TECNICA'
}

export enum StatusPendencia {
    PENDENTE = 'PENDENTE',
    RESOLVIDA = 'RESOLVIDA'
}

export enum MotivoPendencia {
    DEPARA_AUSENTE = 'DEPARA_AUSENTE',
    UNIDADE_MEDIDA_DIVERGENTE = 'UNIDADE_MEDIDA_DIVERGENTE',
    VALIDADE_VENCIDA = 'VALIDADE_VENCIDA',
    QUANTIDADE_INVALIDA = 'QUANTIDADE_INVALIDA',
    PERECIVEL_SEM_LOTE_VALIDADE = 'PERECIVEL_SEM_LOTE_VALIDADE'
}

export interface ImportacaoNfeResponseDTO {
    id: number;
    chaveAcesso: string;
    numeroNota: string;
    status: StatusImportacao;
    dataEmissao: string;
    nomeFornecedor: string;
    cnpjFornecedor: string;
    idAlmoxarifado: number;
    nomeAlmoxarifado: string;
    confirmacaoConferencia: boolean;
    createdAt: string;
}

export interface PendenciaImportacaoResponseDTO {
    id: number;
    itemNf: number;
    cprod: string;
    xprod: string;
    motivo: MotivoPendencia;
    status: StatusPendencia;
    dataResolucao?: string;
    usuarioResolucao?: string;
    fornecedorId: number;
}

export interface ResolucaoPendenciaDTO {
    idInsumo: number;
    unidadeComercialFornecedor: string;
    fatorConversao: number;
}

export interface ImportacaoNfeRelatorioDTO {
    chaveAcesso: string;
    totalItens: number;
    processadosSucesso: number;
    comPendencia: number;
    falhasTecnicas: number;
    itens: ItemRelatorioDTO[];
}

export interface ItemRelatorioDTO {
    itemNf: number;
    cProd: string;
    xProd: string;
    status: 'SUCESSO' | 'PENDENCIA' | 'FALHA';
    mensagem: string;
}
