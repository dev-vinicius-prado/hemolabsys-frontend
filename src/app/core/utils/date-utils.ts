import { DateTime } from 'luxon';

/**
 * Utilitário para formatação de datas no padrão pt-BR.
 */
export class DateUtils {

    /**
     * Formata uma data (Date, DateTime ou string ISO) para o padrão dd/MM/yyyy.
     * 
     * @param date Data a ser formatada
     * @param format Padrão de formatação (default: 'dd/MM/yyyy')
     * @returns String formatada ou string vazia se a data for inválida
     */
    static format(date: Date | DateTime | string | null | undefined, format: string = 'dd/MM/yyyy'): string {
        if (!date) return '';

        let dt: DateTime;

        if (date instanceof Date) {
            dt = DateTime.fromJSDate(date);
        } else if (typeof date === 'string') {
            dt = DateTime.fromISO(date);
        } else {
            dt = date;
        }

        return dt.isValid ? dt.setLocale('pt-BR').toFormat(format) : '';
    }

    /**
     * Formata uma data para o padrão dd/MM/yyyy HH:mm.
     */
    static formatDateTime(date: Date | DateTime | string | null | undefined): string {
        return this.format(date, 'dd/MM/yyyy HH:mm');
    }
}
