import { Routes } from "@angular/router";
import { CompanyComponent } from "app/modules/registrations/company/company.component";
import { ListCompanyComponent } from "./list/list-company/list-company.component";
import { DetailCompanyComponent } from "./details/detail-company/detail-company.component";

export default [
  {
    path: "",
    component: CompanyComponent,
    children: [
      {
        path: "",
        component: ListCompanyComponent,
      },
      {
        path: "incluir",
        component: DetailCompanyComponent,
      },
    ],
  },
] as Routes;
