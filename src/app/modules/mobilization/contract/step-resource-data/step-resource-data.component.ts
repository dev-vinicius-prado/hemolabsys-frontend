import { CdkAccordionModule } from "@angular/cdk/accordion";
import { NgFor, NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatStepperModule } from "@angular/material/stepper";
import { MatTableModule } from "@angular/material/table";
import { TranslocoModule } from "@ngneat/transloco";
import { AppValidators } from "app/core/utils/validators/app.validators";
import { NgxMaskDirective, provideNgxMask } from "ngx-mask";

@Component({
  selector: "step-resource-data",
  standalone: true,
  imports: [
    NgIf,
    NgxMaskDirective,              TranslocoModule, CdkAccordionModule, MatButtonModule, MatCheckboxModule, MatIconModule, MatExpansionModule, NgFor, MatStepperModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatRadioModule, FormsModule, ReactiveFormsModule],
  providers: [provideNgxMask({})],
  templateUrl: "./step-resource-data.component.html",
  styleUrl: "./step-resource-data.component.scss",
})
export class StepResourceDataComponent implements OnInit {
  contractForm: FormGroup;
  resourceDataForm: FormGroup;
  documentsData = [
    { key: 1, value: "Cópia do RG" },
    { key: 2, value: "Cópia do CPF" },
    { key: 3, value: "Comprovante de Endereço" },
    { key: 4, value: "Certidão de Nascimento ou Casamento" },
    { key: 5, value: "Carteira de Trabalho (CTPS)" },
    { key: 6, value: "Atestado de Saúde Ocupacional (ASO)" },
  ];

  constructor(private _formBuilder: FormBuilder, private _ctrlContainer: FormGroupDirective) {}
  private addDocuments() {
    this.documentsData.forEach(() => this.documentsArray.push(new FormControl(false)));
  }
  ngOnInit(): void {
    this.resourceDataForm = this._formBuilder.group({
      name: ["", Validators.required],
      cpf: ["", [Validators.required, Validators.pattern('^[0-9]{11}$'), AppValidators.isCPF]],
      identity: ["", Validators.required],
      jobTitle: ["", Validators.required],
      birthday: ["", Validators.required],
      phoneNumber: ["", Validators.required],
      email: ["", Validators.required],
      documents: new FormArray([]),
    });
    this.addDocuments();

    this.contractForm = this._ctrlContainer.form;
    this.contractForm.addControl("resourceData", this.resourceDataForm);
  }

  get documentsArray(): FormArray {
    return this.resourceDataForm.get("documents") as FormArray;
  }

  get cpf() {
    return this.resourceDataForm.get('cpf')!;
  }
}
