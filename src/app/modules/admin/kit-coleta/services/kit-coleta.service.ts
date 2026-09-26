import { inject, Injectable } from '@angular/core';
import { ApiService } from 'app/core/api/api.service';
import { Observable } from 'rxjs';
import { BaixaAssistidaRequest, KitColetaSugerido } from '../types/kit-coleta.types';

@Injectable({
  providedIn: 'root'
})
export class KitColetaService {
  private readonly _api = inject(ApiService);

  /**
   * Obtém a sugestão de kit (insumos e lotes) para um atendimento/exame.
   */
  obterKitSugerido(idAtendimento: number, idExame: number): Observable<KitColetaSugerido[]> {
    return this._api.get<KitColetaSugerido[]>(`v1/atendimentos/${idAtendimento}/kit-coleta`, { idExame });
  }

  /**
   * Registra a baixa assistida confirmando o lote utilizado.
   */
  registrarBaixaAssistida(request: BaixaAssistidaRequest): Observable<void> {
    return this._api.post<void>('v1/movimentacoes/baixa-assistida', request);
  }

  /**
   * Obtém a lista de lotes disponíveis para um insumo específico (usado na validação negativa).
   */
  obterLotesDisponiveis(insumoId: number, almoxarifadoId: number = 1): Observable<any[]> {
    return this._api.get<any[]>('estoque/lotes', { insumoId, almoxarifadoId });
  }
}
