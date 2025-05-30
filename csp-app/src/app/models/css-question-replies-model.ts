export class CssQuestionRepliesModel {
    id:number;
    batcH_CUSTOMER_ID:string;
    surveY_ID:string;
    questioN_ID:number;
    questioN_CATEGORY:string;
    question: string;
    questioN_DETAIL: string;
    rating:number = 0;
    ratinG_DESCRIPTION:string = '';
    ratinG_PARAM:string;
    perspective : string;
    ratinG_SCALE
    comments:string;
    createD_BY: string;
    createD_DATE: Date;
    updateD_BY: string;
    updateD_DATE: Date;
    isactive: boolean;
    canskip : boolean;
    SEQUENCE: number;
}
