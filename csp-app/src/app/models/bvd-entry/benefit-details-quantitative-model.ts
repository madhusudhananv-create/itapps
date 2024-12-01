export class BenefitDetailsQuantitative {
    id: number;
    benefiT_SUMMARY_ID: number;
    benefitS_ARRAY: Benefits[] = [];
    createD_BY: string
    createD_DATE: Date
    updateD_BY: string
    updateD_DATE: Date
    isactive: boolean
}

export class Benefits {
    id: number;
    currenT_STATE_MONTH: number
    currenT_STATE_YEAR: number
    futurE_STATE_MONTH: number
    futurE_STATE_YEAR: number
    neT_BENEFITS_MONTH: number
    neT_BENEFITS_YEAR: number
    uoM_ID: number;
    title: string;
    datatype: string;
}

export class IdeaCategoryUOMMapping {
    id: number
    ideA_CATEGORY_ID: number
    uoM_ID: number
    isactive: boolean
}

export class uom {
    id: number
    title: string
    datatype: string
    type: string
    isactive: boolean
}

export class IdeaCategory {
    id: number
    title: string
    isactive: false
}