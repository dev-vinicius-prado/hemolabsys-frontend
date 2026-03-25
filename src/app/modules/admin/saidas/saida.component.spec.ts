// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { of, BehaviorSubject } from 'rxjs';
// import { SaidaComponent } from './saida.component';
// import { SaidaDataService } from './saida-data.service';
// import { InsumoLoteSaidaResponseDTO } from './types/saida.types';
// import { CommonModule } from '@angular/common';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatButtonModule } from '@angular/material/button';
// import { MatStepperModule } from '@angular/material/stepper';
// import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// describe('SaidaComponent', () => {
//     let component: SaidaComponent;
//     let fixture: ComponentFixture<SaidaComponent>;
//     let saidaDataServiceSpy: jasmine.SpyObj<SaidaDataService>;
//     let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

//     const mockInsumosLotesSaida: InsumoLoteSaidaResponseDTO[] = [
//         { id: 1, insumoId: 101, nomeInsumo: 'Insumo A', numeroLote: 'Lote001', dataValidade: '2024-12-31', quantidadeDisponivel: 100, almoxarifadoId: 1, almoxarifadoNome: 'Almoxarifado 1' },
//         { id: 2, insumoId: 102, nomeInsumo: 'Insumo B', numeroLote: 'Lote002', dataValidade: '2024-11-30', quantidadeDisponivel: 50, almoxarifadoId: 1, almoxarifadoNome: 'Almoxarifado 1' },
//     ];

//     beforeEach(async () => {
//         const saidaSpy = jasmine.createSpyObj('SaidaDataService', ['getInsumosLotesDisponiveisParaSaida', 'createSaida'], { insumosLotesSaida$: of(mockInsumosLotesSaida) });
//         const snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

//         await TestBed.configureTestingModule({
//             imports: [
//                 CommonModule,
//                 ReactiveFormsModule,
//                 MatFormFieldModule,
//                 MatInputModule,
//                 MatSelectModule,
//                 MatButtonModule,
//                 MatSnackBarModule,
//                 MatStepperModule,
//                 NoopAnimationsModule,
//                 SaidaComponent
//             ],
//             providers: [
//                 FormBuilder,
//                 { provide: SaidaDataService, useValue: saidaSpy },
//                 { provide: MatSnackBar, useValue: snackBar },
//             ],
//         }).compileComponents();

//         fixture = TestBed.createComponent(SaidaComponent);
//         component = fixture.componentInstance;
//         saidaDataServiceSpy = TestBed.inject(SaidaDataService) as jasmine.SpyObj<SaidaDataService>;
//         snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

//         saidaDataServiceSpy.getInsumosLotesDisponiveisParaSaida.and.returnValue(of(mockInsumosLotesSaida));
//         saidaDataServiceSpy.insumosLotesSaida$ = new BehaviorSubject<InsumoLoteSaidaResponseDTO[]>(mockInsumosLotesSaida).asObservable();

//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should initialize the form with required controls', () => {
//         expect(component.saidaForm).toBeDefined();
//         expect(component.saidaForm.get('insumoLoteId')).toBeDefined();
//         expect(component.saidaForm.get('quantidade')).toBeDefined();
//         expect(component.saidaForm.get('solicitante')).toBeDefined();
//         expect(component.saidaForm.get('usuarioRegistroId')).toBeDefined();
//     });

//     it('should load insumosLotesSaida on ngOnInit', () => {
//         expect(saidaDataServiceSpy.getInsumosLotesDisponiveisParaSaida).toHaveBeenCalled();
//         component.insumosLotesSaida$?.subscribe(data => {
//             expect(data).toEqual(mockInsumosLotesSaida);
//         });
//     });

//     it('should set selectedInsumoLoteSaida and patch form value on onInsumoLoteSaidaSelect', () => {
//         const selectedLote = mockInsumosLotesSaida[0];
//         component.onInsumoLoteSaidaSelect(selectedLote);
//         expect(component.selectedInsumoLoteSaida).toEqual(selectedLote);
//         expect(component.saidaForm.get('insumoLoteId')?.value).toEqual(selectedLote.id);
//     });

