export class Idea {
  id: number = 0;
  cusT_ID: string = '';
  projecT_ID: string = '';
  servicE_AREA_ID: number = 0;
  ideA_STATUS_ID: number = 0;
  description: string = '';
  potentiaL_SOLUTION_DESCRIPTION: string = '';
  potentiaL_SOLUTION_CATEGORY_ID: number = 0;
  ideA_IMPROVEMENT_TYPE_ID: number = 0;
  identifieD_BY: any = [];
  identifieD_DATE: string = '';
  procesS_AREA_ID: number = 0;
  procesS_ID: number = 0;
  comments: string = '';
  created_by: string = '';
  created_date!: Date;
  updated_by: string = '';
  updated_time!: Date;
  isactive: boolean = true;
  issubmitted: boolean = false;
  stagE_ID: number = 0;
  revieW_COMMENTS: string = '';
  portfoliO_ID: number = 0;
}

export class IdeaStatus {
  id: number = 0;
  title: string = '';
  stagE_ID: number = 0;
  isactive: boolean = true;
}

export class PotentialSolutionCategory {
  id: number = 0;
  title: string = '';
  isactive: boolean = true;
}

export class IdeaImprovementType {
  id: number = 0;
  type: string = '';
  isactive: boolean = true;
}

export class IdeaViewModel {
  id: number = 0;
  description: string = '';
  identifieD_DATE: string = '';
  projecT_NAME: string = '';
  responsible: string = '';
  identified_By: string = '';
  status: string = '';
  type: string = '';
  targeT_DATE: string = '';
  CUSTOMER_NAME: string = '';
}

