export class SubProjectModel {
    constructor(custid, projid) {
        this.customeR_ID = custid;
        this.projecT_ID = projid;
        this.createD_BY = localStorage.getItem('empid');
        this.updateD_BY = localStorage.getItem('empid');
    }
    id: number;
    customeR_ID: string;
    projecT_ID: string;
    subprojecT_NM: string;
    objectives: string;
    owneR_ID: number;
    createD_BY: string;
    createD_DATE: Date;
    updateD_BY: string;
    updateD_DATE: Date;
    isactive: boolean = true;
}
