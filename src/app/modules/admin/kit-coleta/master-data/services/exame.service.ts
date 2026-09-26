import { inject, Injectable } from '@angular/core';
import { ApiService } from 'app/core/api/api.service';
import { Observable } from 'rxjs';
import { ExameCreateDTO, ExameResponseDTO, KitExameInsumoCreateDTO } from '../types/exame.types';

@Injectable({
  providedIn: 'root'
})
export class ExameService {
  private readonly _api = inject(ApiService);

  listarExames(): Observable<ExameResponseDTO[]> {
    return this._api.get<ExameResponseDTO[]>('v1/exames');
  }

  criarExame(exame: ExameCreateDTO): Observable<ExameResponseDTO> {
    return this._api.post<ExameResponseDTO>('v1/exames', exame);
  }

  vincularInsumo(idExame: number, vinculo: KitExameInsumoCreateDTO): Observable<ExameResponseDTO> {
    return this._api.post<ExameResponseDTO>(`v1/exames/${idExame}/insumos`, vinculo);
  }
}
