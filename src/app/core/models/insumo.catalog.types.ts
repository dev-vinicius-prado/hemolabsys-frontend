import { FornecedorResponseDTO } from './fornecedor.catalog.types';
import { UnidadeMedidaResponseDTO } from './unidade-medida.catalog.types';

export type Categoria = 'ADMINISTRATIVO' | 'COLETA' | 'EXAME' | 'LIMPEZA' | 'PROTECAO' | 'OUTROS';

export interface InsumoCreateDTO {
  categoria: Categoria;
  codigo: string;
  descricao: string;
  fornecedorIds: number[];
  loteObrigatorio: boolean;
  perecivel: boolean;
  unidadeMedidaId: number;
}

export interface InsumoUpdateDTO {
  id: number;
  categoria: Categoria;
  codigo: string;
  descricao: string;
  fornecedorIds: number[];
  loteObrigatorio: boolean;
  perecivel: boolean;
  unidadeMedidaId: number;
}

export interface InsumoResponseDTO {
  auditInfo?: string;
  categoria: Categoria;
  codigo: string;
  descricao: string;
  fornecedores: FornecedorResponseDTO[];
  id: number;
  loteObrigatorio: boolean;
  perecivel: boolean;
  unidadeMedida: UnidadeMedidaResponseDTO;
}
