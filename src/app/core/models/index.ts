// models/index.ts

// Re-exportar todos os tipos
export * from './auth.types';
export * from './estoque.types';
export * from './lote.types';
export * from './aprovacao.types';
export * from './dashboard.types';
export * from './relatorio.types';
export * from './insumo.catalog.types';
export * from './fornecedor.catalog.types';
export * from './almoxarifado-catalog.types';
export * from './setor.catalog.types';
export * from './unidade-medida.catalog.types';
export * from './empresa.catalog.types';
// Tipos utilitários
export interface PageableResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  timestamp: string;
  path: string;
}
