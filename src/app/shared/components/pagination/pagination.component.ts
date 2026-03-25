import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-pagination',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatSelectModule, FormsModule],
    template: `
        <div class="flex items-center justify-between px-6 py-3 border-t bg-gray-50 dark:bg-transparent">
            <div class="flex flex-1 justify-between sm:hidden">
                <button mat-stroked-button [disabled]="page === 0" (click)="onPageChange(page - 1)">
                    Anterior
                </button>
                <button mat-stroked-button [disabled]="page >= totalPages - 1" (click)="onPageChange(page + 1)">
                    Próximo
                </button>
            </div>
            <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div class="flex items-center gap-4">
                    <p class="text-sm text-secondary">
                        Mostrando
                        <span class="font-medium">{{ page * size + 1 }}</span>
                        a
                        <span class="font-medium">{{ Math.min((page + 1) * size, totalElements) }}</span>
                        de
                        <span class="font-medium">{{ totalElements }}</span>
                        resultados
                    </p>

                    <div class="flex items-center justify-center gap-2">
                        <span class="text-sm text-secondary whitespace-nowrap">Itens por página:</span>
                        <mat-form-field class="fuse-mat-dense fuse-mat-no-subscript w-20">
                            <mat-select [ngModel]="size" (ngModelChange)="onSizeChange($event)">
                                <mat-option [value]="5">5</mat-option>
                                <mat-option [value]="10">10</mat-option>
                                <mat-option [value]="25">25</mat-option>
                                <mat-option [value]="50">50</mat-option>
                                <mat-option [value]="100">100</mat-option>
                            </mat-select>
                        </mat-form-field>
                    </div>
                </div>
                <div>
                    <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button mat-icon-button [disabled]="page === 0" (click)="onPageChange(page - 1)" class="rounded-l-md border border-gray-300">
                            <mat-icon class="icon-size-5" [svgIcon]="'heroicons_outline:chevron-left'"></mat-icon>
                        </button>

                        <!-- Lógica simplificada de números de página -->
                        <ng-container *ngFor="let p of pages">
                            <button mat-flat-button
                                    [color]="p === page ? 'primary' : ''"
                                    (click)="onPageChange(p)"
                                    class="hidden md:inline-flex border border-gray-300 min-w-10">
                                {{ p + 1 }}
                            </button>
                        </ng-container>

                        <button mat-icon-button [disabled]="page >= totalPages - 1" (click)="onPageChange(page + 1)" class="rounded-r-md border border-gray-300">
                            <mat-icon class="icon-size-5" [svgIcon]="'heroicons_outline:chevron-right'"></mat-icon>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: block;
            width: 100%;
        }
        .isolate button {
            border-radius: 0;
            margin: 0;
        }
    `]
})
export class PaginationComponent {
    @Input() page: number = 0;
    @Input() size: number = 10;
    @Input() totalElements: number = 0;
    @Input() totalPages: number = 0;

    @Output() pageChange = new EventEmitter<number>();
    @Output() sizeChange = new EventEmitter<number>();

    Math = Math;

    get pages(): number[] {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(0, this.page - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(0, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    }

    onPageChange(newPage: number): void {
        if (newPage >= 0 && newPage < this.totalPages) {
            this.pageChange.emit(newPage);
        }
    }

    onSizeChange(newSize: number): void {
        this.sizeChange.emit(newSize);
    }
}
