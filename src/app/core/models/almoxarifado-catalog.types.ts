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

export type TipoServico = 'ALMOXARIFADO' | 'SERVICO_EAC' | 'SERVICO_POSTO_COLETA' | 'SERVICO_LABORATORIO_CENTRAL';
