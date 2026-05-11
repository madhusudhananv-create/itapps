import { CheckListExecutionModel } from "./checklist-execution";

export class AuditCheckListModel {
    procesS_MODEL_DESCRIPTION: string = '';
    procesS_AREA_DATA: ProcessAreaModel[] = []
}

export class ProcessAreaModel {
    procesS_AREA_DESCRIPTION: string = '';
    servicE_AREA_NAME: string = '';
    process: ProcessModel[] = []
}

export class ChecklistExecutionViewModel {
    audiT_CHECKLIST_EXECUTION_SUMMARY: ChecklistExecutionSummary = new ChecklistExecutionSummary();
    audiT_CHECKLIST_BY_SERVICE_AREA_LIST: AuditChecklistModelNew[] = [];
}

export class ChecklisExecutionDetails {
    id: number = 0;
    assessmenT_ID: number = 0;
    pM_CHECKLIST_QUESTION_ID: number = 0;
    statuS_VALUE_ID: number = 0;
    servicE_AREA_ID: number = 0;
    procesS_ID: number = 0;
    procesS_MODEL_ID: number = 0;
    procesS_AREA_ID: number = 0;
    status: string = '';
    notes: string = '';
    score: number = 0;
    maX_SCORE: number = 0;
    updateD_SCORE: number = 0;
    issubmitted: boolean = false;
    statuS_CATEGORY: string = '';
    weightagE_SCORE: number = 0;
    weightagE_TITLE: string = '';
    weightagE_ID: number = 0;
    versioN_ID: number = 0;
    procesS_AREA_DESCRIPTION: string = '';
    procesS_DESCRIPTION: string = '';
    procesS_MODEL_DESCRIPTION: string = '';
    projecT_ID: string = '';
    customeR_ID: string = '';
    looK_FOR: string = '';
    iS_WEIGHTAGE_APPLICABLE: boolean = false;
    findingstypE_ID: number = 0;
    findings: ObservationModel[] = [];
}

export class ChecklistExecutionSummary {
    id: number = 0;
    assessmenT_ID: number = 0;
    customeR_ID: string = '';
    projecT_ID: string = '';
    checklisT_ID: number = 0;
    planneD_AUDIT_START_DATE: string = '';
    planneD_AUDIT_END_DATE: string = '';
    actuaL_AUDIT_START_DATE: string = '';
    actuaL_AUDIT_END_DATE: string = '';
    audiT_PLANNED_HOURS: number = 0;
    audiT_ACTUAL_HOURS: number = 0;
    audiT_TITLE: string = '';
    auditoR_ID: string = '';
    versioN_ID: number = 0;
    score: number = 0;
    maturitY_LEVEL_ID: number = 0;
    percentagE_SCORE: number = 0;
    maiL_SENT: boolean = false;
    issubmitted: boolean = false;
    auditeE_LIST: string[] = [];
    cC_LIST: string[] = [];
    tO_LIST: string[] = [];
    isactive: boolean = true;
    totaL_SCORE: number = 0;
    updateD_SCORE: number = 0;
    updateD_PERCENTAGE_SCORE: number = 0;
    createD_DATE: Date = new Date();
    updateD_DATE: Date = new Date();
}

export class ChecklistNew {
    checklisT_ID: number = 0;
    checklisT_NAME: string = '';
    versioN_ID: number = 0;
    overalL_SCORE: number = 0;
    correctivE_ACTION_TRACKING: boolean = false;
    weightage: number = 0;
    weightagE_APPLICABLE_FLAG: boolean = false;
    findingstypE_ID: number = 0;
    overalL_SCORE_PERCENT: number = 0;
    mappeD_CHECKLIST: boolean = false;
    findingtypE_VALUES: string[] = [];
    auditeE_NAMES: string[] = [];
    cC_LIST: string[] = [];
    tO_LIST: string[] = [];
    checklisT_STATUS_LIST_ID: number = 0;
    checklisT_STATUS_LIST_VALUES: any[] = [];
    audiT_CHECKLIST_EXECUTION_SUMMARY: ChecklistExecutionSummary = new ChecklistExecutionSummary();
    checkpointS_BY_SERVICE_AREA: AuditChecklistModelNew[] = [];
    mappeD_PROCESS_MODEL: number = 0;
    maturitY_LEVEL_APPLICABLE: boolean = false;
    maturitY_LEVEL_ID: number = 0;
    maturitY_LEVEL_TITLE: string = '';
    pM_MATURITYLEVEL_MAPPINGS: any[] = [];
}

export class AuditChecklistByProcessModel {
    procesS_MODEL_ID: number = 0;
    procesS_MODEL_NAME: string = '';
    checkpointS_BY_PROCESS_AREA: AuditChecklistByProcessArea[] = [];
}

