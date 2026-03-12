import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from 'app/core/api/api.service';
import {
    CreateSaidaDTO,
    SaidaResponseDTO,
    InsumoLoteSaidaResponseDTO,
} from './types/saida.types';

@Injectable({
    providedIn: 'root',
})
export class SaidaDataService {
    private readonly api = inject(ApiService);

    private _insumosLotesSaida: BehaviorSubject<InsumoLoteSaidaResponseDTO[]> = new BehaviorSubject<InsumoLoteSaidaResponseDTO[]>([]);
    readonly insumosLotesSaida$: Observable<InsumoLoteSaidaResponseDTO[]> = this._insumosLotesSaida.asObservable();

    constructor() { }

    createSaida(saida: CreateSaidaDTO): Observable<SaidaResponseDTO> {
        return this.api.create<SaidaResponseDTO>('saidas', saida).pipe(
            tap(() => this.getInsumosLotesDisponiveisParaSaida().subscribe()) // Atualiza a lista após a criação
        );
    }

    getInsumosLotesDisponiveisParaSaida(): Observable<InsumoLoteSaidaResponseDTO[]> {
        const obs = this.api.list<InsumoLoteSaidaResponseDTO>(
            'insumos-lotes-disponiveis-saida'
        ).pipe(
            tap(insumosLotes => this._insumosLotesSaida.next(insumosLotes))
        );
        obs.subscribe();
        return obs;
    }
}