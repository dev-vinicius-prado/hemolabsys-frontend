import { inject, Injectable } from '@angular/core';
import { ApiService } from 'app/core/api/api.service';
import { Observable } from 'rxjs';
import { Alerta, ConfiguracaoAlerta } from '../models/alerta.types';

@Injectable({
    providedIn: 'root'
})
export class AlertasService {
    private _api = inject(ApiService);

    getAlertasAtivos(): Observable<Alerta[]> {
        return this._api.get<Alerta[]>('alertas/ativos');
    }

    marcarComoLido(id: number): Observable<void> {
        return this._api.post<void>(`alertas/${id}/marcar-lido`, {});
    }

    getConfiguracoes(): Observable<ConfiguracaoAlerta[]> {
        return this._api.get<ConfiguracaoAlerta[]>('alertas/configuracoes');
    }

    saveConfiguracao(config: ConfiguracaoAlerta): Observable<ConfiguracaoAlerta> {
        return this._api.post<ConfiguracaoAlerta>('alertas/configuracoes', config);
    }

    deleteConfiguracao(id: number): Observable<boolean> {
        return this._api.remove<boolean>('alertas/configuracoes', id);
    }
}
