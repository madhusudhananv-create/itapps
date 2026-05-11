export class SubProjectTaskModel {
    constructor(custid: number | string, projid: string, createdby: string) {
        this.customeR_ID = custid.toString();
        this.projecT_ID = projid;
        this.createD_BY = createdby;
    }
    id: number = 0;
    customeR_ID: string = '';
    projecT_ID: string = '';
    subprojecT_ID: number = 0;
    ismilestone: string = '';
    shoW_IN_CHART: Boolean = false;
    description: string = '';
    responsibility: string = '';
    expecteD_START_DATE: Date | null = null;
    expecteD_END_DATE: Date | null = null;
    actuaL_START_DATE: Date | null = null;
    actuaL_END_DATE: Date | null = null;
    status: string = '';
    completioN_PERCENT: number = 0;
    comments: string = '';
    createD_BY: string = '';
    createD_DATE: Date | null = null;
    updateD_BY: string = '';
    updateD_DATE: Date | null = null;
    isactive: Boolean = true;
}
