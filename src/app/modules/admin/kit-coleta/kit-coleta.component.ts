import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { KitColetaService } from './services/kit-coleta.service';
import { KitColetaSugerido, BaixaAssistidaRequest } from './types/kit-coleta.types';
import { finalize } from 'rxjs';

interface KitItemUi extends KitColetaSugerido {
  validado: boolean;
  editandoLote: boolean;
  lotesDisponiveis: any[];
  loteSelecionado: string;
}

@Component({
  selector: 'app-kit-coleta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './kit-coleta.component.html',
})
export class KitColetaComponent implements OnInit {
  private readonly _kitColetaService = inject(KitColetaService);
  private readonly _snackBar = inject(MatSnackBar);

  idAtendimento = signal<number | null>(10543);
  idExame = signal<number | null>(1); // Simulating an exam id for MVP

  isLoading = signal<boolean>(false);
  kitSugerido = signal<KitItemUi[]>([]);

  ngOnInit(): void {
    // In a real flow, idAtendimento would come from the route or previous screen
  }

  buscarSugestao(): void {
    const atendimentoId = this.idAtendimento();
    const exameId = this.idExame();

    if (!atendimentoId || !exameId) {
      this._snackBar.open('Informe o ID do Atendimento e Exame', 'OK', { duration: 3000 });
      return;
    }

    this.isLoading.set(true);
    this._kitColetaService.obterKitSugerido(atendimentoId, exameId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          const itemsUi = res.map(item => ({
            ...item,
            validado: false,
            editandoLote: false,
            lotesDisponiveis: [],
            loteSelecionado: item.loteSugeridoFefo
          }));
          this.kitSugerido.set(itemsUi);
        },
        error: (err) => {
          this._snackBar.open('Erro ao buscar sugestão de kit', 'OK', { duration: 3000 });
          console.error(err);
        }
      });
  }

  habilitarEdicaoLote(item: KitItemUi): void {
    item.editandoLote = true;
    if (item.lotesDisponiveis.length === 0) {
      this._kitColetaService.obterLotesDisponiveis(item.idInsumo)
        .subscribe({
          next: (lotes) => {
            item.lotesDisponiveis = lotes;
          },
          error: (err) => {
            this._snackBar.open('Erro ao buscar lotes', 'OK', { duration: 3000 });
          }
        });
    }
  }

  salvarEdicaoLote(item: KitItemUi): void {
    item.editandoLote = false;
  }

  confirmarBaixa(item: KitItemUi): void {
    const atendimentoId = this.idAtendimento();
    if (!atendimentoId) return;

    if (!item.loteSelecionado) {
      this._snackBar.open('Selecione um lote válido', 'OK', { duration: 3000 });
      return;
    }

    const request: BaixaAssistidaRequest = {
      idAtendimento: atendimentoId,
      idInsumo: item.idInsumo,
      loteUtilizado: item.loteSelecionado,
      quantidadeUtilizada: item.quantidadeNecessaria,
      houveDivergenciaFefo: item.loteSelecionado !== item.loteSugeridoFefo
    };

    this.isLoading.set(true);
    this._kitColetaService.registrarBaixaAssistida(request)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          item.validado = true;
          this._snackBar.open('Insumo validado com sucesso!', 'OK', { duration: 3000 });
        },
        error: (err) => {
          this._snackBar.open('Erro ao registrar baixa assistida', 'OK', { duration: 3000 });
          console.error(err);
        }
      });
  }
}
