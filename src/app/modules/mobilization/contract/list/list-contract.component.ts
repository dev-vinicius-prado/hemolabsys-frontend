import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { TranslocoModule } from "@ngneat/transloco";
import {
  Observable,
  Subject,
} from "rxjs";
import { ContractResource } from "../contract.types";

@Component({
  selector: "app-list-contract",
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    ReactiveFormsModule,
    RouterOutlet,
    MatTableModule,
    MatPaginatorModule,
    TranslocoModule
  ],
  templateUrl: "./list-contract.component.html",
  styleUrl: "./list-contract.component.scss",
})
export class ListContractComponent {
  isLoading: boolean = false;
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  contracts$: Observable<ContractResource[]>;
  displayedColumns: string[] = ['codigo-contrato', 'empresa-contratante', 'vigencia'];

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    console.log("initialzing contract list component!!");
  }

  createContract() {
    this._router.navigate(["incluir"], { relativeTo: this._activatedRoute });
  }
}
