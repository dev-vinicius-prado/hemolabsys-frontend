export interface KitColetaSugerido {
  idInsumo: number;
  ordemClsi: number;
  insumoNome: string;
  quantidadeNecessaria: number;
  loteSugeridoFefo: string;
}

export interface BaixaAssistidaRequest {
  idAtendimento: number;
  idInsumo: number;
  loteUtilizado: string;
  quantidadeUtilizada: number;
  houveDivergenciaFefo: boolean;
}
