export interface ContractResource {
  id: number;
  code: string;
  cnpj: string;
  dateInitialMet: Date;
  fantasyName: string;
  vigence: VigenceResource;
  scope: string;
  degreeRiskLevel: string;
  contractManager: ContractManagerResource;
  matrixOfResponsability: MatrixOfResponsabilityResource[];
  contractor: ContractorResource;
  // todo: add others fields for contract resource
}

export interface ContractManagerResource {
  name: string;
  email: string;
  phoneNumber: string;
}

export interface MatrixOfResponsabilityResource {
  name: string;
  function: string;
  email: string;
}

export interface ContractorResource {
  name: string;
}
export interface VigenceResource {
  startAt: Date;
  finishAt?: Date;
}
