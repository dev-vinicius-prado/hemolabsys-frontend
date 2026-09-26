import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ExameService } from './services/exame.service';
import { ExameResponseDTO, ExameCreateDTO, KitExameInsumoCreateDTO } from './types/exame.types';
import { finalize } from 'rxjs';
import { InsumosDataService } from '../../insumos/services/insumos-data.service';
import { InsumoResponseDTO } from 'app/core/models/insumo.catalog.types';

@Component({
  selector: 'app-exames-list',
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
    MatDialogModule,
    MatCheckboxModule
  ],
  templateUrl: './exames-list.component.html',
})
export class ExamesListComponent implements OnInit {
  private readonly _exameService = inject(ExameService);
  private readonly _insumosService = inject(InsumosDataService);
  private readonly _snackBar = inject(MatSnackBar);

  exames = signal<ExameResponseDTO[]>([]);
  insumosDisponiveis = signal<InsumoResponseDTO[]>([]);
  isLoading = signal<boolean>(false);

  // Controle de estado da interface
  exameEmEdicao = signal<ExameResponseDTO | null>(null);
  mostrarFormNovoExame = signal<boolean>(false);
  mostrarFormVinculo = signal<boolean>(false);

  // Models para os forms (simplificado para MVP)
  novoExameModel: ExameCreateDTO = { nome: '', sigla: '', codigoIntegracao: '' };
  novoVinculoModel: KitExameInsumoCreateDTO = { idInsumo: 0, quantidadePadrao: 1, obrigatorio: true };

  ngOnInit(): void {
    this.carregarExames();
    this.carregarInsumos(); // Carrega insumos para o dropdown de vínculo
  }

  carregarExames(): void {
    this.isLoading.set(true);
    this._exameService.listarExames()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.exames.set(data),
        error: (err) => this._snackBar.open('Erro ao carregar exames', 'OK', { duration: 3000 })
      });
  }

  carregarInsumos(): void {
    this._insumosService.loadInsumos(0, 100);
    this._insumosService.insumos$.subscribe(data => {
        this.insumosDisponiveis.set(data);
    });
  }

  salvarNovoExame(): void {
    if (!this.novoExameModel.nome) return;

    this.isLoading.set(true);
    this._exameService.criarExame(this.novoExameModel)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (novo) => {
          this.exames.update(list => [...list, novo]);
          this.mostrarFormNovoExame.set(false);
          this.novoExameModel = { nome: '', sigla: '', codigoIntegracao: '' };
          this._snackBar.open('Exame criado com sucesso!', 'OK', { duration: 3000 });
        },
        error: (err) => this._snackBar.open('Erro ao criar exame', 'OK', { duration: 3000 })
      });
  }

  abrirVinculo(exame: ExameResponseDTO): void {
    this.exameEmEdicao.set(exame);
    this.mostrarFormVinculo.set(true);
    this.novoVinculoModel = { idInsumo: 0, quantidadePadrao: 1, obrigatorio: true };
  }

  salvarVinculo(): void {
    const exame = this.exameEmEdicao();
    if (!exame || !this.novoVinculoModel.idInsumo) return;

    this.isLoading.set(true);
    this._exameService.vincularInsumo(exame.id, this.novoVinculoModel)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (exameAtualizado) => {
          this.exames.update(list => list.map(e => e.id === exameAtualizado.id ? exameAtualizado : e));
          this.mostrarFormVinculo.set(false);
          this.exameEmEdicao.set(null);
          this._snackBar.open('Insumo vinculado com sucesso!', 'OK', { duration: 3000 });
        },
        error: (err) => this._snackBar.open(err.error?.message || 'Erro ao vincular insumo', 'OK', { duration: 3000 })
      });
  }
}
