export enum StatusImportacao {
    PROCESSADA = 'PROCESSADA',
    PROCESSADA_PARCIALMENTE = 'PROCESSADA_PARCIALMENTE',
    ERRO = 'ERRO'
}

export interface ImportacaoNfeResumo {
    idImportacao: number;
    numeroNfe: string;
    cnpjFornecedor: string;
    status: StatusImportacao;
    totalItens: number;
    itensProcessados: number;
    itensPendentes: number;
    detalhes: ItemResumo[];
}

export interface ItemResumo {
    codigoExterno: string;
    descricao: string;
    status: 'PROCESSADO' | 'PENDENTE';
    mensagem: string;
}

export interface ImportacaoNfePendencia {
    id: number;
    idImportacao: number;
    numeroNfe: string;
    codigoExterno: string;
    descricaoExterna: string;
    quantidade: number;
    unidadeMedidaExterna: string;
    loteExterno?: string;
    dataValidade?: string;
    cnpjFornecedor: string;
    nomeFornecedor: string;
}

export interface ResolverPendenciaRequest {
    insumoId: number;
}

export interface NfePreValidationResponse {
    valid: boolean;
    steps: ValidationStep[];
    numeroNfe?: string;
    cnpjFornecedor?: string;
    nomeFornecedor?: string;
}

export interface ValidationStep {
    label: string;
    success: boolean;
    message?: string;
}
