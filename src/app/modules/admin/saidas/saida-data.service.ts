import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from 'app/core/api/api.service';
import {
    CreateSaidaDTO,
    SaidaResponseDTO,
    InsumoLoteSaidaResponseDTO,
    SetorOptionDTO,
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
        return this.api.create<SaidaResponseDTO>('movimentacoes/saida', saida).pipe(
             tap(() => {
                 // Refresh list if params are available, otherwise just clear
                 this._insumosLotesSaida.next([]);
             })
        );
    }

    getInsumosLotesDisponiveisParaSaida(insumoId: number, almoxarifadoId: number): Observable<InsumoLoteSaidaResponseDTO[]> {
        return this.api.list<InsumoLoteSaidaResponseDTO>(
            `estoque/lotes?insumoId=${insumoId}&almoxarifadoId=${almoxarifadoId}`
        ).pipe(
            tap(insumosLotes => this._insumosLotesSaida.next(insumosLotes))
        );
    }

    getSetores(): Observable<SetorOptionDTO[]> {
        return this.api.list<SetorOptionDTO>('setores', { size: 200, sort: 'nome,asc' });
    }
}
