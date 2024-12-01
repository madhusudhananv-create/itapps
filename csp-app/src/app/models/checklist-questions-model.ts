export class ChecklistQuestionsModel {
    id: number;
    customeR_ID: string;
    projecT_ID: string
    versionid: number;
    procesS_MODEL_ID: number;
    servicE_AREA_ID: number;
    procesS_AREA_ID: number;
    procesS_ID: number;
    issubmitted: boolean;
    effectivE_FROM: number
    questionS_MODEL: QuestionsModel[] = [];
    description: string;
}
export class QuestionsModel {
    id: number;
    title:string;
    description:string;
    weightagE_ID: number;
    procesS_ID: number;
    looK_FOR: string;
    isapplicable: boolean;
    category: string;
    clauses: number[] = []
    createD_BY: string;
    createD_DATE: Date;
    updateD_BY: string;
    updateD_DATE: Date;
    issubmitted: boolean;
    isactive: boolean;
}
export class ProcessClauseModel {
    id: number;
    procesS_MODEL_ID: number;
    clausE_DESCRIPTION: string;
    createD_BY: string;
    createD_DATE: Date;
    updateD_BY: string;
}