import { CdkAccordionModule } from "@angular/cdk/accordion";
import { NgFor, NgIf } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
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
import { AppValidators } from "app/core/utils/validators/app.validators";
import { NgxMaskDirective, provideNgxMask } from "ngx-mask";

@Component({
  selector: "step-contractor-data",
  standalone: true,
  imports: [NgIf, NgxMaskDirective, TranslocoModule, CdkAccordionModule, MatButtonModule, MatIconModule, MatExpansionModule, NgFor, MatStepperModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatRadioModule, FormsModule, ReactiveFormsModule],
  providers: [provideNgxMask({})],
  templateUrl: "./step-contractor-data.component.html",
  styleUrl: "./step-contractor-data.component.scss",
})
export class StepContractorDataComponent implements OnInit {
  contractForm: FormGroup;
  contractorDataForm: FormGroup;

  constructor(private _ctrlContainer: FormGroupDirective, private _formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.contractorDataForm = this._formBuilder.group({
      cnpj: ["81.858.905/0001-07", [Validators.required, Validators.pattern('^[0-9]{14}$'), AppValidators.isCPNJ]],
      fantasyName: ["", Validators.required],
      companyName: ["", Validators.required],
      email: ["", Validators.required],
      phoneNumber: ["", Validators.required],
      contractorManager: this._formBuilder.group({
        name: ["", Validators.required],
        email: ["", Validators.required],
        phoneNumber: ["", Validators.required],
      }),
    });

    this.contractForm = this._ctrlContainer.form;
    this.contractForm.addControl("contractorData", this.contractorDataForm);

    this.contractorDataForm.patchValue({
      fantasyName: "Prado Sistemas SA",
      companyName: "Prado Sistemas SA",
      email: "prado.sistemas@gmail.com",
      phoneNumber: "31980104522",
      contractorManager: {
        name: "Vinicius Francisco Prado",
        email: "4lternativo@gmail.com",
        phoneNumber: "31980104522",
      },
    });
  }

  get cnpj() {
    return this.contractorDataForm.get("cnpj")!;
  }
}
