import { CdkAccordionModule } from "@angular/cdk/accordion";
import { NgFor } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatStepperModule } from "@angular/material/stepper";
import { MatTableModule } from "@angular/material/table";
import { TranslocoModule } from "@ngneat/transloco";
import { NgxMaskDirective, provideNgxMask } from "ngx-mask";
@Component({
  selector: "step-contract-data",
  standalone: true,
  templateUrl: "./step-contract-data.component.html",
  styleUrls: ["./step-contract-data.component.css"],
  imports: [
    NgxMaskDirective,
    TranslocoModule, CdkAccordionModule, MatButtonModule, MatIconModule, MatExpansionModule, NgFor, MatStepperModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatRadioModule, FormsModule, ReactiveFormsModule],
  providers: [provideNgxMask({})]
})
export class StepContractDataComponent implements OnInit {
  contractForm: FormGroup;
  contractDataForm: FormGroup;

  constructor(private _ctrlContainer: FormGroupDirective, private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.contractDataForm = this._formBuilder.group({
      code: ["RSM-20240001"],
      dateInitialMet: ["", Validators.required],
      vigence: this._formBuilder.group({
        startAt: ["", Validators.required],
        finishAt: ["", Validators.required],
      }),
      scope: ["", Validators.required],
      degreeRiskLevel: ["", Validators.required],
      contractManager: this._formBuilder.group({
        name: ["", Validators.required],
        email: ["", Validators.required],
        phoneNumber: ["", Validators.required],
      }),
      matrixOfResponsability: this._formBuilder.array([]),
    });
    this.contractForm = this._ctrlContainer.form;
    this.contractForm.addControl("contractData", this.contractDataForm);
    this.addResponsible();

    this.contractForm.patchValue({
      contractData: {
        code: "RSM-20240001",
        dateInitialMet: "12/04/2012",
        vigence: {
          startAt: '01/05/2012',
          finishAt: '31/12/2025',
        },
        scope: "Mineiração",
        degreeRiskLevel: "HIGH",
        contractManager: {
          name: "Vinicius Francisco Prado",
          email: "email@email.com",
          phoneNumber: "32956565656",
        },
        matrixOfResponsability: [
          {
            name: "Vinicius Francisco Prado",
            function: "admin",
            email: "developer.vinicius.prado@gmail.com",
          }
        ],
      },
    });
  }
  matrix(): FormArray {
    return this.contractDataForm.get("matrixOfResponsability") as FormArray;
  }
  addResponsible() {
    this.matrix().push(this.newResponsible());
  }

  removeResponsible(rowIndex: number) {
    this.matrix().removeAt(rowIndex);
  }

  newResponsible(): FormGroup {
    return this._formBuilder.group({
      name: [""],
      function: [""],
      email: [""],
    });
  }
}
