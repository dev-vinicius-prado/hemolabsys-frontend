// Setor
export interface SetorCreateDTO {
  nome: string;
}

export interface SetorUpdateDTO {
  id: number;
  nome: string;
  auditInfo: string;
}

export interface SetorResponseDTO {
  id: number;
  nome: string;
  auditInfo: string;
}
