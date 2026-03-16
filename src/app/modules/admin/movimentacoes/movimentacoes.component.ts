import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable, Subject, take, takeUntil } from 'rxjs';
import { ApiService } from 'app/core/api/api.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from 'app/core/user/user.service';
import { PaginationComponent } from 'app/shared/components/pagination/pagination.component';
import { PageableResponse } from 'app/core/models';
import { HasRoleDirective } from 'app/shared/directives/has-role.directive';

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
    almoxarifadoTipo?: string;
    loteNumero?: string;
}

@Component({
    selector: 'app-movimentacoes',
    standalone: true,
    imports: [CommonModule, FormsModule, MatSnackBarModule, PaginationComponent, HasRoleDirective],
    templateUrl: './movimentacoes.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovimentacoesComponent implements OnInit, OnDestroy {
    private api = inject(ApiService);
    private cdr = inject(ChangeDetectorRef);
    private snackBar = inject(MatSnackBar);
    private userService = inject(UserService);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    itemsSubject = new BehaviorSubject<MovimentacaoAprovacaoDTO[]>([]);
    paginationSubject = new BehaviorSubject<PageableResponse<MovimentacaoAprovacaoDTO> | null>(null);

    items$ = this.itemsSubject.asObservable();
    pagination$ = this.paginationSubject.asObservable();

    loading = false;
    status = 'PENDENTE';

    currentPage: number = 0;
    pageSize: number = 10;

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

        const params = {
            situacaoAprovacao: this.status === 'TODAS' ? '' : this.status,
            page: this.currentPage,
            size: this.pageSize,
            sort: 'dataMovimentacao,desc'
        };

        this.api.get<PageableResponse<MovimentacaoAprovacaoDTO>>('movimentacoes', params).subscribe({
            next: (page) => {
                this.itemsSubject.next(page?.content || []);
                this.paginationSubject.next(page);
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.snackBar.open(`Erro ao carregar movimentações: ${err.message}`, 'Fechar', { duration: 5000 });
                this.itemsSubject.next([]);
                this.loading = false;
                this.cdr.markForCheck();
            }
        });
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.reload();
    }

    onSizeChange(size: number): void {
        this.pageSize = size;
        this.currentPage = 0;
        this.reload();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    aprovar(item: MovimentacaoAprovacaoDTO, isGerente: boolean): void {
        this.api.post(`movimentacoes/${item.id}/aprovar?isGerente=${isGerente ? 'true' : 'false'}`, {}).subscribe({
            next: () => {
                this.snackBar.open('Movimentação aprovada com sucesso!', 'OK', {
                    duration: 5000,
                    panelClass: ['success-snackbar'],
                });
                this.reload();
            },
            error: (err) => {
                this.snackBar.open(`Erro ao aprovar movimentação: ${err.message}`, 'Fechar', {
                    duration: 5000,
                    panelClass: ['error-snackbar'],
                });
            }
        });
    }

    rejeitar(item: MovimentacaoAprovacaoDTO): void {
        const motivo = window.prompt('Informe o motivo da rejeição:');
        if (motivo === null) return; // Cancelado pelo usuário

        if (!motivo.trim()) {
            this.snackBar.open('O motivo da rejeição é obrigatório.', 'OK', { duration: 3000 });
            return;
        }

        this.api.post(`movimentacoes/${item.id}/rejeitar?motivo=${encodeURIComponent(motivo)}`, {}).subscribe({
            next: () => {
                this.snackBar.open('Movimentação rejeitada com sucesso!', 'OK', {
                    duration: 5000,
                    panelClass: ['success-snackbar'],
                });
                this.reload();
            },
            error: (err) => {
                this.snackBar.open(`Erro ao rejeitar movimentação: ${err.message}`, 'Fechar', {
                    duration: 5000,
                    panelClass: ['error-snackbar'],
                });
            }
        });
    }

    trackById(index: number, item: MovimentacaoAprovacaoDTO): number {
        return item.id;
    }
}

