import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from '../../../../core/api/api.service';
import { InsumoCreateDTO, InsumoResponseDTO, InsumoUpdateDTO, PageableResponse } from 'app/core/models';

@Injectable({
  providedIn: 'root'
})
export class InsumosDataService {
  private readonly api = inject(ApiService);

  private readonly _insumosSubject = new BehaviorSubject<InsumoResponseDTO[]>([]);
  readonly insumos$: Observable<InsumoResponseDTO[]> = this._insumosSubject.asObservable();

  constructor() { }

  loadInsumos(): void {
    this.api.get<PageableResponse<InsumoResponseDTO>>('insumos', { size: 1000 }).subscribe({
      next: (page) => this._insumosSubject.next(page?.content || []),
      error: (err) => console.error('Erro ao carregar insumos', err)
    });
  }

  createInsumo(insumo: InsumoCreateDTO): Observable<InsumoResponseDTO> {
    return this.api.create<InsumoResponseDTO>('insumos', insumo).pipe(
      tap((newInsumo) => {
        const currentInsumos = this._insumosSubject.getValue();
        this._insumosSubject.next([...currentInsumos, newInsumo]);
      })
    );
  }

  updateInsumo(id: number, insumo: InsumoUpdateDTO): Observable<InsumoResponseDTO> {
    return this.api.update<InsumoResponseDTO>('insumos', id, insumo).pipe(
      tap((updatedInsumo) => {
        const currentInsumos = this._insumosSubject.getValue();
        const updatedList = currentInsumos.map(i => i.id === updatedInsumo.id ? updatedInsumo : i);
        this._insumosSubject.next(updatedList);
      })
    );
  }

  deleteInsumo(id: number): Observable<boolean> {
    return this.api.remove<boolean>('insumos', id).pipe(
      tap((success) => {
        if (success) {
          const currentInsumos = this._insumosSubject.getValue();
          const updatedList = currentInsumos.filter(i => i.id !== id);
          this._insumosSubject.next(updatedList);
        }
      })
    );
  }
}
