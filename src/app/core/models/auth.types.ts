// auth.types.ts

export enum Role {
  ESTOQUISTA = 'ESTOQUISTA',
  COORDENADOR = 'COORDENADOR',
  GERENTE = 'GERENTE',
  ADMIN = 'ADMIN'
}

export interface CreateUserDTO {
  name: string;
  email: string;
  cpf: string;
  password: string;
  birthDate: string; // LocalDateTime convertido para ISO string
  phoneNumber?: string;
  role: Role;
}

export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  phoneNumber?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
