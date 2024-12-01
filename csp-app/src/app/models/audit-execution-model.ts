export class AuditExecutionModel {
    id: number;
    audiT_EXECUTION_ID:number;
    audiT_TITLE:string;
    customeR_ID:string;
    projecT_ID:string;
    audiT_START_DATE:Date;
    audiT_END_DATE:Date;
    audiT_PLAN_REFERENCE:string;
    auditoR_NAME :number;
    tesT_ID :number;
    tesT_RESULT:string;
    statuS_OF_CONTROL:string;
    resulT_DESCRIPTION:string;
    findinG_DESCRIPTION :string;
    findinG_TYPE :string
    impactinG_ATTRIBUTES_ID:number;
    impactinG_ATTRIBUTES:string[];
    auditeE_NAME:number[];
    severity:string;
    statuS_OF_AUDIT :string
    createD_BY:string;
    createD_DATE:Date;
    updateD_BY:string;
    updateD_DATE:Date;
    isactive:boolean;
    isevaluated: boolean = false;
}
