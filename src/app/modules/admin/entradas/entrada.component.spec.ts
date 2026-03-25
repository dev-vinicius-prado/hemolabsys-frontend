import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { EntradaComponent } from './entrada.component';
import { EntradaDataService } from './entrada-data.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('EntradaComponent', () => {
    let component: EntradaComponent;
    let fixture: ComponentFixture<EntradaComponent>;
    let entradaDataServiceSpy: jasmine.SpyObj<EntradaDataService>;
    let snackBarOpenSpy: jasmine.Spy;

    const mockInsumos = [
        { id: 1, codigo: 'I001', descricao: 'Insumo A', loteObrigatorio: true, perecivel: true },
    ];
    const mockAlmoxarifados = [
        { id: 1, codigo: 'ALM-01', descricao: 'Central' },
    ];
    const mockFornecedores = [
        { id: 1, nome: 'Fornecedor A', cnpj: '00000000000000', ativo: true },
    ];

    beforeEach(async () => {
        const entradaSpy = jasmine.createSpyObj('EntradaDataService', ['getInsumos', 'getAlmoxarifados', 'getFornecedores', 'createEntrada']);

        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule, // Necessário para testes de componentes com animações do Material
                EntradaComponent // Importar o componente standalone
            ],
            providers: [
                FormBuilder,
                { provide: EntradaDataService, useValue: entradaSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EntradaComponent);
        component = fixture.componentInstance;
        entradaDataServiceSpy = TestBed.inject(EntradaDataService) as jasmine.SpyObj<EntradaDataService>;

        entradaDataServiceSpy.getInsumos.and.returnValue(of(mockInsumos));
        entradaDataServiceSpy.getAlmoxarifados.and.returnValue(of(mockAlmoxarifados));
        entradaDataServiceSpy.getFornecedores.and.returnValue(of(mockFornecedores));

        fixture.detectChanges();

        const snackBar = fixture.componentRef.injector.get(MatSnackBar);
        snackBarOpenSpy = spyOn(snackBar, 'open');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the form with required controls', () => {
        expect(component.entradaForm).toBeDefined();
        expect(component.entradaForm.get('contexto')).toBeDefined();
        expect(component.entradaForm.get('lote')).toBeDefined();
        expect(component.entradaForm.get('quantidade')).toBeDefined();

        expect(component.entradaForm.get('contexto.almoxarifadoId')).toBeDefined();
        expect(component.entradaForm.get('contexto.insumoId')).toBeDefined();
        expect(component.entradaForm.get('contexto.fornecedorId')).toBeDefined();

        expect(component.entradaForm.get('lote.numeroLote')).toBeDefined();
        expect(component.entradaForm.get('lote.dataValidade')).toBeDefined();
        expect(component.entradaForm.get('lote.numeroNotaFiscal')).toBeDefined();

        expect(component.entradaForm.get('quantidade.quantidade')).toBeDefined();
    });

    it('should expose selection observables on ngOnInit', () => {
        expect(component.insumos$).toBeDefined();
        expect(component.almoxarifados$).toBeDefined();
        expect(component.fornecedores$).toBeDefined();
    });

    it('should show snackbar error if form is invalid on submitEntrada', () => {
        component.entradaForm.get('contexto.almoxarifadoId')?.setValue(null);
        component.entradaForm.get('contexto.insumoId')?.setValue(null);
        component.entradaForm.get('contexto.fornecedorId')?.setValue(null);
        component.entradaForm.get('lote.numeroLote')?.setValue('');
        component.entradaForm.get('lote.dataValidade')?.setValue('');
        component.entradaForm.get('lote.numeroNotaFiscal')?.setValue('');
        component.entradaForm.get('quantidade.quantidade')?.setValue(null);
        component.entradaForm.updateValueAndValidity();
        component.submitEntrada();
        expect(snackBarOpenSpy).toHaveBeenCalledWith('Formulário inválido. Verifique os campos.', 'Fechar', { duration: 3000 });
        expect(entradaDataServiceSpy.createEntrada).not.toHaveBeenCalled();
    });

    it('should call createEntrada and show success snackbar on valid submitEntrada', () => {
        const mockEntradaResponse = { id: 1, quantidade: 10 };
        entradaDataServiceSpy.createEntrada.and.returnValue(of(mockEntradaResponse));

        component.entradaForm.get('contexto.almoxarifadoId')?.setValue(1);
        component.entradaForm.get('contexto.insumoId')?.setValue(1);
        component.entradaForm.get('contexto.fornecedorId')?.setValue(1);
        component.entradaForm.get('lote.numeroLote')?.setValue('LOTE-001');
        component.entradaForm.get('lote.dataValidade')?.setValue('2030-12-31');
        component.entradaForm.get('lote.numeroNotaFiscal')?.setValue('NF-123');
        component.entradaForm.get('quantidade.quantidade')?.setValue(10);
        component.entradaForm.updateValueAndValidity();

        component.submitEntrada();

        expect(entradaDataServiceSpy.createEntrada).toHaveBeenCalledWith({
            almoxarifadoId: 1,
            insumoId: 1,
            fornecedorId: 1,
            numeroLote: 'LOTE-001',
            dataFabricacao: undefined,
            dataValidade: '2030-12-31',
            numeroNotaFiscal: 'NF-123',
            quantidade: 10,
        });
        expect(snackBarOpenSpy).toHaveBeenCalledWith('Entrada registrada com sucesso!', 'Fechar', { duration: 3000 });
        expect(component.entradaForm.pristine).toBeTrue(); // Formulário resetado
        expect(component.entradaForm.untouched).toBeTrue(); // Formulário resetado
    });

    it('should show error snackbar on createEntrada failure', () => {
        const errorMessage = 'Erro de API';
        entradaDataServiceSpy.createEntrada.and.returnValue(throwError(() => new Error(errorMessage)));

        component.entradaForm.get('contexto.almoxarifadoId')?.setValue(1);
        component.entradaForm.get('contexto.insumoId')?.setValue(1);
        component.entradaForm.get('contexto.fornecedorId')?.setValue(1);
        component.entradaForm.get('lote.numeroLote')?.setValue('LOTE-001');
        component.entradaForm.get('lote.dataValidade')?.setValue('2030-12-31');
        component.entradaForm.get('lote.numeroNotaFiscal')?.setValue('NF-123');
        component.entradaForm.get('quantidade.quantidade')?.setValue(10);
        component.entradaForm.updateValueAndValidity();

        component.submitEntrada();

        expect(snackBarOpenSpy).toHaveBeenCalledWith(`Erro ao registrar entrada: ${errorMessage}`, 'Fechar', { duration: 5000 });
    });
});