export class AuditChecklistByProcessArea {
    procesS_AREA_ID: number = 0;
    procesS_AREA_NAME: number = 0;
    maX_SCORE: number = 0;
    scorE_ACHIEVED: number = 0;
    percentage: number = 0;
    updateD_SCORE: number = 0;
    checkpointS_BY_PROCESS: AuditChecklistByProcess[] = [];
}

export class custData {
    cusT_ID: string = '';
    cusT_NM: string = '';
    isselected: boolean = false;
}

export class AuditChecklistModelNew {
    servicE_AREA_ID: number = 0;
    servicE_AREA_NAME: string = '';
    maX_SCORE: number = 0;
    scorE_ACHIEVED: number = 0;
    percentage: number = 0;
    updateD_SCORE: number = 0;
    checkpointS_BY_PROCESS_MODEL: AuditChecklistByProcessModel[] = [];
}

export class AuditChecklistByProcess {
    procesS_ID: number = 0;
    procesS_NAME: string = '';
    maX_SCORE: number = 0;
    scorE_ACHIEVED: number = 0;
    percentage: number = 0;
    updateD_SCORE: number = 0;
    checkpoints: ChecklisExecutionDetails[] = [];
}

export class ServiceAreaModelNew {
    id: number = 0;
    title: string = '';
    description: string = '';
    createD_BY: string = localStorage.getItem('empid') || '';
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid') || '';
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    isMapped: boolean = false;
    show_in_Master: boolean = true;
}

export class ProcessAreaModelNew {
    id: number = 0;
    title: string = '';
    description: string = '';
    createD_BY: string = localStorage.getItem('empid') || '';
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid') || '';
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    checked: boolean = false;
    show_in_Master: boolean = true;
}

export class ProcessModelProcessMapping {
    id: number = 0;
    procesS_MODEL_ID: number = 0;
    procesS_ID: number = 0;
    createD_BY: string = localStorage.getItem('empid') || '';
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid') || '';
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}

export class ProcessServiceAreaMapping {
    id: number = 0;
    servicE_AREA_ID: number = 0;
    procesS_ID: number = 0;
    createD_BY: string = localStorage.getItem('empid') || '';
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid') || '';
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}

export class ProcessObjectiveMapping {
    id: number = 0;
    objectiveS_ID: number = 0;
    procesS_ID: number = 0;
    createD_BY: string = localStorage.getItem('empid') || '';
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid') || '';
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}

export class ProcessModel {
    procesS_DESCRIPTION: string = '';
    checkpoints: CheckListExecutionModel[] = [];
}

export class ProcessModelNew {
    id: number = 0;
    procesS_AREA_ID: number = 0;
    title: string = "";
    description: string = "";
    procesS_MODEL_REFERENCE_LIST: number[] = [];
    createD_BY: string = localStorage.getItem('empid') || '';
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid') || '';
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    bSelected: boolean = false;
    show_in_Master: boolean = true;
}

export class ProcessServiceAreaMappingList {
    id: number = 0;
    serviceAreaId: number = 0;
    processAreaId: number = 0;
    processTitle: string = '';
    processDescription: string = '';
    serviceAreaName: string = '';
    processArea: string = '';
    processId: number = 0;
    createD_BY: string = localStorage.getItem('empid') || '';
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid') || '';
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}

export class ObservationModel {
    findingS_ID: number = 0;
    findinG_DESCRIPTION: string = '';
    findinG_TYPE: string = '';
    ofI_DESCRIPTION: string = '';
    besT_PRACTICE_DESCRIPTION: string = '';
    findinG_CATEGORY: string = '';
    ischecked: boolean = false;
    isactive: boolean = true;
    remarks: string = '';
    id: number = 0;
    issubmitted: boolean = false;
    procesS_ID: number = 0;
    servicE_AREA_ID: number = 0;
    procesS_MODEL_ID: number = 0;
    gO_CATEGORY: string = '';
}

export class AuditSampleModel {
    emP_ID: string = '';
    totaL_SAMPLES_AUDITED: number = 0;
    sampleS_COMPLIED: number = 0;
    sampleS_NOTCOMPLIED: number = 0;
    percentage: number = 0;
    comments: string = '';
}

export class ObjectiveNew {
    id: number = 0;
    title: string = '';
    description: string = '';
    referencE_DOCUMENT: string = '';
    filE_NAME_SERVER: string = '';
    createD_BY: string = '';
    createD_DATE: Date = new Date();
    updateD_BY: string = '';
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    isMapped: boolean = false;
    bSelected: boolean = false;
}
