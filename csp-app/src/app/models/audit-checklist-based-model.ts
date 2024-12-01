import { CheckListExecutionModel } from "./checklist-execution";
import { SetupChecklistNewComponent } from './../pages/process-model/setup-checklist-new/setup-checklist-new.component';

export class AuditCheckListModel {
    procesS_MODEL_DESCRIPTION: string;
    procesS_AREA_DATA: ProcessAreaModel[] = []
}
export class ProcessAreaModel {
    procesS_AREA_DESCRIPTION: string;
    servicE_AREA_NAME: string
    process: ProcessModel[] = []
}
export class ChecklistExecutionViewModel
{
    audiT_CHECKLIST_EXECUTION_SUMMARY : ChecklistExecutionSummary = new ChecklistExecutionSummary();
    audiT_CHECKLIST_BY_SERVICE_AREA_LIST : AuditChecklistModelNew[] = [];
}

export class ChecklisExecutionDetails
{
    id : number;
    assessmenT_ID : number;
    pM_CHECKLIST_QUESTION_ID : number;
    statuS_VALUE_ID : number;
    servicE_AREA_ID: number;
    procesS_ID: number;
    procesS_MODEL_ID : number;
    procesS_AREA_ID : number;
    status: string;
    notes: string;
    score : number;
    maX_SCORE : number;
    updateD_SCORE : number;
    issubmitted: boolean;
    statuS_CATEGORY : string;
    weightagE_SCORE : number;
    weightagE_TITLE : string;
    weightagE_ID : number;
    versioN_ID : number;
    procesS_AREA_DESCRIPTION : string;
    procesS_DESCRIPTION : string;
    procesS_MODEL_DESCRIPTION : string;
    projecT_ID : string;
    customeR_ID : string;
    looK_FOR : string;
    iS_WEIGHTAGE_APPLICABLE : boolean;
    findingstypE_ID : number;
    findings : ObservationModel[];
}

export class ChecklistExecutionSummary
{
    id : number;
    assessmenT_ID : number;
    customeR_ID: string;
    projecT_ID: string;
    checklisT_ID : number;
    planneD_AUDIT_START_DATE: string;
    planneD_AUDIT_END_DATE: string;
    actuaL_AUDIT_START_DATE: string;
    actuaL_AUDIT_END_DATE: string;
    audiT_PLANNED_HOURS: number;
    audiT_ACTUAL_HOURS: number;
    audiT_TITLE: string;
    auditoR_ID: string;
    versioN_ID : number;
    score : number;
    maturitY_LEVEL_ID : number;
    percentagE_SCORE: number;
    maiL_SENT : boolean;
    issubmitted: boolean;
    auditeE_LIST : string[] = [];
    cC_LIST : string[] = [];
    tO_LIST : string[] = [];
    isactive: boolean;
    totaL_SCORE : number;
    updateD_SCORE: number;
    updateD_PERCENTAGE_SCORE: number;
    createD_DATE: Date = new Date();
    updateD_DATE: Date = new Date();
}
export class ChecklistNew {
    checklisT_ID: number;
    checklisT_NAME: string;
    versioN_ID : number;
    overalL_SCORE : number;
    correctivE_ACTION_TRACKING: boolean;
    weightage : number;
    weightagE_APPLICABLE_FLAG : boolean;
    findingstypE_ID: number;
    overalL_SCORE_PERCENT : number;
    mappeD_CHECKLIST : boolean
    findingtypE_VALUES : string[];
    auditeE_NAMES: string[];
    cC_LIST: string[];
    tO_LIST : string[];
    checklisT_STATUS_LIST_ID : number;
    checklisT_STATUS_LIST_VALUES : any[];
    audiT_CHECKLIST_EXECUTION_SUMMARY : ChecklistExecutionSummary
    checkpointS_BY_SERVICE_AREA: AuditChecklistModelNew[];
    mappeD_PROCESS_MODEL : number;
    maturitY_LEVEL_APPLICABLE : boolean;
    maturitY_LEVEL_ID : number;
    maturitY_LEVEL_TITLE : string;
    pM_MATURITYLEVEL_MAPPINGS : any[];
}

