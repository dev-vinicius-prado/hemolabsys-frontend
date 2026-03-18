import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from 'app/core/api/api.service';
import { EstoqueInsumoConfigDTO, EstoqueInsumoResponseDTO, PageableResponse } from 'app/core/models';

@Injectable({
  providedIn: 'root'
})
export class EstoqueConfigService {
  private readonly _api = inject(ApiService);

  private readonly _configsSubject = new BehaviorSubject<EstoqueInsumoResponseDTO[]>([]);
  readonly configs$: Observable<EstoqueInsumoResponseDTO[]> = this._configsSubject.asObservable();

  private readonly _paginationSubject = new BehaviorSubject<PageableResponse<EstoqueInsumoResponseDTO> | null>(null);
  readonly pagination$: Observable<PageableResponse<EstoqueInsumoResponseDTO> | null> = this._paginationSubject.asObservable();

  loadConfigs(page: number = 0, size: number = 10): void {
    const params = { page, size, sort: 'insumo.descricao,asc' };

    this._api.get<PageableResponse<EstoqueInsumoResponseDTO>>('estoque-config', params).subscribe({
      next: (response) => {
        this._configsSubject.next(response?.content || []);
        this._paginationSubject.next(response);
      },
      error: (err) => console.error('Erro ao carregar configurações de estoque', err)
    });
  }

  saveConfig(config: EstoqueInsumoConfigDTO): Observable<EstoqueInsumoResponseDTO> {
    return this._api.post<EstoqueInsumoResponseDTO>('estoque-config', config).pipe(
      tap(() => this.loadConfigs())
    );
  }

  deleteConfig(id: number): Observable<boolean> {
    return this._api.remove<void>('estoque-config', id).pipe(
      tap(() => this.loadConfigs())
    );
  }
}
