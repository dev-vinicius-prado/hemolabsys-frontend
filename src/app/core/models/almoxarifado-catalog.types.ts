export interface AlmoxarifadoCreateDTO {
  codigo: string;
  descricao: string;
  empresaId: number;
  tipo: TipoServico;
}

export interface AlmoxarifadoUpdateDTO {
  id: number;
  codigo: string;
  descricao: string;
  empresaId: number;
  tipo: TipoServico;
  auditInfo: string;
}

export interface AlmoxarifadoResponseDTO {
  id: number;
  codigo: string;
  descricao: string;
  empresaId: number;
  empresaRazaoSocial?: string;
  tipo: TipoServico;
  auditInfo?: string;
}

export enum TipoServico {
  ALMOXARIFADO = 'ALMOXARIFADO',
  SERVICO_EAC = 'SERVICO_EAC',
  SERVICO_POSTO_COLETA = 'SERVICO_POSTO_COLETA',
  SERVICO_LABORATORIO_CENTRAL = 'SERVICO_LABORATORIO_CENTRAL'
}

export interface TipoServicoMetadata {
  value: TipoServico;
  sigla: string;
  label: string;
  descricao: string;
}

export const TIPO_SERVICO_METADATA: Record<TipoServico, TipoServicoMetadata> = {
  [TipoServico.ALMOXARIFADO]: {
    value: TipoServico.ALMOXARIFADO,
    sigla: 'ALM',
    label: 'Almoxarifado',
    descricao: 'Almoxarifado no serviço (Local físico onde estão guardados os insumos).'
  },
  [TipoServico.SERVICO_EAC]: {
    value: TipoServico.SERVICO_EAC,
    sigla: 'EAC',
    label: 'Almoxarifado',
    descricao: 'Pode executar EAC (Exames de Análises Clínicas) em farmácia, mas estoque controlado.'
  },
  [TipoServico.SERVICO_POSTO_COLETA]: {
    value: TipoServico.SERVICO_POSTO_COLETA,
    sigla: 'PC',
    label: 'Almoxarifado',
    descricao: 'Posto de coleta com estoque pequeno.'
  },
  [TipoServico.SERVICO_LABORATORIO_CENTRAL]: {
    value: TipoServico.SERVICO_LABORATORIO_CENTRAL,
    sigla: 'LC',
    label: 'Almoxarifado',
    descricao: 'Laboratório central com estoque maior.'
  }
};

export const TIPO_SERVICO_LIST: TipoServicoMetadata[] = Object.values(TIPO_SERVICO_METADATA);