export class AuditChecklistByProcessModel
{
    procesS_MODEL_ID : number;
    procesS_MODEL_NAME : string;
    checkpointS_BY_PROCESS_AREA: AuditChecklistByProcessArea[];
}

export class AuditChecklistByProcessArea
{
    procesS_AREA_ID : number;
    procesS_AREA_NAME : number;
    maX_SCORE : number;
    scorE_ACHIEVED : number;
    percentage : number;
    updateD_SCORE : number;
    checkpointS_BY_PROCESS: AuditChecklistByProcess[];
}

export class custData{
    cusT_ID : string;
    cusT_NM : string;
    isselected : boolean = false;
}

export class AuditChecklistModelNew {
    servicE_AREA_ID: number;
    servicE_AREA_NAME: string;
    maX_SCORE : number;
    scorE_ACHIEVED : number;
    percentage : number;
    updateD_SCORE : number;
    checkpointS_BY_PROCESS_MODEL: AuditChecklistByProcessModel[];
}

export class AuditChecklistByProcess
{
    procesS_ID : number;
    procesS_NAME : string;
    maX_SCORE : number;
    scorE_ACHIEVED : number;
    percentage : number;
    updateD_SCORE : number;
    checkpoints: ChecklisExecutionDetails[];
}


export class ServiceAreaModelNew {
    id: number;
    title: string;
    description: string;
    createD_BY: string = localStorage.getItem('empid');
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    isMapped: boolean = false;
    show_in_Master: boolean = true;
}

export class ProcessAreaModelNew {
    id: number ;
    title: string;
    description: string;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    checked: boolean = false;
    show_in_Master: boolean = true;
}
export class ProcessModelProcessMapping {
    id: number;
    procesS_MODEL_ID: number;
    procesS_ID: number;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}
export class ProcessServiceAreaMapping {
    id: number;
    servicE_AREA_ID: number;
    procesS_ID: number;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}
export class ProcessObjectiveMapping {
    id: number;
    objectiveS_ID: number;
    procesS_ID: number;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}
export class ProcessModel {
    procesS_DESCRIPTION: string;
    checkpoints: CheckListExecutionModel[];
    // observation:ObservationModel[] = [];
}
export class ProcessModelNew {
    id: number;
    procesS_AREA_ID: number = 0;
    title: string = "";
    description = "";
    procesS_MODEL_REFERENCE_LIST: number[];
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    bSelected = false;
    show_in_Master: boolean = true;
}


export class ProcessServiceAreaMappingList {
    id: number;
    serviceAreaId: number;
    processAreaId: number;
    processTitle:string;
    processDescription:string;
    serviceAreaName:string;
    processArea:string;
    processId: number;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}
export class ObservationModel {
    findingS_ID: number;
    findinG_DESCRIPTION: string;
    findinG_TYPE: string;
    ofI_DESCRIPTION: string;
    besT_PRACTICE_DESCRIPTION: string;
    findinG_CATEGORY : string
    ischecked : boolean;
    isactive : boolean
    remarks : string;
    id : number;
    issubmitted : boolean;
    procesS_ID : number;
    servicE_AREA_ID : number;
    procesS_MODEL_ID : number;
    gO_CATEGORY:string;
}
export class AuditSampleModel {
    emP_ID: string;
    totaL_SAMPLES_AUDITED: number;
    sampleS_COMPLIED: number;
    sampleS_NOTCOMPLIED: number;
    percentage: number;
    comments: string;
}

export class ObjectiveNew {
    id: number;
    title: string;
    description: string;
    referencE_DOCUMENT: string;
    filE_NAME_SERVER: string;
    createD_BY: string;
    createD_DATE: Date;
    updateD_BY: string;
    updateD_DATE: Date;
    isactive: boolean;
    isMapped: boolean = false;
    bSelected: boolean = false;
}