//     it('should update quantity validators on onInsumoLoteSaidaSelect', () => {
//         const selectedLote = mockInsumosLotesSaida[0];
//         component.onInsumoLoteSaidaSelect(selectedLote);
//         const quantidadeControl = component.saidaForm.get('quantidade');
//         expect(quantidadeControl?.hasValidator(Validators.max(selectedLote.quantidadeDisponivel))).toBeTrue();
//     });

//     it('should show snackbar error if form is invalid on submitSaida', () => {
//         component.saidaForm.get('insumoLoteId')?.setValue(null);
//         component.saidaForm.get('quantidade')?.setValue(null);
//         component.saidaForm.get('solicitante')?.setValue(null);
//         component.submitSaida();
//         expect(snackBarSpy.open).toHaveBeenCalledWith('Formulário inválido. Verifique os campos.', 'Fechar', { duration: 3000 });
//         expect(saidaDataServiceSpy.createSaida).not.toHaveBeenCalled();
//     });

//     it('should show snackbar error if insumoId is missing on submitSaida', () => {
//         component.saidaForm.get('insumoLoteId')?.setValue(mockInsumosLotesSaida[0].id);
//         component.saidaForm.get('quantidade')?.setValue(10);
//         component.saidaForm.get('solicitante')?.setValue('Teste');
//         component.selectedInsumoLoteSaida = undefined; // Simula a falta de seleção
//         component.submitSaida();
//         expect(snackBarSpy.open).toHaveBeenCalledWith('Selecione um insumo/lote válido.', 'Fechar', { duration: 3000 });
//         expect(saidaDataServiceSpy.createSaida).not.toHaveBeenCalled();
//     });

//     it('should call createSaida and show success snackbar on valid submitSaida', () => {
//         const mockSaidaResponse = { id: 1, insumoId: 101, loteId: 1, quantidade: 10, dataRegistro: '2023-01-01', usuarioRegistroId: 1, solicitante: 'Teste' };
//         saidaDataServiceSpy.createSaida.and.returnValue(of(mockSaidaResponse));

//         component.onInsumoLoteSaidaSelect(mockInsumosLotesSaida[0]);
//         component.saidaForm.get('quantidade')?.setValue(10);
//         component.saidaForm.get('solicitante')?.setValue('Teste Solicitante');
//         component.saidaForm.get('usuarioRegistroId')?.setValue(1);

//         component.submitSaida();

//         expect(saidaDataServiceSpy.createSaida).toHaveBeenCalledWith({
//             insumoId: mockInsumosLotesSaida[0].insumoId,
//             loteId: mockInsumosLotesSaida[0].id,
//             quantidade: 10,
//             solicitante: 'Teste Solicitante',
//             usuarioRegistroId: 1
//         });
//         expect(snackBarSpy.open).toHaveBeenCalledWith('Saída registrada com sucesso!', 'Fechar', { duration: 3000 });
//         expect(component.saidaForm.pristine).toBeTrue();
//         expect(component.saidaForm.untouched).toBeTrue();
//         expect(component.selectedInsumoLoteSaida).toBeUndefined();
//     });

//     it('should show error snackbar on createSaida failure', () => {
//         const errorMessage = 'Erro de API';
//         saidaDataServiceSpy.createSaida.and.returnValue(of().pipe(tap(() => { throw new Error(errorMessage); })));

//         component.onInsumoLoteSaidaSelect(mockInsumosLotesSaida[0]);
//         component.saidaForm.get('quantidade')?.setValue(10);
//         component.saidaForm.get('solicitante')?.setValue('Teste Solicitante');
//         component.saidaForm.get('usuarioRegistroId')?.setValue(1);

//         component.submitSaida();

//         expect(snackBarSpy.open).toHaveBeenCalledWith(`Erro ao registrar saída: ${errorMessage}`, 'Fechar', { duration: 5000 });
//     });
// });
