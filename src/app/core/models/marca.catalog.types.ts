// Marca
export interface MarcaCreateDTO {
    nome: string;
}

export interface MarcaUpdateDTO {
    id: number;
    nome: string;
    audityInfo: string;
}

export interface MarcaResponseDTO {
    id: number;
    nome: string;
    audityInfo: string;
}
