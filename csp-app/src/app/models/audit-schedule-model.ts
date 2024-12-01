export class AuditScheduleModel {
    id: number;
    title: string;
    cusT_ID: string;
    proJ_ID: string;
    servicE_AREA_ID:number [] = [];
    scheduleD_DATE: Date;
    scheduleD_DURATION: number;
    actuaL_DATE: Date;
    actuaL_DURATION: number;
    auditoR_EMP_ID: string;
    auditeE_EMP_ID: string[] = [];
    status: string = "SCHEDULED";
    comments: string;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    tasK_ID: number;
}