export interface InsumoOptionDTO {
    id: number;
    codigo: string;
    descricao: string;
    loteObrigatorio: boolean;
    perecivel: boolean;
}

export interface AlmoxarifadoOptionDTO {
    id: number;
    codigo: string;
    descricao: string;
}

export interface FornecedorOptionDTO {
    id: number;
    nome: string;
    cnpj: string;
    ativo: boolean;
}

export interface EntradaInsumoRequestDTO {
    insumoId: number;
    almoxarifadoId: number;
    fornecedorId: number;
    quantidade: number;
    numeroLote: string;
    dataFabricacao?: string;
    dataValidade: string;
    numeroNotaFiscal: string;
}

export interface MovimentacaoResponseDTO {
    id: number;
    tipo?: string;
    quantidade?: number;
}
