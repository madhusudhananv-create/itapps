import { CssBatchCustomersExtendedModel } from "../models/css-batch-customers-model";
import { CssQuestionRepliesModel } from "../models/css-question-replies-model";
import { CssBatchCustomerMonthlyExtendedModel } from "./css-batch-customers-monthly-model";

export class CssQuestionMasterModel {
    id:number;
    modeL_ID:number;
    questioN_CATEGORY:string;
    questioN: string;
    questioN_DETAIL: string;
    effectivE_FROM:Date;
    createD_BY: string;
    createD_DATE: Date;
    updateD_BY: string;
    updateD_DATE: Date;
    isactive: boolean;
}

export class BatchCustomerAndQuestions {
    csS_BATCH_CUSTOMERS_EXTENDED: CssBatchCustomersExtendedModel = new CssBatchCustomersExtendedModel();
    csS_BATCH_CUSTOMER_MONTHLY_EXTENDED : CssBatchCustomerMonthlyExtendedModel  = new CssBatchCustomerMonthlyExtendedModel();
    csS_QUESTION_REPLIES: CssQuestionRepliesModel[] = [];
}
