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

    it('should call api.create and clear insumosLotesSaida after createSaida', () => {
        const mockCreateSaidaDTO = {
            insumoId: 1,
            almoxarifadoId: 1,
            codigoLote: 'LOTE-001',
            quantidade: 5,
            solicitante: 'Solicitante Teste',
        };
        const mockSaidaResponse = {
            id: 1,
            insumoId: 1,
            loteId: 1,
            quantidade: 5,
            dataRegistro: '2023-01-01',
            usuarioRegistroId: 1,
            solicitante: 'Solicitante Teste',
        };

        apiServiceSpy.create.and.returnValue(of(mockSaidaResponse));

        service.createSaida(mockCreateSaidaDTO).subscribe((response) => {
            expect(response).toEqual(mockSaidaResponse);
        });

        expect(apiServiceSpy.create).toHaveBeenCalledWith('movimentacoes/saida', mockCreateSaidaDTO);

        service.insumosLotesSaida$.subscribe((currentInsumosLotes) => {
            expect(currentInsumosLotes).toEqual([]);
        });
    });

    it('should fetch and update insumosLotesSaida on getInsumosLotesDisponiveisParaSaida', () => {
        const mockInsumosLotesSaida = [
            { estoqueLoteId: 1, loteId: 1, insumoNome: 'Insumo A', codigoLote: 'LOTE-001', dataValidade: '2024-12-31', quantidade: 100, almoxarifadoNome: 'Almoxarifado Central' },
            { estoqueLoteId: 2, loteId: 2, insumoNome: 'Insumo B', codigoLote: 'LOTE-002', dataValidade: '2024-11-30', quantidade: 50, almoxarifadoNome: 'Almoxarifado Central' }
        ];

        apiServiceSpy.list.and.returnValue(of(mockInsumosLotesSaida));

        service.getInsumosLotesDisponiveisParaSaida(1, 1).subscribe((insumosLotes) => {
            expect(insumosLotes).toEqual(mockInsumosLotesSaida);
        });

        expect(apiServiceSpy.list).toHaveBeenCalledWith('estoque/lotes?insumoId=1&almoxarifadoId=1');
        service.insumosLotesSaida$.subscribe((currentInsumosLotes) => {
            expect(currentInsumosLotes).toEqual(mockInsumosLotesSaida);
        });
    });
});
