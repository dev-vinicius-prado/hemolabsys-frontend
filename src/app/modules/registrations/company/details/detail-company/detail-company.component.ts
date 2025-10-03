import { Component, ViewEncapsulation } from "@angular/core";

import { NgClass } from "@angular/common";
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from "@angular/forms";
import { TextFieldModule } from "@angular/cdk/text-field";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatChipsModule } from "@angular/material/chips";
import { MatOptionModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { RouterLink } from "@angular/router";
import { MatDividerModule } from "@angular/material/divider";
import { TranslocoModule } from "@ngneat/transloco";

@Component({
  selector: "app-detail-company",
  templateUrl: "./detail-company.component.html",
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    NgClass,
    MatInputModule,
    TextFieldModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDividerModule,
    RouterLink,
    TranslocoModule
  ],
  styleUrl: "./detail-company.component.scss",
})
export class DetailCompanyComponent {
  formFieldHelpers: string[] = [""];
  fixedSubscriptInput: FormControl = new FormControl("", [Validators.required]);
  dynamicSubscriptInput: FormControl = new FormControl("", [
    Validators.required,
  ]);
  fixedSubscriptInputWithHint: FormControl = new FormControl("", [
    Validators.required,
  ]);
  dynamicSubscriptInputWithHint: FormControl = new FormControl("", [
    Validators.required,
  ]);

  constructor(private _formBuilder: UntypedFormBuilder) {}

  ngOnInit() {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the form field helpers as string
     */
    getFormFieldHelpersAsString(): string
    {
        return this.formFieldHelpers.join(' ');
    }
}
