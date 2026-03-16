import { inject, Injectable } from '@angular/core';
import { ApiService } from 'app/core/api/api.service';
import { EstoqueTotalResponseDTO } from 'app/core/models/estoque.types';
import { EstoqueLoteResponseDTO } from 'app/core/models/lote.types';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EstoqueService {
    private readonly api = inject(ApiService);

    getAlertasVencimento(dias: number = 30): Observable<EstoqueLoteResponseDTO[]> {
        return this.api.list<EstoqueLoteResponseDTO>('estoque/alertas/vencimento', { dias: dias });
    }

    getAlertasBaixoEstoque(): Observable<EstoqueTotalResponseDTO[]> {
        return this.api.list<EstoqueTotalResponseDTO>('estoque/alertas/baixo-estoque');
    }

    getConsumoSemanal(): Observable<any[]> {
        return this.api.get<any[]>('movimentacoes/estatisticas/consumo-semanal');
    }

    getDashboardStats(): Observable<any> {
        return this.api.get<any>('dashboard/estatisticas');
    }
}
