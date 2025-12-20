// insumo-catalog.types.ts

export interface CreateInsumoDTO {
    codigo: string;
    descricao: string;
    loteObrigatorio: boolean;
    quantidade: number; // BigDecimal convertido para number
    fornecedorId?: number;
    marcaId?: number;
    almoxarifadoId?: number;
    tipoEmbalagemId?: number;
    unidadeMedidaId?: number;
}

export interface InsumoResponseDTO {
    id: number;
    codigo: string;
    descricao: string;
    loteObrigatorio: boolean;
    quantidade: number;
    fornecedorId?: number;
    fornecedorName?: string;
    marcaId?: number;
    marcaName?: string;
    almoxarifadoId?: number;
    almoxarifadoName?: string;
    tipoEmbalagemId?: number;
    tipoEmbalagemName?: string;
    unidadeMedidaId?: number;
    unidadeMedidaName?: string;
    auditInfo: any;
}
