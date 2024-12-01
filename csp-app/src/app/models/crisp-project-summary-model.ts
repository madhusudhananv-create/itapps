import { CrispScoresValidationsModel } from "./crisp-scores-validations-model";

export class CrispProjectSummaryModel {
    projecT_ID: string;
    projecT_NAME: string;
    score:number;
    targetScore:number;
    rag:string;
    categories:CrispCategoryDetails[];
    validations: validations[];
}
export class CrispCategoryDetails {
    name: string;
    rag: string;
    score: number;
    targetScore:number;
    
}
export class validations{
    achieved:boolean;
    validatioN_NAME: string;
    comments:string;
    status:string;
    criteriA_NAME:string;
    categorY_NAME:string;
    eligible:number;
}