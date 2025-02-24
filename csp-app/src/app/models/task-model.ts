import { List } from "sp-pnp-js";
import { AuditScheduleModel } from "./audit-schedule-model";

export class TaskModel {
    id: number;
    parenT_TASK_ID: number;
    parenT_EVENT_ID: number;
    tasK_TYPE_ID: number;
    tasK_CATEGORY_ID: number;
    description: string;
    requiremenT_REFERENCE: string;
    priority: string = "MEDIUM";
    scheduleD_START_DATE?: Date = new Date(new Date().toUTCString());
    scheduleD_DURATION: number = 1;
    duE_DATE: Date = new Date(new Date().toUTCString());
    status: string = "PLANNED";
    comments: string;
    actuaL_START_DATE?: Date;
    actuaL_END_DATE?: Date;
    actuaL_DURATION: number;
    cusT_ID: string;
    cusT_NM: string;
    proJ_ID: string;
    proJ_NM: string;
    owner: string = localStorage.getItem('empid');
    assigneD_TO: string = localStorage.getItem('empid');
    seT_REMINDER: boolean = false;
    seT_RECURRENCE: boolean = false;
    recurrence: RecurrenceModel = new RecurrenceModel();
    createD_BY: string = localStorage.getItem('empid');
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    isTask: boolean = false;
    isAllDisabled = false;
    empName: string;
    ownerName: string;
    isEmpSelVisible: boolean = true;
    isOwner: boolean = true;
    isNew: boolean = true;
    isAudit: boolean;
    isMoredetailsShown: boolean = false; // hidden by default
    moreText: string = "More Details...";
    reschedulE_REQUESTER: string = null;
    reschedulE_DATE: Date = new Date();
    reschedulE_REASON: string = "";
    statuS_PREV: string = "";
    reschedulE_DATE_PREV: Date = new Date();
    reschedulE_REQUESTER_PREV: string = null;
    reschedulE_REASON_PREV: string = "";
    reasoN_FOR_CANCEL: string;
    iS_DRAFT: boolean;
}
export class TaskTypeModel {
    id: number = 0;
    title: string = "All";
    createD_BY: string = localStorage.getItem('empid');
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}
export class TaskCategoryModel {
    id: number = 0;
    tasK_TYPE_ID: number;
    title: string = "All";
    createD_BY: string = localStorage.getItem('empid');
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}
export class RecurrenceModel {
    id: number;
    tasK_ID: number;
    starT_DATE: Date;
    enD_DATE: Date;
    frequency: string = "Monthly";
    dailY_IS_MONDAY: boolean;
    dailY_IS_TUESDAY: boolean;
    dailY_IS_WEDNESDAY: boolean;
    dailY_IS_THURSDAY: boolean;
    dailY_IS_FRIDAY: boolean;
    dailY_IS_SATURDAY: boolean;
    dailY_IS_SUNDAY: boolean;
    weeklY_SELECTED_DAY: string;
    fortnightlY_SELECTED_DAY: string;
    monthlY_SELECTED_DAY: string;
    monthlY_SKIP_DAYS: number;
    quarterlY_SKIP_DAYS: number;
    quarterlY_SELECTED_DAY: string;
    biannuaL_FIRST_SELECTED_DAY: string;
    biannuaL_FIRST_SKIP_DAYS: number;
    biannuaL_FIRST_SELECTED_MONTH: string;
    biannuaL_SECOND_SELECTED_DAY: string;
    biannuaL_SECOND_SKIP_DAYS: number;
    biannuaL_SECOND_SELECTED_MONTH: string;
    annuaL_SELECTED_DAY: string;
    annuaL_SKIP_DAYS: number;
    annuaL_SELECTED_MONTH: string;
    createD_BY: string = localStorage.getItem('empid');
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}
export class TaskGroupsModel {
    dates: string[];
    projects: GroupingModel[] = [];
}
export class GroupingModel {
    projectName: string;
    customerName: string;
    projectId: string;
    customerId: string;
    tasks: tasK_DETAILS[] = []
    groups: GroupingModel[] = [];
}
export class tasK_DETAILS {
    id: number;
    montH_ID: number;
    cusT_ID: string;
    proJ_ID: string
    proJ_NM: string;
    tasK_TYPE: string;
    tasK_CATEGORY: string;
    tasK_TYPE_ID: number;
    tasK_CATEGORY_ID: number;
    description: string;
    status: string;
    scheduleD_START_DATE?: Date;
    scheduleD_DURATION: number;
    duE_DATE: Date;
    iS_DRAFT: boolean;
}

export class Task_Audit_VM {
    task: TaskModel;
    audit: AuditScheduleModel;
    cusT_NM: string;
    proJ_NM: string;
    proJ_IDS: string [] = [];
    tasK_CATEGORY_TITLE: string;
    isAudit: boolean;
    reasoN_FOR_CANCEL: string;
    iS_SUBMIT: boolean;
}
