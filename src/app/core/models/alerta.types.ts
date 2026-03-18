export interface Alerta {
    id: number;
    insumoCodigo: string;
    insumoDescricao: string;
    almoxarifadoCodigo: string;
    loteCodigo: string;
    mensagem: string;
    severidade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    tipo: 'ESTOQUE_MINIMO' | 'ESTOQUE_MAXIMO' | 'VENCIMENTO_PROXIMO' | 'VENCIDO';
    dataCriacao: string;
    lido: boolean;
}

export interface ConfiguracaoAlerta {
    id?: number;
    insumoId: number;
    insumoNome?: string;
    tipoAlerta: 'ESTOQUE_MINIMO' | 'ESTOQUE_MAXIMO' | 'VENCIMENTO_PROXIMO' | 'VENCIDO';
    diasAntecedenciaVencimento: number;
    ativo: boolean;
}
