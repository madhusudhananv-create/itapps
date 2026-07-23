export class SubProjectModel {
    constructor(custid: string | number, projid: string) {
        this.customeR_ID = custid.toString();
        this.projecT_ID = projid;
        this.createD_BY = localStorage.getItem('empid') || '';
        this.updateD_BY = localStorage.getItem('empid') || '';
    }
    id: number = 0;
    customeR_ID: string = '';
    projecT_ID: string = '';
    subprojecT_NM: string = '';
    objectives: string = '';
    owneR_ID: number | null = null;
    createD_BY: string = '';
    createD_DATE: Date | null = null;
    updateD_BY: string = '';
    updateD_DATE: Date | null = null;
    isactive: boolean = true;
}
