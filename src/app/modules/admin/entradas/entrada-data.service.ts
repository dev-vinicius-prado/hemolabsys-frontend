import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import {
    CreateEntradaDTO,
    EntradaResponseDTO,
    InsumoLoteResponseDTO,
} from './types/entrada.types';
import { ApiService } from 'app/core/api/api.service';

@Injectable({
    providedIn: 'root',
})
export class EntradaDataService {
    private readonly api = inject(ApiService);

    private _insumosLotes: BehaviorSubject<InsumoLoteResponseDTO[]> = new BehaviorSubject<InsumoLoteResponseDTO[]>([]);
    readonly insumosLotes$: Observable<InsumoLoteResponseDTO[]> = this._insumosLotes.asObservable();

    constructor() { }

    createEntrada(entrada: CreateEntradaDTO): Observable<EntradaResponseDTO> {
        return this.api.create<EntradaResponseDTO>('entradas', entrada).pipe(
            tap(() => this.getInsumosLotesDisponiveis().subscribe()) // Atualiza a lista após a criação
        );
    }

    // Método para buscar insumos e lotes disponíveis para seleção no formulário
    getInsumosLotesDisponiveis(): Observable<InsumoLoteResponseDTO[]> {
        // Esta é uma chamada de exemplo. A rota real da API pode variar.
        // Pode ser necessário um endpoint específico que retorne insumos com seus lotes e quantidades.
        const obs = this.api.list<InsumoLoteResponseDTO>(
            'insumos-lotes-disponiveis'
        ).pipe(
            tap(insumosLotes => this._insumosLotes.next(insumosLotes))
        );
        obs.subscribe(); // Dispara a busca e atualização do BehaviorSubject
        return obs;
    }
}
