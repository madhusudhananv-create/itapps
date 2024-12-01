
import { failurE_MODE_MASTER } from "../fmea-model";

export class FailureModeInput {
    projectid: string;
    serviceareaId: number;
    processId: number;
    servicelevel: number;
    taskId: number;
}

export class ProjectFailures {
    id: number;
    failurE_MODE_ID: number;
    projecT_ID: string;
    rF_OCCURRENCE_ID: number;
    rF_SEVERITY_ID: number;
    rF_DETECTION_ID: number;
    rpn: number;
    currenT_DETECTION_CONTROL: string;
    currenT_PREVENTIVE_CONTROL: string;
    responsible: string;
    targeT_DATE: Date = new Date();
    recommendeD_DETECTIVE_CONTROL: string;
    recommendeD_PREVENTIVE_CONTROL: string;
    potentiaL_EFFECT_OF_FAILURE: string;
    potentiaL_CAUSE_FACTOR: number;
    potentiaL_CAUSE: string;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    isapplicable: boolean;
    isapproved: boolean;
}

export class ProjectFailureDetails {
    id: number;
    fmeA_TYPE_ID: number;
    servicE_AREA_ID: number;
    procesS_ID: number;
    servicE_LEVEL_IDENTIFIER_ID: number;
    tasK_ID: number;
    functioN_ACTIVITIES: string;
    potentiaL_FAILURE_MODE: string;
    potentiaL_EFFECT_OF_FAILURE: string;
    potentiaL_CAUSE_FACTOR: number;
    potentiaL_CAUSE: string;
    mappinG_ID: number;
    failurE_MODE_ID: number;
    projecT_ID: string;
    occurencE_RATING: string;
    severitY_RATING: string;
    detectioN_RATING: string;
    rF_OCCURRENCE_ID: number;
    rF_SEVERITY_ID: number;
    rF_DETECTION_ID: number;
    rpn: number;
    currenT_DETECTION_CONTROL: string;
    currenT_PREVENTIVE_CONTROL: string;
    responsible: string;
    targeT_DATE: Date = new Date();
    recommendeD_DETECTIVE_CONTROL: string;
    recommendeD_PREVENTIVE_CONTROL: string;
    currenT_STATUS: boolean;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date()
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    isapplicable: boolean;
    isapproved: boolean;
    isselected: boolean;
}

export class FailureAssessment {
    id: number;
    projecT_FAILURES_MAPPING_ID: number;
    futurE_RF_OCCURRENCE_ID: number;
    futurE_RF_SEVERITY_ID: number;
    futurE_RF_DETECTION_ID: number;
    futurE_RPN: number;
    targeT_DATE: Date = new Date();
    actioN_TAKEN: string;
    actioN_TAKEN_BY: string;
    actioN_TAKEN_ON: Date;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    functioN_ACTIVITIES: string;
    potentiaL_FAILURE_MODE: string;
    potentiaL_EFFECT_OF_FAILURE: string;
    potentiaL_CAUSE_FACTOR: number;
    potentiaL_CAUSE: string;
    rF_OCCURRENCE_ID: number;
    rF_SEVERITY_ID: number;
    rF_DETECTION_ID: number;
    rpn: number;
    currenT_DETECTION_CONTROL: string;
    currenT_PREVENTIVE_CONTROL: string;
}