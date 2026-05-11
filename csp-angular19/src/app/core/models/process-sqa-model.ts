export class ProcessModelModel {
    id: number = 0;
    title: string = '';
    description: string = '';
    releasE_VERSION_REFERENCE: string = '';
    createD_DATE: Date = new Date();
    createD_BY: string = '';
    updateD_DATE: Date = new Date();
    updateD_BY: string = '';
    isactive: boolean = true;
    releasE_DATE: Date = new Date();
    industrY_STANDARD_REFERENCE: any = '';
    retiremenT_DATE: string | number | Date = '';
}

export class ProcessSqaServiceArea {
    id: number = 0;
    procesS_MODEL_ID: number = 0;
    procesS_AREA_DESCRIPTION: string = '';
    maturitY_LEVEL: number = 0;
    gavS_SERVICE_AREA: number = 0;
    createD_DATE: Date = new Date();
    createD_BY: string = '';
    updateD_DATE: Date = new Date();
    updateD_BY: string = '';
    isactive: boolean = true;
}

export class ProcessSqaProcess {
    id: number = 0;
    procesS_AREA_ID: number = 0;
    title: string = '';
    description: string = '';
    maturitY_LEVEL: number = 0;
    createD_DATE: Date = new Date();
    createD_BY: string = '';
    updateD_DATE: Date = new Date();
    updateD_BY: string = '';
    isactive: boolean = true;
}

export class ProcessSQAObjective {
    id: number = 0;
    objectivE_ID: number = 0;
    title: string = '';
    description: string = '';
    procesS_ID: number = 0;
    maturitY_LEVEL: number = 0;
    createD_DATE: Date = new Date();
    createD_BY: string = '';
    updateD_DATE: Date = new Date();
    updateD_BY: string = '';
    isactive: boolean = true;
}

export class ProcessSQAObjectiveNew {
    id: number = 0;
    process_ID: number = 0;
    title: string = '';
    description: string = '';
    reference_DOCUMENT: string = '';
    filename_SERVER: string = '';
    created_DATE: Date = new Date();
    createD_BY: string = '';
    updateD_DATE: Date = new Date();
    updateD_BY: string = '';
    isactive: boolean = true;
}

export class RiskCategory {
    id: number = 0;
    title: string = '';
}

export class RiskCategory2 {
    id: number = 0;
    title: string = '';
    risK_LEVEL1_ID: number = 0;
}

export class RiskOwner {
    id: number = 0;
    title: string = '';
    sorT_ORDER: number = 0;
}

export class ProcessModelRisksNew {
    id: number = 0;
    title: string = '';
    description: string = '';
    risK_CATEGORY_LEVEL1: number = 0;
    risK_CATEGORY_LEVEL2: number = 0;
    risK_CATEGORY_LEVEL3: number = 0;
    risK_OWNER: string = '';
    referencE_DOCUMENT: string = '';
    filE_NAME_SERVER: string = '';
    createD_BY: string = '';
    createD_DATE: Date = new Date();
    updateD_BY: string = '';
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}
