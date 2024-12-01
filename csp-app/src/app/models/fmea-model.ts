

export class ServiceLevelIdentifier {
    id: number;
    servicE_AREA_ID: number;
    servicE_LEVEL_IDENTIFIER: string;
    servicE_LEVEL_TITLE: string;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}


export class FMEAModel {
    id: number;
    fmeA_TYPE_ID: number;
    servicE_AREA_ID: number;
    servicE_TOWER: string;
    procesS_ID: number;
    procesS: string;
    servicE_LEVEL_IDENTIFIER_ID: number;
    servicE_LEVEL: string;
    tasK_ID: number;
    tasK: string;
    tasK_CATEGORY: string;
    functioN_ACTIVITIES: string;
    potentiaL_FAILURE_MODE: string;
    potentiaL_FAILURE_EFFECT: string;
    potentiaL_CAUSE_FACTOR: number;
    potentiaL_CAUSE_FACTOR_OPTIONS: string;
    potentiaL_CAUSE: string;
    recommendeD_DETECTIVE_CONTROL: string;
    recommendeD_PREVENTIVE_CONTROL: string;
    fmeA_STATUS: number;
    cusT_ID: string;
    proJ_ID: string;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    isselected: boolean = false;
    status: string;
}

export class failurE_MODE_MASTER {
    id: number;
    fmeA_TYPE_ID: number;
    servicE_AREA_ID: number;
    servicE_TOWER: string;
    procesS_ID: number;
    procesS: string;
    servicE_LEVEL_IDENTIFIER_ID: number;
    servicE_LEVEL: string;
    tasK_ID: number;
    tasK: string;
    tasK_CATEGORY: string;
    functioN_ACTIVITIES: string;
    potentiaL_FAILURE_MODE: string;
    potentiaL_FAILURE_EFFECT: string;
    potentiaL_CAUSE_FACTOR: number;
    potentiaL_CAUSE_FACTOR_OPTIONS: string;
    potentiaL_CAUSE: string;
    recommendeD_DETECTIVE_CONTROL: string;
    recommendeD_PREVENTIVE_CONTROL: string;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}

export class FMEAStage2Bulk {
    id: number;
    isapplicable: boolean;
    isapprove: boolean;
    isreject: boolean;
}


export class FMEAStage2Model {
    id: number;
    fmeA_DATA_ID: number;
    functioN_ACTIVITIES: string;
    rF_OCCURRENCE_ID: number;
    occurrencE_CRITERIA: string;
    occurrencE_RATING: string;
    occurrencE_RATING_DEFINITION: string;
    occurrencE_DEFINITION: string;
    rF_SEVERITY_ID: number;
    severitY_CRITERIA: string;
    severitY_RATING: string;
    severitY_RATING_DEFINITION: string;
    severitY_DEFINITION: string;
    rF_DETECTION_ID: number;
    detectioN_CRITERIA: string;
    detectioN_RATING: string;
    detectioN_RATING_DEFINITION: string;
    detectioN_DEFINITION: string;
    rpn: number;
    currenT_DETECTION_CONTROL: string;
    currenT_PREVENTIVE_CONTROL: string;
    responsible: string;
    targeT_DATEDate = new Date();
    isapplicable: boolean;
    isapprove: boolean;
    isreject: boolean;
    potentiaL_FAILURE_MODE: string;
    potentiaL_FAILURE_EFFECT: string;
    potentiaL_CAUSE_FACTOR: string;
    potentiaL_CAUSE: string;
    selected: boolean;
    recommendeD_DETECTIVE_CONTROL_STAGE2: string;
    recommendeD_PREVENTIVE_CONTROL_STAGE2: string;
    fmeA_STATUS_STAGE2: number;
    rejectT_COMMENTS_STAGE2: string;
    cusT_ID: string;
    proJ_ID: string;
    fmeA_STAGE2_STATUS_DESC: string;
}


export class FMEAStage3Model {

    id: number;
    fmeA_DATA_ID: number;
    functioN_ACTIVITIES: string;

    futurE_ACTION_TAKEN: string;
    futurE_ACTION_TAKEN_BY: number;
    futurE_ACTION_TAKEN_ON = new Date();

    futurE_RF_OCCURRENCE_ID: number;
    futurE_OCCURRENCE_CRITERIA: string;
    futurE_OCCURRENCE_RATING: string;
    futurE_OCCURRENCE_RATING_DEFINITION: string;
    futurE_OCCURRENCE_DEFINITION: string;

    futurE_RF_SEVERITY_ID: number;
    futurE_SEVERITY_CRITERIA: string;
    futurE_SEVERITY_RATING: string;
    futurE_SEVERITY_RATING_DEFINITION: string;
    futurE_SEVERITY_DEFINITION: string;

    futurE_RF_DETECTION_ID: number;
    futurE_DETECTION_CRITERIA: string;
    futurE_DETECTION_RATING: string;
    futurE_DETECTION_RATING_DEFINITION: string;
    futurE_DETECTION_DEFINITION: string;
    futurE_RPN: number;
    fmeA_STATUS_STAGE3: number;
    rejectT_COMMENTS_STAGE3: string;

    rF_OCCURRENCE_ID: number;
    rF_SEVERITY_ID: number;
    rF_DETECTION_ID: number;
}


export class FMEARatingFactorsModel {
    id: number;
    ratinG_FACTORS_CRITERIA: string;
    ratinG_FACTORS_RATING: number;
    ratinG_FACTORS_CATEGORY: string;
    ratinG_DEFINITION: string;
}

export class ServiceAreaModelNew {
    id: number;
    title: string;
    description: string;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    isMapped: boolean = false;
}

export class ProcessAreaModelNew {
    id: number = -1;
    title: string;
    description: string;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}

