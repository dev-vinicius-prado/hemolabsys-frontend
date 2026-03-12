import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { of, BehaviorSubject } from 'rxjs';
import { EntradaComponent } from './entrada.component';
import { EntradaDataService } from './entrada-data.service';
import { InsumoLoteResponseDTO } from './types/entrada.types';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('EntradaComponent', () => {
    let component: EntradaComponent;
    let fixture: ComponentFixture<EntradaComponent>;
    let entradaDataServiceSpy: jasmine.SpyObj<EntradaDataService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    const mockInsumosLotes: InsumoLoteResponseDTO[] = [
        { id: 1, insumoId: 101, nomeInsumo: 'Insumo A', numeroLote: 'Lote001', dataValidade: '2024-12-31', quantidadeDisponivel: 100, almoxarifadoId: 1, almoxarifadoNome: 'Almoxarifado 1' },
        { id: 2, insumoId: 102, nomeInsumo: 'Insumo B', numeroLote: 'Lote002', dataValidade: '2024-11-30', quantidadeDisponivel: 50, almoxarifadoId: 1, almoxarifadoNome: 'Almoxarifado 1' },
    ];

    beforeEach(async () => {
        const entradaSpy = jasmine.createSpyObj('EntradaDataService', ['getInsumosLotesDisponiveis', 'createEntrada'], { insumosLotes$: of(mockInsumosLotes) });
        const snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

        await TestBed.configureTestingModule({
            imports: [
                CommonModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                MatButtonModule,
                MatSnackBarModule,
                MatStepperModule,
                NoopAnimationsModule, // Necessário para testes de componentes com animações do Material
                EntradaComponent // Importar o componente standalone
            ],
            providers: [
                FormBuilder,
                { provide: EntradaDataService, useValue: entradaSpy },
                { provide: MatSnackBar, useValue: snackBar },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EntradaComponent);
        component = fixture.componentInstance;
        entradaDataServiceSpy = TestBed.inject(EntradaDataService) as jasmine.SpyObj<EntradaDataService>;
        snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

        entradaDataServiceSpy.getInsumosLotesDisponiveis.and.returnValue(of(mockInsumosLotes));
        entradaDataServiceSpy.insumosLotes$ = new BehaviorSubject<InsumoLoteResponseDTO[]>(mockInsumosLotes).asObservable();

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the form with required controls', () => {
        expect(component.entradaForm).toBeDefined();
        expect(component.entradaForm.get('insumoLoteId')).toBeDefined();
        expect(component.entradaForm.get('quantidade')).toBeDefined();
        expect(component.entradaForm.get('usuarioRegistroId')).toBeDefined();
    });

    it('should load insumosLotes on ngOnInit', () => {
        expect(entradaDataServiceSpy.getInsumosLotesDisponiveis).toHaveBeenCalled();
        component.insumosLotes$?.subscribe(data => {
            expect(data).toEqual(mockInsumosLotes);
        });
    });

    it('should set selectedInsumoLote and patch form value on onInsumoLoteSelect', () => {
        const selectedLote = mockInsumosLotes[0];
        component.onInsumoLoteSelect(selectedLote);
        expect(component.selectedInsumoLote).toEqual(selectedLote);
        expect(component.entradaForm.get('insumoLoteId')?.value).toEqual(selectedLote.id);
    });

    it('should show snackbar error if form is invalid on submitEntrada', () => {
        component.entradaForm.get('insumoLoteId')?.setValue(null);
        component.entradaForm.get('quantidade')?.setValue(null);
        component.submitEntrada();
        expect(snackBarSpy.open).toHaveBeenCalledWith('Formulário inválido. Verifique os campos.', 'Fechar', { duration: 3000 });
        expect(entradaDataServiceSpy.createEntrada).not.toHaveBeenCalled();
    });

    it('should show snackbar error if insumoId is missing on submitEntrada', () => {
        component.entradaForm.get('insumoLoteId')?.setValue(mockInsumosLotes[0].id);
        component.entradaForm.get('quantidade')?.setValue(10);
        component.selectedInsumoLote = undefined; // Simula a falta de seleção
        component.submitEntrada();
        expect(snackBarSpy.open).toHaveBeenCalledWith('Selecione um insumo/lote válido.', 'Fechar', { duration: 3000 });
        expect(entradaDataServiceSpy.createEntrada).not.toHaveBeenCalled();
    });

    it('should call createEntrada and show success snackbar on valid submitEntrada', () => {
        const mockEntradaResponse = { id: 1, insumoId: 101, loteId: 1, quantidade: 10, dataRegistro: '2023-01-01', usuarioRegistroId: 1 };
        entradaDataServiceSpy.createEntrada.and.returnValue(of(mockEntradaResponse));

        component.onInsumoLoteSelect(mockInsumosLotes[0]);
        component.entradaForm.get('quantidade')?.setValue(10);
        component.entradaForm.get('usuarioRegistroId')?.setValue(1);

        component.submitEntrada();

        expect(entradaDataServiceSpy.createEntrada).toHaveBeenCalledWith({
            insumoId: mockInsumosLotes[0].insumoId,
            loteId: mockInsumosLotes[0].id,
            quantidade: 10,
            usuarioRegistroId: 1
        });
        expect(snackBarSpy.open).toHaveBeenCalledWith('Entrada registrada com sucesso!', 'Fechar', { duration: 3000 });
        expect(component.entradaForm.pristine).toBeTrue(); // Formulário resetado
        expect(component.entradaForm.untouched).toBeTrue(); // Formulário resetado
        expect(component.selectedInsumoLote).toBeUndefined();
    });

    it('should show error snackbar on createEntrada failure', () => {
        const errorMessage = 'Erro de API';
        entradaDataServiceSpy.createEntrada.and.returnValue(of().pipe(tap(() => { throw new Error(errorMessage); })));

        component.onInsumoLoteSelect(mockInsumosLotes[0]);
        component.entradaForm.get('quantidade')?.setValue(10);
        component.entradaForm.get('usuarioRegistroId')?.setValue(1);

        component.submitEntrada();

        expect(snackBarSpy.open).toHaveBeenCalledWith(`Erro ao registrar entrada: ${errorMessage}`, 'Fechar', { duration: 5000 });
    });
});