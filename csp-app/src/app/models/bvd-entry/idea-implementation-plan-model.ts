import { IdeaStatus } from "./idea-model";

export class ImplementationPlan {
    id: number;
    ideA_ID: number;
    milestone: string;
    description: string;
    estimateD_EFFORTS: number;
    responsible: string;
    estimateD_START_DATE: string;
    estimateD_TARGET_DATE: string;
    actuaL_START_DATE: string;
    actuaL_END_DATE: string;
    ideA_STATUS_ID: number;
    comments: string;
    createD_BY: string
    createD_DATE: Date
    updateD_BY: string
    updateD_DATE: Date
    isactive: boolean
    issubmitted: boolean;
    iscomplete: boolean;
}