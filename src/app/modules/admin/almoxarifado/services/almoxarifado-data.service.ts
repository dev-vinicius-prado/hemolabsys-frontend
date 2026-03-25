import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { ApiService } from '../../../../core/api/api.service';
import { AlmoxarifadoCreateDTO, AlmoxarifadoResponseDTO, AlmoxarifadoUpdateDTO, PageableResponse } from 'app/core/models';

@Injectable({
  providedIn: 'root'
})
export class AlmoxarifadoDataService {
  private readonly api = inject(ApiService);

  private readonly _almoxarifadosSubject = new BehaviorSubject<AlmoxarifadoResponseDTO[]>([]);
  readonly almoxarifados$: Observable<AlmoxarifadoResponseDTO[]> = this._almoxarifadosSubject.asObservable();

  private readonly _paginationSubject = new BehaviorSubject<PageableResponse<AlmoxarifadoResponseDTO> | null>(null);
  readonly pagination$: Observable<PageableResponse<AlmoxarifadoResponseDTO> | null> = this._paginationSubject.asObservable();

  constructor() { }

  loadAlmoxarifados(page: number = 0, size: number = 10, sort: string = 'descricao'): void {
    const params: any = { page, size, sort };

    this.api.get<PageableResponse<AlmoxarifadoResponseDTO>>('almoxarifados', params).subscribe({
      next: (response) => {
        this._almoxarifadosSubject.next(response?.content || []);
        this._paginationSubject.next(response);
      },
      error: (err) => console.error('Erro ao carregar almoxarifados', err)
    });
  }

  getAlmoxarifadoById(id: number): Observable<AlmoxarifadoResponseDTO> {
    return this.api.get<AlmoxarifadoResponseDTO>(`almoxarifados/${id}`);
  }

  createAlmoxarifado(almoxarifado: AlmoxarifadoCreateDTO): Observable<AlmoxarifadoResponseDTO> {
    return this.api.create<AlmoxarifadoResponseDTO>('almoxarifados', almoxarifado).pipe(
      tap((newAlmoxarifado) => {
        const currentAlmoxarifados = this._almoxarifadosSubject.getValue();
        this._almoxarifadosSubject.next([...currentAlmoxarifados, newAlmoxarifado]);
      })
    );
  }

  updateAlmoxarifado(id: number, almoxarifado: AlmoxarifadoUpdateDTO): Observable<AlmoxarifadoResponseDTO> {
    return this.api.update<AlmoxarifadoResponseDTO>('almoxarifados', id, almoxarifado).pipe(
      tap((updatedAlmoxarifado) => {
        const currentAlmoxarifados = this._almoxarifadosSubject.getValue();
        const updatedList = currentAlmoxarifados.map(a => a.id === updatedAlmoxarifado.id ? updatedAlmoxarifado : a);
        this._almoxarifadosSubject.next(updatedList);
      })
    );
  }

  deleteAlmoxarifado(id: number): Observable<boolean> {
    return this.api.remove<boolean>('almoxarifados', id).pipe(
      tap((success) => {
        if (success) {
          const currentAlmoxarifados = this._almoxarifadosSubject.getValue();
          const updatedList = currentAlmoxarifados.filter(a => a.id !== id);
          this._almoxarifadosSubject.next(updatedList);
        }
      })
    );
  }
}
