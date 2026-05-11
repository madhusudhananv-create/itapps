export class ImplementationPlan {
    id: number = 0;
    ideA_ID: number = 0;
    milestone: string = '';
    description: string = '';
    estimateD_EFFORTS: number = 0;
    responsible: string = '';
    estimateD_START_DATE: string = '';
    estimateD_TARGET_DATE: string = '';
    actuaL_START_DATE: string = '';
    actuaL_END_DATE: string = '';
    ideA_STATUS_ID: number = 0;
    comments: string = '';
    createD_BY: string = '';
    createD_DATE!: Date;
    updateD_BY: string = '';
    updateD_DATE!: Date;
    isactive: boolean = true;
    issubmitted: boolean = false;
    iscomplete: boolean = false;
}
