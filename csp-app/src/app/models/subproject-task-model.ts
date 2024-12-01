export class SubProjectTaskModel {
    constructor(custid, projid, createdby) {
        this.customeR_ID = custid;
        this.projecT_ID = projid;
        this.createD_BY = createdby;
    }
    id: number;
    customeR_ID: string;
    projecT_ID: string;
    subprojecT_ID:number;
    ismilestone: string;
    shoW_IN_CHART:Boolean;
    description: string;
    responsibility: string;
    expecteD_START_DATE: Date;
    expecteD_END_DATE: Date;
    actuaL_START_DATE: Date;
    actuaL_END_DATE: Date;
    status: string;
    completioN_PERCENT:number;
    comments: string;
    createD_BY: string;
    createD_DATE: Date;
    updateD_BY: string;
    updateD_DATE: Date;
    isactive: Boolean;
}
