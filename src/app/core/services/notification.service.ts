import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private _snackBar = inject(MatSnackBar);

    private readonly _defaultConfig: MatSnackBarConfig = {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
    };

    /**
     * Exibe uma mensagem de sucesso
     * @param message Mensagem a ser exibida
     * @param action Texto do botão de ação
     * @param config Configurações adicionais
     */
    success(message: string, action: string = 'OK', config?: MatSnackBarConfig): void {
        this._snackBar.open(message, action, {
            ...this._defaultConfig,
            panelClass: ['success-snackbar'],
            ...config
        });
    }

    /**
     * Exibe uma mensagem de erro
     * @param message Mensagem a ser exibida
     * @param action Texto do botão de ação
     * @param config Configurações adicionais
     */
    error(message: string, action: string = 'Fechar', config?: MatSnackBarConfig): void {
        this._snackBar.open(message, action, {
            ...this._defaultConfig,
            panelClass: ['error-snackbar'],
            ...config
        });
    }

    /**
     * Exibe uma mensagem informativa
     * @param message Mensagem a ser exibida
     * @param action Texto do botão de ação
     * @param config Configurações adicionais
     */
    info(message: string, action: string = 'OK', config?: MatSnackBarConfig): void {
        this._snackBar.open(message, action, {
            ...this._defaultConfig,
            ...config
        });
    }

    /**
     * Exibe uma mensagem de aviso
     * @param message Mensagem a ser exibida
     * @param action Texto do botão de ação
     * @param config Configurações adicionais
     */
    warn(message: string, action: string = 'OK', config?: MatSnackBarConfig): void {
        this._snackBar.open(message, action, {
            ...this._defaultConfig,
            panelClass: ['warn-snackbar'],
            ...config
        });
    }
}
