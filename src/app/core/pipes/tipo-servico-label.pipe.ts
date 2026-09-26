import { Pipe, PipeTransform } from '@angular/core';
import { TipoServico, TIPO_SERVICO_METADATA } from '../models/almoxarifado-catalog.types';

@Pipe({
  name: 'tipoServicoLabel',
  standalone: true
})
export class TipoServicoLabelPipe implements PipeTransform {
  /**
   * Converte a chave (string) do TipoServico em seu respectivo label (ex: "ALMOXARIFADO" -> "Almoxarifado").
   * Fallback para a própria chave caso não encontre o metadado.
   *
   * @param value A chave do TipoServico vinda do backend (ex: 'SERVICO_POSTO_COLETA')
   * @param returnType Qual informação do metadado retornar: 'label' (default), 'sigla' ou 'descricao'
   * @returns O texto correspondente
   */
  transform(value: TipoServico, returnType: 'label' | 'sigla' | 'descricao' = 'label'): string {
    if (!value) {
      return '';
    }

    const metadata = TIPO_SERVICO_METADATA[value];

    if (metadata) {
      return metadata[returnType];
    }

    // Fallback: se por acaso vier algo não mapeado, tenta deixar amigável.
    return value.toString().replace(/_/g, ' ');
  }
}
