
export class IdeaBenefitSummary {
    id: number
    ideA_ID: number
    benefiT_PILLAR_ID: BENEFIT_PILLAR
    typE_ID: TYPE
    beneficiarY_ID: BENEFICIARY
    benefiT_TYPE_ID: BENEFIT_TYPE
    categorY_ID: number;
    iS_ONETIME: boolean;
    categories: any[] = [];
    createD_BY: string
    createD_DATE: Date
    updateD_BY: string
    updateD_DATE: Date
    isactive: boolean
}

enum BENEFIT_PILLAR {
    People = 1,
    Process = 2,
    Technology = 3,
    Facilities = 4,
    Assets = 5
}

enum TYPE {
    Value = 1,
    Value_Add = 2
}

enum BENEFICIARY {
    Internal = 1,
    Customer = 2
}

enum BENEFIT_TYPE {
    Quantitative = 1,
    Qualitative = 2
}

export default {
    BENEFIT_PILLAR,
    TYPE,
    BENEFICIARY,
    BENEFIT_TYPE
}