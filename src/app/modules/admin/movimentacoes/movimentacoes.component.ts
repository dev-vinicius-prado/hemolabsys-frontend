import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { ApiService } from 'app/core/api/api.service';

type SituacaoAprovacao = 'PENDENTE' | 'APROVADO_COORDENADOR' | 'APROVADO_GERENTE' | 'REJEITADO';

interface MovimentacaoAprovacaoDTO {
    id: number;
    tipoMovimentacao: 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'DESCARTE';
    quantidade: number;
    dataRegistro: string;
    usuarioRegistro?: string;
    solicitante?: string;
    statusAprovacao?: SituacaoAprovacao;
    motivoRejeicao?: string;
    insumoCodigo?: string;
    insumoDescricao?: string;
    almoxarifadoCodigo?: string;
    loteNumero?: string;
}

@Component({
    selector: 'movimentacoes',
    templateUrl: './movimentacoes.component.html',
    styleUrls: ['./movimentacoes.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, FormsModule],
})
export class MovimentacoesComponent {
    private readonly api = inject(ApiService);
    private readonly cdr = inject(ChangeDetectorRef);

    private readonly itemsSubject = new BehaviorSubject<MovimentacaoAprovacaoDTO[]>([]);
    readonly items$ = this.itemsSubject.asObservable();

    status: SituacaoAprovacao | 'TODAS' = 'PENDENTE';
    loading = false;

    private readonly searchSubject = new BehaviorSubject<string>('');
    private _search = '';
    get search(): string {
        return this._search;
    }
    set search(v: string) {
        this._search = v ?? '';
        this.searchSubject.next(this._search);
    }

    readonly filtered$ = combineLatest([this.items$, this.searchSubject]).pipe(
        map(([items, term]) => {
            const t = (term ?? '').trim().toLowerCase();
            if (!t) return items;
            return items.filter((m) => {
                const hay = [
                    m.insumoCodigo,
                    m.insumoDescricao,
                    m.loteNumero,
                    m.almoxarifadoCodigo,
                    m.solicitante,
                    m.usuarioRegistro,
                    String(m.id ?? ''),
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return hay.includes(t);
            });
        })
    );

    ngOnInit(): void {
        this.reload();
    }

    reload(): void {
        this.loading = true;
        this.cdr.markForCheck();

        const params: any = { size: 200, sort: 'dataMovimentacao,desc' };
        if (this.status !== 'TODAS') {
            params.situacaoAprovacao = this.status;
        }

        this.api.get<any>('movimentacoes', params).subscribe({
            next: (page) => {
                const content = (page?.content ?? []) as MovimentacaoAprovacaoDTO[];
                this.itemsSubject.next(content);
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.itemsSubject.next([]);
                this.loading = false;
                this.cdr.markForCheck();
            },
        });
    }

    aprovar(item: MovimentacaoAprovacaoDTO, isGerente: boolean): void {
        this.api.post(`movimentacoes/${item.id}/aprovar?isGerente=${isGerente ? 'true' : 'false'}`, {}).subscribe({
            next: () => {
                this.reload();
            }
        });
    }

    rejeitar(item: MovimentacaoAprovacaoDTO): void {
        const motivo = prompt('Informe o motivo da rejeição:');
        if (motivo) {
            this.api.post(`movimentacoes/${item.id}/rejeitar?motivo=${encodeURIComponent(motivo)}`, {}).subscribe({
                next: () => {
                    this.reload();
                }
            });
        }
    }

    trackById(index: number, item: MovimentacaoAprovacaoDTO): number {
        return item.id;
    }
}

