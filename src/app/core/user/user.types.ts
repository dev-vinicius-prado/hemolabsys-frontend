export interface User
{
    id: string;
    nome: string;
    email: string;
    avatar?: string;
    status?: string;
    role?: string;
    birthDate: string;
    phoneNumber: number;
    createdAt: string;
    updatedAt: string;
    active: boolean;
    empresaId: number;
}
