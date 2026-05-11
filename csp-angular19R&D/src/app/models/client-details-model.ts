import { ProjectDetailsModel } from "../models/project-details-model";
// Update the import path to the correct location of report-details-model.ts
import { ReportDetailsModel } from "../models/report-details-model";

export class ClientDetailsModel {
    client_ID?: string;
    client_NM?: string;
    client_RAG?: string;
    client_Description?: string;
    gavs_Description?: string;
    client_Goals?: string;
    projects?: ProjectDetailsModel[];
    reports?: ReportDetailsModel[];
}
