export interface EntradaResponseDTO {
    id: number;
    insumoId: number;
    loteId: number;
    quantidade: number;
    dataRegistro: string; // ou Date, dependendo da serialização da API
    usuarioRegistroId: number;
    // Adicionar outros campos relevantes que a API possa retornar
}

export interface CreateEntradaDTO {
    insumoId: number;
    loteId: number;
    quantidade: number;
    usuarioRegistroId?: number; // Pode ser preenchido no backend
}

export interface InsumoLoteResponseDTO {
    id: number;
    insumoId: number;
    nomeInsumo: string;
    numeroLote: string;
    dataValidade: string; // ou Date
    quantidadeDisponivel: number;
    almoxarifadoId: number;
    almoxarifadoNome: string;
    // Adicionar outros campos que ajudem na seleção e exibição
}
