import { ProjectDetailsModel } from "./project-details-model";
import {ReportDetailsModel} from "./report-details-model";

export class ClientDetailsModel {
    client_ID: string;
    client_NM:string;
    client_RAG:string;
    client_Description:string;
    gavs_Description:string;
    client_Goals:string;
    projects: ProjectDetailsModel[];
    reports:ReportDetailsModel[];
}
