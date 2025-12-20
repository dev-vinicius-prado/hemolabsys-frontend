// supplier.types.ts

export interface AddressDTO {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface ContactDTO {
  email: string;
  phone: string;
  cellPhone?: string;
}

export interface FornecedorCreateDTO {
  nome: string;
  cnpj: string;
//   address: AddressDTO;
//   contact: ContactDTO;
}

export interface FornecedorResponseDTO {
  id: number;
  nome: string;
  cnpj: string;
//   address: AddressDTO;
//   contact: ContactDTO;
auditInfo: string;
}
export interface FornecedorUpdateDTO {
  id: number;
  nome: string;
  cnpj: string;
//   address: AddressDTO;
//   contact: ContactDTO;
auditInfo: string;
}
