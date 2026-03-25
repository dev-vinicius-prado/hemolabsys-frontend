export interface SaidaResponseDTO {
    id: number;
    insumoId: number;
    loteId: number;
    quantidade: number;
    dataRegistro: string;
    usuarioRegistroId: number;
    solicitante: string;
}

export interface CreateSaidaDTO {
    insumoId: number;
    almoxarifadoId: number;
    codigoLote: string;
    quantidade: number;
    solicitante: string;
    idSetorSolicitante?: number;
    motivo?: string;
}

export interface SetorOptionDTO {
    id: number;
    nome: string;
}

export interface InsumoLoteSaidaResponseDTO {
    estoqueLoteId: number;
    loteId: number;
    insumoNome: string;
    codigoLote: string;
    dataValidade: string;
    quantidade: number;
    almoxarifadoNome: string;
}