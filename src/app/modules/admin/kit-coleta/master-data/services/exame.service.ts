import { inject, Injectable } from '@angular/core';
import { ApiService } from 'app/core/api/api.service';
import { Observable } from 'rxjs';
import { ExameCreateDTO, ExameResponseDTO, KitExameInsumoCreateDTO } from '../types/exame.types';
import { PageableResponse } from 'app/core/models';

@Injectable({
  providedIn: 'root'
})
export class ExameService {
  private readonly _api = inject(ApiService);

  listarExames(page: number = 0, size: number = 10, nome?: string): Observable<PageableResponse<ExameResponseDTO>> {
    const params: any = { page, size };
    if (nome) {
      params.nome = nome;
    }
    return this._api.get<PageableResponse<ExameResponseDTO>>('v1/exames', params);
  }

  criarExame(exame: ExameCreateDTO): Observable<ExameResponseDTO> {
    return this._api.post<ExameResponseDTO>('v1/exames', exame);
  }

  vincularInsumo(idExame: number, vinculo: KitExameInsumoCreateDTO): Observable<ExameResponseDTO> {
    return this._api.post<ExameResponseDTO>(`v1/exames/${idExame}/insumos`, vinculo);
  }
}
