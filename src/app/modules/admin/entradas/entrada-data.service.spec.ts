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

    it('should call api.create on createEntrada', () => {
        const mockRequest = {
            insumoId: 1,
            almoxarifadoId: 2,
            fornecedorId: 3,
            quantidade: 10,
            numeroLote: 'LOTE-001',
            dataValidade: '2030-12-31',
            numeroNotaFiscal: 'NF-123',
        };
        const mockResponse = { id: 1, quantidade: 10 };

        apiServiceSpy.create.and.returnValue(of(mockResponse));

        service.createEntrada(mockRequest).subscribe((response) => {
            expect(response).toEqual(mockResponse);
        });

        expect(apiServiceSpy.create).toHaveBeenCalledWith('movimentacoes/entrada', mockRequest);
    });

    it('should call api.list on getInsumos', () => {
        const mockInsumos = [
            { id: 1, codigo: 'I001', descricao: 'Insumo A', loteObrigatorio: true, perecivel: true },
        ];
        apiServiceSpy.list.and.returnValue(of(mockInsumos));

        service.getInsumos().subscribe((insumos) => {
            expect(insumos).toEqual(mockInsumos);
        });

        expect(apiServiceSpy.list).toHaveBeenCalledWith('insumos', { size: 200, sort: 'codigo,asc' });
    });

    it('should call api.list on getAlmoxarifados', () => {
        const mockAlmoxarifados = [
            { id: 1, codigo: 'ALM-01', descricao: 'Central' },
        ];
        apiServiceSpy.list.and.returnValue(of(mockAlmoxarifados));

        service.getAlmoxarifados().subscribe((almoxarifados) => {
            expect(almoxarifados).toEqual(mockAlmoxarifados);
        });

        expect(apiServiceSpy.list).toHaveBeenCalledWith('almoxarifados', { size: 200, sort: 'descricao,asc' });
    });

    it('should call api.list on getFornecedores', () => {
        const mockFornecedores = [
            { id: 1, nome: 'Fornecedor A', cnpj: '00000000000000', ativo: true },
        ];
        apiServiceSpy.list.and.returnValue(of(mockFornecedores));

        service.getFornecedores().subscribe((fornecedores) => {
            expect(fornecedores).toEqual(mockFornecedores);
        });

        expect(apiServiceSpy.list).toHaveBeenCalledWith('fornecedores', { size: 200, sort: 'nome,asc' });
    });
});
