import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from '../../../../../core/api/api.service';
import { EmpresaCreateDTO, EmpresaResponseDTO, EmpresaUpdateDTO } from 'app/core/models';

@Injectable({
  providedIn: 'root'
})
export class EmpresaDataService {
  private readonly api = inject(ApiService);

  private readonly _empresasSubject = new BehaviorSubject<EmpresaResponseDTO[]>([]);
  readonly empresas$: Observable<EmpresaResponseDTO[]> = this._empresasSubject.asObservable();

  constructor() { }

  loadEmpresas(): void {
    this.api.get<EmpresaResponseDTO[]>('empresas').subscribe({
      next: (response) => {
        this._empresasSubject.next(response || []);
      },
      error: (err) => console.error('Erro ao carregar empresas', err)
    });
  }

  getEmpresaById(id: number): Observable<EmpresaResponseDTO> {
    return this.api.get<EmpresaResponseDTO>(`empresas/${id}`);
  }

  createEmpresa(empresa: EmpresaCreateDTO): Observable<EmpresaResponseDTO> {
    return this.api.create<EmpresaResponseDTO>('empresas', empresa).pipe(
      tap((newEmpresa) => {
        const currentEmpresas = this._empresasSubject.getValue();
        this._empresasSubject.next([...currentEmpresas, newEmpresa]);
      })
    );
  }

  updateEmpresa(id: number, empresa: EmpresaUpdateDTO): Observable<EmpresaResponseDTO> {
    return this.api.update<EmpresaResponseDTO>('empresas', id, empresa).pipe(
      tap((updatedEmpresa) => {
        const currentEmpresas = this._empresasSubject.getValue();
        const updatedList = currentEmpresas.map(e => e.id === updatedEmpresa.id ? updatedEmpresa : e);
        this._empresasSubject.next(updatedList);
      })
    );
  }

  deleteEmpresa(id: number): Observable<boolean> {
    return this.api.remove<boolean>('empresas', id).pipe(
      tap((success) => {
        if (success) {
          const currentEmpresas = this._empresasSubject.getValue();
          const updatedList = currentEmpresas.filter(e => e.id !== id);
          this._empresasSubject.next(updatedList);
        }
      })
    );
  }
}
