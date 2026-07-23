export class ObservationModel {
  findingS_ID: number = 0;
  findinG_DESCRIPTION: string = '';
  findinG_TYPE: string = '';
  ofI_DESCRIPTION: string = '';
  besT_PRACTICE_DESCRIPTION: string = '';
  findinG_CATEGORY: string = '';
  ischecked: boolean = false;
  isactive: boolean = true;
  remarks: string = '';
  id: number = 0;
  issubmitted: boolean = false;
  procesS_ID: number = 0;
  servicE_AREA_ID: number = 0;
  procesS_MODEL_ID: number = 0;
  gO_CATEGORY: string = '';
}

export class AuditSampleModel {
  emP_ID: string = '';
  totaL_SAMPLES_AUDITED: number = 0;
  sampleS_COMPLIED: number = 0;
  sampleS_NOTCOMPLIED: number = 0;
  percentage: number = 0;
  comments: string = '';
}

export class FindingsForQuestion {
  findinG_TYPE: string[] = [];
  findinG_DESCRIPTION: string[] = [];
}
