export class ReportsSPParamsModel {
  id!: number;
  reporT_SP_ID!: number;
  paraM_NAME!: string;
  paraM_TYPE!: string;
  paraM_VALUE!: string;
}

export class ReportsSPDetailsModel {
  id!: number;
  sP_NAME!: string;
  sP_DISPLAY_NAME!: string;
  dB_NAME!: string;
}

export class ServiceParams {
  paraM_NAME!: string;
  paraM_VALUE!: string[];
}
