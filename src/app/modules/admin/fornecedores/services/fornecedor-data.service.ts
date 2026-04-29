import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { FornecedorCreateDTO, FornecedorResponseDTO, FornecedorUpdateDTO } from 'app/core/models/fornecedor.catalog.types';

import { ApiService } from 'app/core/api/api.service';
import { PageableResponse } from 'app/core/models';

@Injectable({
  providedIn: 'root'
})
export class FornecedorDataService {
  private readonly api = inject(ApiService);

  private readonly _fornecedoresSubject = new BehaviorSubject<FornecedorResponseDTO[]>([]);
  readonly fornecedores$: Observable<FornecedorResponseDTO[]> = this._fornecedoresSubject.asObservable();

  constructor() { }

  loadFornecedores(page: number = 0, size: number = 10): void {
    this.api.get<PageableResponse<FornecedorResponseDTO>>(`fornecedores?page=${page}&size=${size}`).subscribe({
      next: (response) => {
        this._fornecedoresSubject.next(response.content || []);
      },
      error: (err) => console.error('Erro ao carregar fornecedores', err)
    });
  }

  getFornecedorById(id: number): Observable<FornecedorResponseDTO> {
    return this.api.get<FornecedorResponseDTO>(`fornecedores/${id}`);
  }

  createFornecedor(fornecedor: FornecedorCreateDTO): Observable<FornecedorResponseDTO> {
    return this.api.create<FornecedorResponseDTO>('fornecedores', fornecedor).pipe(
      tap((newFornecedor) => {
        const currentFornecedores = this._fornecedoresSubject.getValue();
        this._fornecedoresSubject.next([...currentFornecedores, newFornecedor]);
      })
    );
  }

  updateFornecedor(id: number, fornecedor: FornecedorUpdateDTO): Observable<FornecedorResponseDTO> {
    return this.api.update<FornecedorResponseDTO>(`fornecedores`, id, fornecedor).pipe(
      tap((updatedFornecedor) => {
        const currentFornecedores = this._fornecedoresSubject.getValue();
        const index = currentFornecedores.findIndex(f => f.id === id);
        if (index !== -1) {
          currentFornecedores[index] = updatedFornecedor;
          this._fornecedoresSubject.next([...currentFornecedores]);
        }
      })
    );
  }

  deleteFornecedor(id: number): Observable<boolean> {
    return this.api.remove<void>(`fornecedores`, id).pipe(
      tap(() => {
        const currentFornecedores = this._fornecedoresSubject.getValue();
        this._fornecedoresSubject.next(currentFornecedores.filter(f => f.id !== id));
      })
    );
  }

  toggleStatus(id: number): Observable<FornecedorResponseDTO> {
    return this.api.patch<FornecedorResponseDTO>(`fornecedores`, id, { status: 'TOGGLE' }).pipe(
      tap((updatedFornecedor) => {
        const currentFornecedores = this._fornecedoresSubject.getValue();
        const index = currentFornecedores.findIndex(f => f.id === id);
        if (index !== -1) {
          currentFornecedores[index] = updatedFornecedor;
          this._fornecedoresSubject.next([...currentFornecedores]);
        }
      })
    );
  }
}
