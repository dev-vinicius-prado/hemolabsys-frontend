// Setor
export interface SetorCreateDTO {
  nome: string;
}

export interface SetorUpdateDTO {
  id: number;
  nome: string;
  audityInfo: string;
}

export interface SetorResponseDTO {
  id: number;
  nome: string;
  audityInfo: string;
}
