import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
    AlmoxarifadoOptionDTO,
    EntradaInsumoRequestDTO,
    FornecedorOptionDTO,
    InsumoOptionDTO,
    MovimentacaoResponseDTO,
} from './types/entrada.types';
import { ApiService } from 'app/core/api/api.service';

@Injectable({
    providedIn: 'root',
})
export class EntradaDataService {
    private readonly api = inject(ApiService);

    constructor() { }

    getInsumos(): Observable<InsumoOptionDTO[]> {
        return this.api.list<InsumoOptionDTO>('insumos', { size: 200, sort: 'codigo,asc' });
    }

    getAlmoxarifados(): Observable<AlmoxarifadoOptionDTO[]> {
        return this.api.list<AlmoxarifadoOptionDTO>('almoxarifados', { size: 200, sort: 'descricao,asc' });
    }

    getFornecedores(): Observable<FornecedorOptionDTO[]> {
        return this.api.list<FornecedorOptionDTO>('fornecedores', { size: 200, sort: 'nome,asc' });
    }

    createEntrada(entrada: EntradaInsumoRequestDTO): Observable<MovimentacaoResponseDTO> {
        return this.api.create<MovimentacaoResponseDTO>('movimentacoes/entrada', entrada);
    }
}
