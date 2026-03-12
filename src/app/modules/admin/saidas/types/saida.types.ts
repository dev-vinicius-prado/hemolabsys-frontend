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
    loteId: number;
    quantidade: number;
    usuarioRegistroId?: number;
    solicitante: string;
}

export interface InsumoLoteSaidaResponseDTO {
    id: number;
    insumoId: number;
    nomeInsumo: string;
    numeroLote: string;
    dataValidade: string;
    quantidadeDisponivel: number;
    almoxarifadoId: number;
    almoxarifadoNome: string;
}