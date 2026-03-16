import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, take } from 'rxjs';
import { ApiService } from 'app/core/api/api.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from 'app/core/user/user.service';

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
    imports: [CommonModule, FormsModule, MatSnackBarModule],
    templateUrl: './movimentacoes.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovimentacoesComponent {
    private api = inject(ApiService);
    private cdr = inject(ChangeDetectorRef);
    private snackBar = inject(MatSnackBar);
    private userService = inject(UserService);

    itemsSubject = new BehaviorSubject<MovimentacaoAprovacaoDTO[]>([]);
    items$ = this.itemsSubject.asObservable();
    loading = false;
    status = 'PENDENTE';
    userRole = '';

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
        this.userService.user$.pipe(take(1)).subscribe(user => {
            this.userRole = user.role || '';
        });
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

