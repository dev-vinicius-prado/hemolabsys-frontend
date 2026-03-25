import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from 'app/core/api/api.service';
import { LoteCreateDTO, LoteResponseDTO } from 'app/core/models/lote.types';
import { PageableResponse } from 'app/core/models';

@Injectable({
  providedIn: 'root'
})
export class LotesDataService {
  private readonly _api = inject(ApiService);

  private readonly _lotesSubject = new BehaviorSubject<LoteResponseDTO[]>([]);
  readonly lotes$: Observable<LoteResponseDTO[]> = this._lotesSubject.asObservable();

  private readonly _paginationSubject = new BehaviorSubject<PageableResponse<LoteResponseDTO> | null>(null);
  readonly pagination$: Observable<PageableResponse<LoteResponseDTO> | null> = this._paginationSubject.asObservable();

  loadLotes(page: number = 0, size: number = 10): void {
    const params = { page, size, sort: 'dataValidade,asc' };

    this._api.get<PageableResponse<LoteResponseDTO>>('lotes', params).subscribe({
      next: (response) => {
        this._lotesSubject.next(response?.content || []);
        this._paginationSubject.next(response);
      },
      error: (err) => console.error('Erro ao carregar lotes', err)
    });
  }

  createLote(lote: LoteCreateDTO): Observable<LoteResponseDTO> {
    return this._api.post<LoteResponseDTO>('lotes', lote).pipe(
      tap(() => this.loadLotes())
    );
  }

  updateLote(id: number, lote: LoteCreateDTO): Observable<LoteResponseDTO> {
    return this._api.update<LoteResponseDTO>('lotes', id, lote).pipe(
      tap(() => this.loadLotes())
    );
  }

  deleteLote(id: number): Observable<boolean> {
    return this._api.remove<void>('lotes', id).pipe(
      tap(() => this.loadLotes())
    );
  }

  toggleStatus(id: number): Observable<LoteResponseDTO> {
    return this._api.patch<LoteResponseDTO>('lotes', `${id}/toggle-status`, {}).pipe(
      tap(() => this.loadLotes())
    );
  }
}
