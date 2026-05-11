import { ProjectsModel } from "../models/projects.model";

export class CustomerProjectsModel {
  id!: number;
  displaY_NAME!: string;
  emailid!: string;
  isverified!: boolean;
  cusT_ID!: string;
  cusT_NM!: string;
  customeR_ID!: any;
  proJ_ID!: string;
  proJ_NM!: string;
  projects!: string;
  projectids!: string;
  csaT_SURVEY!: boolean;
  csaT_FREQUENCY!: string;
  reporting!: boolean;
  acsat!: boolean;
  customeR_PROJECTS!: CUSTOMER_PROJECTS[];
}

export class CUSTOMER_PROJECTS {
  id!: number;
  proJ_NM!: string;
  reporting!: boolean;
  csaT_SURVEY!: boolean;
  csaT_FREQUENCY!: string;
}

export class CustomerProjectsListModel {
  cusT_ID!: string;
  cusT_NM!: string;
  projects!: ProjectsModel[];
}

export class CustomerProjectIds {
  customer!: string[];
  project!: string[]; 
  rowId!: number;
}

export class CustomerProjectIdsSingle {
  customer!: string;
  project: string[] = [];
  rowId!: number;
}

export class GlobalKPIRequest {
  startDate!: string;
  endDate!: string;
  globalkpis!: string[];
  customerids!: string[];
  serviceTowerIds!: string[];
  projectids!: string[];
  initialGroup!: string;
  loadAll!: boolean;
}
