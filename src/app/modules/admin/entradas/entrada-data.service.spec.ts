import { TestBed } from '@angular/core/testing';
import { ApiService } from 'app/core/api/api.service';
import { EntradaDataService } from './entrada-data.service';
import { of } from 'rxjs';

describe('EntradaDataService', () => {
    let service: EntradaDataService;
    let apiServiceSpy: jasmine.SpyObj<ApiService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('ApiService', ['create', 'list']);

        TestBed.configureTestingModule({
            providers: [
                EntradaDataService,
                { provide: ApiService, useValue: spy },
            ],
        });

        service = TestBed.inject(EntradaDataService);
        apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call api.create and refresh insumosLotes after createEntrada', () => {
        const mockCreateEntradaDTO = { insumoId: 1, loteId: 1, quantidade: 10 };
        const mockEntradaResponse = { id: 1, insumoId: 1, loteId: 1, quantidade: 10, dataRegistro: '2023-01-01', usuarioRegistroId: 1 };
        const mockInsumosLotes = [{ id: 1, insumoId: 1, nomeInsumo: 'Insumo A', numeroLote: 'Lote 001', dataValidade: '2024-12-31', quantidadeDisponivel: 90, almoxarifadoId: 1, almoxarifadoNome: 'Almoxarifado Central' }];

        apiServiceSpy.create.and.returnValue(of(mockEntradaResponse));
        apiServiceSpy.list.and.returnValue(of(mockInsumosLotes));

        const getInsumosLotesSpy = spyOn(service, 'getInsumosLotesDisponiveis').and.returnValue(of(mockInsumosLotes));

        service.createEntrada(mockCreateEntradaDTO).subscribe(response => {
            expect(response).toEqual(mockEntradaResponse);
        });

        expect(apiServiceSpy.create).toHaveBeenCalledWith('entradas', mockCreateEntradaDTO);
        expect(getInsumosLotesSpy).toHaveBeenCalled();
    });

    it('should fetch and update insumosLotes on getInsumosLotesDisponiveis', () => {
        const mockInsumosLotes = [
            { id: 1, insumoId: 1, nomeInsumo: 'Insumo A', numeroLote: 'Lote 001', dataValidade: '2024-12-31', quantidadeDisponivel: 100, almoxarifadoId: 1, almoxarifadoNome: 'Almoxarifado Central' },
            { id: 2, insumoId: 2, nomeInsumo: 'Insumo B', numeroLote: 'Lote 002', dataValidade: '2024-11-30', quantidadeDisponivel: 50, almoxarifadoId: 1, almoxarifadoNome: 'Almoxarifado Central' }
        ];

        apiServiceSpy.list.and.returnValue(of(mockInsumosLotes));

        service.getInsumosLotesDisponiveis().subscribe(insumosLotes => {
            expect(insumosLotes).toEqual(mockInsumosLotes);
        });

        expect(apiServiceSpy.list).toHaveBeenCalledWith('insumos-lotes-disponiveis');
        service.insumosLotes$.subscribe(currentInsumosLotes => {
            expect(currentInsumosLotes).toEqual(mockInsumosLotes);
        });
    });
});