export class ChecklistModel {
    id: number;
    version: number;
    title: string;
    description: string;
    effectivE_FROM: string;
    maturitY_LEVEL: boolean = false;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: string;
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: string;
    isactive: boolean = true;
    bSelected: boolean = false;
    iS_WEIGHTAGE_APPLICABLE: boolean = false;
    procesS_MODEL_ID: number;
    statuS_LIST_ID: number;
    iS_APPROVED: boolean;
    iS_CHECKED: boolean = false;
    correctivE_ACTION_TRACKING: Boolean;
    findingstypE_ID: number;
    updateD_NAME: string;
    findingtypE_VALUE: string;
    iS_MERGED: boolean = false;
}

export class ChecklistQuestionsModelNew {
    id: number;
    displaY_ORDER: number;
    checklisT_ID: number;
    title: string;
    version: number;
    effectivE_FROM: string = new Date().toDateString();
    weightagE_ID: number;
    globaL_PERSPECTIVE_ID: number;
    maturitY_LEVEL: string;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: string = new Date().toDateString();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: string = new Date().toDateString();
    isactive: boolean = true;
    bSelected: boolean = false;
}
export class ProcessChecklistMappingModel {
    id: number;
    checklisT_ID: number;
    procesS_ID: number;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}


export class ProcessChecklistQuestionsMappingModel {
    id: number;
    questioN_ID: number;
    procesS_ID: number;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    checklisT_ID: number;
}

export class PM_MATURITYLEVEL_MAPPING {
    procesS_MODEL_ID: number;
    maturitY_LEVEL_ID: number;
    leveL_NUMBER: string;
    leveL_TITLE: string;
    leveL_DESC: string;
    createD_BY: string = localStorage.getItem('empid');
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}

export class AuditCheckListWeightage {
    id: number;
    checklisT_ID: number;
    weightagE_ID: number;
    weightagE_TITLE: string;
    createD_BY: string = localStorage.getItem('empid');
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    weightagE_SCORE: number;
    iS_CHECKED: boolean = true;
    iS_USED_IN_SUMBITTED_ASSESSMENT: boolean = false;

}

export class AuditStatusList {
    status: string;
    multiplier: number;
    statuS_IND: string;

    // constructor(value: string) {
    //     this.statuS_IND = value;
    // }
}

// id: number;
// title:string;
// weightagE_ID: number;
// category: string;
// requirementReference:string
