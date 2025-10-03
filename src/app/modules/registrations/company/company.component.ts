import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-company",
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: "./company.component.html",
})
export class CompanyComponent {
  constructor() {}
}
