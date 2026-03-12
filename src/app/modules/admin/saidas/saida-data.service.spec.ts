import { TestBed } from '@angular/core/testing';
import { ApiService } from 'app/core/api/api.service';
import { SaidaDataService } from './saida-data.service';
import { of } from 'rxjs';

describe('SaidaDataService', () => {
    let service: SaidaDataService;
    let apiServiceSpy: jasmine.SpyObj<ApiService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('ApiService', ['create', 'list']);

        TestBed.configureTestingModule({
            providers: [
                SaidaDataService,
                { provide: ApiService, useValue: spy },
            ],
        });

        service = TestBed.inject(SaidaDataService);
        apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call api.create and refresh insumosLotesSaida after createSaida', () => {
        const mockCreateSaidaDTO = { insumoId: 1, loteId: 1, quantidade: 5, solicitante: 'Solicitante Teste' };
        const mockSaidaResponse = { id: 1, insumoId: 1, loteId: 1, quantidade: 5, dataRegistro: '2023-01-01', usuarioRegistroId: 1, solicitante: 'Solicitante Teste' };
        const mockInsumosLotesSaida = [{ id: 1, insumoId: 1, nomeInsumo: 'Insumo A', numeroLote: 'Lote 001', dataValidade: '2024-12-31', quantidadeDisponivel: 95, almoxarifadoId: 1, almoxarifadoNome: 'Almoxarifado Central' }];

        apiServiceSpy.create.and.returnValue(of(mockSaidaResponse));
        apiServiceSpy.list.and.returnValue(of(mockInsumosLotesSaida));

        const getInsumosLotesSaidaSpy = spyOn(service, 'getInsumosLotesDisponiveisParaSaida').and.returnValue(of(mockInsumosLotesSaida));

        service.createSaida(mockCreateSaidaDTO).subscribe(response => {
            expect(response).toEqual(mockSaidaResponse);
        });

        expect(apiServiceSpy.create).toHaveBeenCalledWith('saidas', mockCreateSaidaDTO);
        expect(getInsumosLotesSaidaSpy).toHaveBeenCalled();
    });

    it('should fetch and update insumosLotesSaida on getInsumosLotesDisponiveisParaSaida', () => {
        const mockInsumosLotesSaida = [
            { id: 1, insumoId: 1, nomeInsumo: 'Insumo A', numeroLote: 'Lote 001', dataValidade: '2024-12-31', quantidadeDisponivel: 100, almoxarifadoId: 1, almoxarifadoNome: 'Almoxarifado Central' },
            { id: 2, insumoId: 2, nomeInsumo: 'Insumo B', numeroLote: 'Lote 002', dataValidade: '2024-11-30', quantidadeDisponivel: 50, almoxarifadoId: 1, almoxarifadoNome: 'Almoxarifado Central' }
        ];

        apiServiceSpy.list.and.returnValue(of(mockInsumosLotesSaida));

        service.getInsumosLotesDisponiveisParaSaida().subscribe(insumosLotes => {
            expect(insumosLotes).toEqual(mockInsumosLotesSaida);
        });

        expect(apiServiceSpy.list).toHaveBeenCalledWith('insumos-lotes-disponiveis-saida');
        service.insumosLotesSaida$.subscribe(currentInsumosLotes => {
            expect(currentInsumosLotes).toEqual(mockInsumosLotesSaida);
        });
    });
});