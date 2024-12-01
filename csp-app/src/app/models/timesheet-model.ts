import { TimesheetTypeModel } from "./date-range-model";
import { DateRangeModel } from "./date-range-model";
export class TimesheetProjectModel {
    proJ_ID: string;
    proJ_NM: string;
    billinG_PROJ_ID: string;
    timesheet: TimesheetModel[] = [];
    total: string;
    status: string;
    comments: string;
    startdate: Date; //test
    enddate: Date; //test
}

export class TimesheetProjectEmpModel {
    proJ_ID: string;
    proJ_NM: string;
    proJ_ALIAS_NM: string;
    billinG_PROJ_ID: string;
    employees: TimesheetEmployeeModel[] = [];
    selected: boolean;    
    reportinG_MANAGER: boolean;
}

export class TimesheetForApproval {
    proJ_NM: string;
    reportinG_MANAGER: boolean;
    displayName: string;
    totaL_EMPLOYEES: number;
    totaL_HOURS: number;
    waitinG_FOR_APPROVAL: number;
}

export class TimesheetProjectEmpModelGroupBydate {
    multipleProjectTimesheets: TimesheetProjectEmpModel[] = [];
    dtrange: DateRangeModel = new DateRangeModel();
    tmpSelectedDates: string[] = [];
    bAllChecked: boolean = false;
}

export class TimesheetEmployeeModel {
    emP_ID: string;
    frsT_NM: string;
    timesheet: TimesheetModel[] = [];
    total: number;
    status: string;
    comments: string;
    rejecT_DESC: string;
    selected: boolean;
    startdate: Date; //test
    enddate: Date; //test 
    approveD_TOTAL: number;
    forapprovaL_TOTAL: number;
    forrevieW_TOTAL: number;
    rejecteD_TOTAL: number;
    waitinG_FOR_APPROVAL: number;
    personHours: number;
    tasK_NAME: string;
}

export class TimesheetModel {
    datE_ID: number;
    ID: string;
    clndR_DATE: Date;
    clndR_DAY_NAME: string;
    clndR_DATE_DAY: string;
    proJ_RESRC_TIME_ENTRY_ID: number;
    proJ_ID: string;
    billinG_PROJ_ID: string;
    emP_ID: string;
    proJ_TASK_ID: number;
    tasK_DESC: string;
    clockeD_MINS: number;
    timE_ENTRY_STATUS: string;
    otheR_DETAILS: string;
    apprL_DATE: Date;
    rejecT_DATE: Date;
    rejecT_DESC: string;
    createD_DATE: Date;
    createD_BY: string;
    updateD_BY: string;
    updateD_DATE: Date;
    total: number;   
    proJ_TASK: string; 
    frsT_NM: string;
    displayName: string;
}
export class ProjectTask {
    proJ_TASK_ID: number;
    proJ_TASK_NAME: string;
    proJ_TASK_DESC: string;
    createD_BY: string;
    createD_DATE: Date;
    updateD_BY: string;
    updateD_DATE: Date;
    dates: Dates[] = [];
}
export class Dates {
    proJ_TASK_ID: number;
    datE_ID: number;
    clndR_DAY_NAME: string;
    enable: boolean;
    isHoliday: boolean;
    date: string;
}

export class Total {
    taskName:string;
    total:number;
}