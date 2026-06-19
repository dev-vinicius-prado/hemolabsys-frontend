import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ApiService } from 'app/core/api/api.service';
import { 
    ImportacaoNfeResponseDTO, 
    PendenciaImportacaoResponseDTO, 
    ResolucaoPendenciaDTO,
    StatusImportacao
} from 'app/core/models';
import { environment } from 'app/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ImportacaoNfeService {
    private readonly _api = inject(ApiService);
    private readonly _http = inject(HttpClient);
    private readonly _baseUrl = environment.apiUrl;

    private readonly _importacoesSubject = new BehaviorSubject<ImportacaoNfeResponseDTO[]>([]);
    readonly importacoes$: Observable<ImportacaoNfeResponseDTO[]> = this._importacoesSubject.asObservable();

    /**
     * Inicia a importação de uma NF-e via upload de XML
     */
    upload(file: File, confirmacaoConferencia: boolean, idAlmoxarifado: number): Observable<ImportacaoNfeResponseDTO> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('confirmacaoConferencia', String(confirmacaoConferencia));
        formData.append('idAlmoxarifado', String(idAlmoxarifado));

        return this._http.post<ImportacaoNfeResponseDTO>(`${this._baseUrl}/importacao-nfe/upload`, formData).pipe(
            tap(response => {
                const current = this._importacoesSubject.getValue();
                this._importacoesSubject.next([response, ...current]);
            })
        );
    }

    /**
     * Lista o histórico de importações com filtros
     */
    listarHistorico(filters: {
        chaveAcesso?: string,
        status?: StatusImportacao,
        idFornecedor?: number,
        dataInicio?: string,
        dataFim?: string
    } = {}): Observable<ImportacaoNfeResponseDTO[]> {
        return this._api.list<ImportacaoNfeResponseDTO>('importacao-nfe/historico', filters).pipe(
            tap(importacoes => this._importacoesSubject.next(importacoes))
        );
    }

    /**
     * Obtém o relatório JSON detalhado de uma importação
     */
    obterRelatorio(id: number): Observable<string> {
        return this._api.get<string>(`importacao-nfe/${id}/relatorio`);
    }

    /**
     * Lista as pendências de uma importação
     */
    listarPendencias(id: number): Observable<PendenciaImportacaoResponseDTO[]> {
        return this._api.get<PendenciaImportacaoResponseDTO[]>(`importacao-nfe/${id}/pendencias`);
    }

    /**
     * Resolve uma pendência específica
     */
    resolverPendencia(idPendencia: number, resolucao: ResolucaoPendenciaDTO): Observable<ImportacaoNfeResponseDTO> {
        return this._api.post<ImportacaoNfeResponseDTO>(`importacao-nfe/pendencias/${idPendencia}/resolver`, resolucao).pipe(
            tap(updatedImportacao => {
                const current = this._importacoesSubject.getValue();
                const index = current.findIndex(i => i.id === updatedImportacao.id);
                if (index !== -1) {
                    current[index] = updatedImportacao;
                    this._importacoesSubject.next([...current]);
                }
            })
        );
    }

    /**
     * Reprocessa um item em Dead Letter
     */
    reprocessarDeadLetter(idDeadLetter: number): Observable<void> {
        return this._api.post<void>(`importacao-nfe/dead-letter/${idDeadLetter}/reprocessar`, {});
    }
}
