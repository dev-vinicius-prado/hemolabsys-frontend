import { Routes } from "@angular/router";
import { ListContractComponent } from "app/modules/mobilization/contract/list/list-contract.component";
import { ContractComponent } from "./contract.component";
import { DetailContractComponent } from "./detail/detail-contract.component";

export default [
  {
    path: "",
    component: ContractComponent,
    children: [
      {
        path: "",
        pathMatch: 'full',
        component: ListContractComponent,
      },
      {
        path: "incluir",
        component: DetailContractComponent,
      },
    ],
  },
] as Routes;
