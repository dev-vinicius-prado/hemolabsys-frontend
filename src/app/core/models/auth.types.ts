// auth.types.ts

export enum Role {
  ESTOQUISTA = 'ESTOQUISTA',
  COORDENADOR = 'COORDENADOR',
  GERENTE = 'GERENTE',
  ADMIN = 'ADMIN'
}

export interface UsuarioCreateDTO {
  cpf: string;
  email: string;
  nome: string;
  senha: string;
  telefone?: string;
  role: Role;
  empresaId: number;
}

export interface UsuarioUpdateDTO {
  id?: number;
  ativo?: boolean;
  cpf?: string;
  email?: string;
  nome?: string;
  senha?: string;
  telefone?: string;
  role?: Role;
}

export interface UsuarioResponseDTO {
  id: number;
  ativo: boolean;
  cpf: string;
  email: string;
  nome: string;
  telefone?: string;
  role: Role;
}
