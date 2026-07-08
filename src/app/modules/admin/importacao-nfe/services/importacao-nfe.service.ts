import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from 'app/core/api/api.service';
import { ImportacaoNfePendencia, ImportacaoNfeResumo, NfePreValidationResponse, ResolverPendenciaRequest } from 'app/core/models/importacao-nfe.types';

@Injectable({ providedIn: 'root' })
export class ImportacaoNfeService {
    private readonly _apiService = inject(ApiService);
    private readonly _http = inject(HttpClient);
    private readonly _basePath = 'v1/estoque/importacao-nfe';

    /**
     * Pré-validação de arquivo XML de NF-e
     */
    validarNfe(file: File): Observable<NfePreValidationResponse> {
        const formData = new FormData();
        formData.append('file', file);
        return this._apiService.post<NfePreValidationResponse>(`${this._basePath}/validate`, formData);
    }

    /**
     * Upload de arquivo XML de NF-e
     */
    uploadNfe(file: File): Observable<ImportacaoNfeResumo> {
        const formData = new FormData();
        formData.append('file', file);

        // Usamos HttpClient diretamente para lidar com FormData se necessário,
        // ou ApiService se ele suportar. O ApiService atual não tem helper para FormData.
        return this._apiService.post<ImportacaoNfeResumo>(`${this._basePath}/upload`, formData);
    }

    /**
     * Lista pendências de importação
     */
    listarPendencias(): Observable<ImportacaoNfePendencia[]> {
        return this._apiService.list<ImportacaoNfePendencia>(`${this._basePath}/pendencias`);
    }

    /**
     * Resolve uma pendência associando a um insumo interno
     */
    resolverPendencia(id: number, insumoId: number): Observable<void> {
        const request: ResolverPendenciaRequest = { insumoId };
        return this._apiService.post<void>(`${this._basePath}/pendencias/${id}/resolver`, request);
    }
}
