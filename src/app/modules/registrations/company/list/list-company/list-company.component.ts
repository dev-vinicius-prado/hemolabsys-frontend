import { Component } from "@angular/core";
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl,
} from "@angular/forms";
import { Subject, debounceTime, map, switchMap, takeUntil } from "rxjs";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-list-company",
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
  ],
  templateUrl: "./list-company.component.html",
  styleUrl: "./list-company.component.scss",
})
export class ListCompanyComponent {
  isLoading: boolean = false;
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  private _inventoryService: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to search input field value changes
    this.searchInputControl.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        debounceTime(300),
        switchMap((query) => {
          this.closeDetails();
          this.isLoading = true;
          return this._inventoryService.getProducts(
            0,
            10,
            "name",
            "asc",
            query
          );
        }),
        map(() => {
          this.isLoading = false;
        })
      )
      .subscribe();
  }

  closeDetails() {
    throw new Error("Method not implemented.");
  }

  createCompany() {
    this._router.navigate(['incluir'], {relativeTo: this._activatedRoute});
  }
}
