export class findingModel
{
  cusT_ID : string;
  starT_DATE : string;
  enD_DATE : string;
  proJ_ID : string;
  assessmenT_ID : number;
  iS_FROM_DASHBOARD : boolean;
}

export class findingByType
{
  constructor(type: string)
  {
    this.findinG_TYPE = type;
    this.findings = [];
  }
  findinG_TYPE : string;
  findings : findingDetails[];
}

export class findingDetails
{
  id : number;
  findinG_TYPE : string
  findinG_DESCRIPTION : string;
  stagE_DESCRIPTION: string;
  stagE_STATUS : string;
  customeR_ID : string;
  projecT_ID : string
  cusT_NM : string;
  proJ_NM: string;
  portfoliO_ID : number;
  portfoliO_NAME : string;
  createD_DATE : Date;
  updateD_DATE : Date;
  targeT_DATE : Date;
  responsible : string;
  url : string;
  agE_OF_FINDING_IN_DAYS : string ;
  statuS_DATE: Date;
}
