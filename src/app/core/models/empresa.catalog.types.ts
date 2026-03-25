export interface EmpresaCreateDTO {
  ativo: boolean;
  cnpj: string;
  idEmpresaMatriz?: number | null;
  indMatrizFilial: string; // 'M' ou 'F'
  nomeFantasia: string;
  razaoSocial: string;
}

export interface EmpresaUpdateDTO {
  id: number;
  ativo: boolean;
  cnpj: string;
  idEmpresaMatriz?: number | null;
  indMatrizFilial: string;
  nomeFantasia: string;
  razaoSocial: string;
}

export interface EmpresaResponseDTO {
  id: number;
  ativo: boolean;
  cnpj: string;
  idEmpresaMatriz?: number | null;
  indMatrizFilial: string;
  nomeFantasia: string;
  razaoSocial: string;
}
