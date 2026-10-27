import { Injectable, inject } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root'
})
export class TranslocoMatPaginatorIntl extends MatPaginatorIntl {
  private readonly _translocoService = inject(TranslocoService);

  constructor() {
    super();

    // Inicia ouvindo as mudanças de idioma
    this._translocoService.langChanges$.subscribe(() => {
      this.getTranslations();
    });
    
    // Obtém as traduções iniciais
    this.getTranslations();
  }

  private getTranslations(): void {
    this.itemsPerPageLabel = this._translocoService.translate('paginator.itemsPerPage') || 'Itens por página';
    this.nextPageLabel = this._translocoService.translate('paginator.nextPage') || 'Próxima página';
    this.previousPageLabel = this._translocoService.translate('paginator.previousPage') || 'Página anterior';
    this.firstPageLabel = this._translocoService.translate('paginator.firstPage') || 'Primeira página';
    this.lastPageLabel = this._translocoService.translate('paginator.lastPage') || 'Última página';
    this.changes.next();
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      const emptyLabel = this._translocoService.translate('paginator.rangeEmpty', { length }) || `0 de ${length}`;
      return emptyLabel;
    }
    
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    
    return this._translocoService.translate('paginator.rangeLabel', { startIndex: startIndex + 1, endIndex, length }) || `${startIndex + 1} - ${endIndex} de ${length}`;
  };
}