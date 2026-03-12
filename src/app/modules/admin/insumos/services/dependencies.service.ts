import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from '../../../../core/api/api.service';
import { AlmoxarifadoResponseDTO } from '../../../../core/models/almoxarifado-catalog.types';
import { FornecedorResponseDTO } from '../../../../core/models/fornecedor.catalog.types';
import { MarcaResponseDTO } from '../../../../core/models/marca.catalog.types';
import { TipoEmbalagemResponseDTO } from '../../../../core/models/tipo-embalagem.catalog.types';
import { UnidadeMedidaResponseDTO } from '../../../../core/models/unidade-medida.catalog.types';
import { PageableResponse } from 'app/core/models';

@Injectable({
  providedIn: 'root'
})
export class DependenciesService {
  private readonly api = inject(ApiService);

  private readonly _fornecedoresSubject = new BehaviorSubject<FornecedorResponseDTO[]>([]);
  readonly fornecedores$: Observable<FornecedorResponseDTO[]> = this._fornecedoresSubject.asObservable();

  private readonly _marcasSubject = new BehaviorSubject<MarcaResponseDTO[]>([]);
  readonly marcas$: Observable<MarcaResponseDTO[]> = this._marcasSubject.asObservable();

  private readonly _almoxarifadosSubject = new BehaviorSubject<AlmoxarifadoResponseDTO[]>([]);
  readonly almoxarifados$: Observable<AlmoxarifadoResponseDTO[]> = this._almoxarifadosSubject.asObservable();

  private readonly _tiposEmbalagemSubject = new BehaviorSubject<TipoEmbalagemResponseDTO[]>([]);
  readonly tiposEmbalagem$: Observable<TipoEmbalagemResponseDTO[]> = this._tiposEmbalagemSubject.asObservable();

  private readonly _unidadesMedidaSubject = new BehaviorSubject<UnidadeMedidaResponseDTO[]>([]);
  readonly unidadesMedida$: Observable<UnidadeMedidaResponseDTO[]> = this._unidadesMedidaSubject.asObservable();

  constructor() {
    this.loadFornecedores();
    this.loadMarcas();
    this.loadAlmoxarifados();
    this.loadTiposEmbalagem();
    this.loadUnidadesMedida();
  }

  loadFornecedores(): void {
    this.api.get<PageableResponse<FornecedorResponseDTO>>('fornecedores', { size: 1000 }).subscribe({
      next: (page) => this._fornecedoresSubject.next(page?.content || []),
      error: (err) => console.error('Erro ao carregar fornecedores', err)
    });
  }

  loadMarcas(): void {
    this.api.list<MarcaResponseDTO>('marcas').subscribe({
      next: (data) => this._marcasSubject.next(data || []),
      error: (err) => console.error('Erro ao carregar marcas', err)
    });
  }

  loadAlmoxarifados(): void {
    this.api.get<PageableResponse<AlmoxarifadoResponseDTO>>('almoxarifados', { size: 1000 }).subscribe({
      next: (page) => this._almoxarifadosSubject.next(page?.content || []),
      error: (err) => console.error('Erro ao carregar almoxarifados', err)
    });
  }

  loadTiposEmbalagem(): void {
    this.api.list<TipoEmbalagemResponseDTO>('tipos-embalagem').subscribe({
      next: (data) => this._tiposEmbalagemSubject.next(data || []),
      error: (err) => console.error('Erro ao carregar tipos de embalagem', err)
    });
  }

  loadUnidadesMedida(): void {
    this.api.get<PageableResponse<UnidadeMedidaResponseDTO>>('unidades-medida', { size: 1000 }).subscribe({
      next: (page) => this._unidadesMedidaSubject.next(page?.content || []),
      error: (err) => console.error('Erro ao carregar unidades de medida', err)
    });
  }
}
