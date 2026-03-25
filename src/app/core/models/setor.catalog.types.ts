export interface SetorCreateDTO {
  ativo: boolean;
  descricao?: string;
  empresaId: number;
  nome: string;
}

export interface SetorUpdateDTO {
  ativo: boolean;
  descricao?: string;
  empresaId: number;
  id: number;
  nome: string;
}

export interface SetorResponseDTO {
  ativo: boolean;
  descricao?: string;
  empresaId: number;
  id: number;
  nome: string;
}
