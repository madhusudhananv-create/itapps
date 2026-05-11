export class IdeaBenefitSummary {
  id: number = 0;
  ideA_ID: number = 0;
  benefiT_PILLAR_ID: number = 0;
  typE_ID: number = 0;
  beneficiarY_ID: number = 0;
  benefiT_TYPE_ID: number = 0;
  categorY_ID: number = 0;
  iS_ONETIME: boolean = false;
  categories: any[] = [];
  createD_BY: string = '';
  createD_DATE!: Date;
  updateD_BY: string = '';
  updateD_DATE!: Date;
  isactive: boolean = true;
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
