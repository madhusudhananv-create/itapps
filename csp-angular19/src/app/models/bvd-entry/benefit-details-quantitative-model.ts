export class BenefitDetailsQuantitative {
    id: number = 0;
    benefiT_SUMMARY_ID: number = 0;
    benefitS_ARRAY: Benefits[] = [];
    createD_BY: string = '';
    createD_DATE!: Date;
    updateD_BY: string = '';
    updateD_DATE!: Date;
    isactive: boolean = true;
}

export class Benefits {
    id: number = 0;
    currenT_STATE_MONTH: number = 0;
    currenT_STATE_YEAR: number = 0;
    futurE_STATE_MONTH: number = 0;
    futurE_STATE_YEAR: number = 0;
    neT_BENEFITS_MONTH: number = 0;
    neT_BENEFITS_YEAR: number = 0;
    uoM_ID: number = 0;
    title: string = '';
    datatype: string = '';
}

export class IdeaCategoryUOMMapping {
    id: number = 0;
    ideA_CATEGORY_ID: number = 0;
    uoM_ID: number = 0;
    isactive: boolean = true;
}

export class uom {
    id: number = 0;
    title: string = '';
    datatype: string = '';
    type: string = '';
    isactive: boolean = true;
}

export class IdeaCategory {
    id: number = 0;
    title: string = '';
    isactive: boolean = false;
}
