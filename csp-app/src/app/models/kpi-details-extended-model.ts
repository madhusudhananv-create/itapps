import { kpidetails } from "./kpi-details";
import {enumKPIDetailsStatus} from '../Shared/enum';

export class KpiDetailsExtendedModel extends kpidetails {
    customeR_ID: string;
    customeR_NM: string;
    projecT_ID: string;
    projecT_NM: string;
    goaL_ID: number;
    globaL_KPI_CATEGORY_ID: number;
    iS_SOW_COMMITMENT: boolean;
    servicE_AREA: string;
    slA_TARGET_UNIT_OF_MEASUREMENT: string;
    slA_TARGET_HIGH_VALUE: number;
    slA_TARGET_HIGH_OPERATOR: string;
    slA_TARGET_MEDIUM_VALUE: number;
    slA_TARGET_MEDIUM_OPERATOR: string;
    slA_TARGET_LOW_VALUE: number;
    slA_TARGET_LOW_OPERATOR: string;
}

export class TreeHealthReportCustomer{
    customeR_NM:string;
    customeR_ID:string;
    projects:TreeHealthReportProject[] = [];
}
export class TreeHealthReportProject{
    projecT_NM:string;
    projecT_ID:number;
    kpI_GLOBAL_CATEGORY:TreeHealthReportCategory[] = [];
}
export class TreeHealthReportCategory{
    globaL_KPI_CATEGORY_NM:string;
    globaL_KPI_CATEGORY_ID:number;
    percent:number;
    green:number;
    amber:number;
    red:number;
    blue:number;
}
export class SLARejectionDetails
{
      slA_Rejection_data : SLA_Rejection_Data[]  
        
}

export class SLA_Rejection_Data {
    rejectioN_COMMENTS : string[]
    slA_REJECTION_KPI_DETAILS  : SLA_Rejection_KPI_Details[] 
}

export class SLA_Rejection_KPI_Details
{
    rejectioN_ID : number
    kpI_DETAILS_ID : number
    comment : string = ""
    statuS_ID : number
    rejectioN_STATUS : string
}

export class KPIDetailsForProduct
{
         kpI_ID :number;
         producT_ID :number;
         servicE_AREA_ID : number;
         servicE_LEVEL_METRICS : string
         specificationN_LIMIT : string
         expecteD_SERVICE_LEVEL : number
         minimuM_SERVICE_LEVEL : number
         uniT_OF_MEASUREMENT : string
         kpI_ACTUAL : string
         servicE_LEVEL_METRIC_DESCRIPTION : string
         servicE_AREA_TYPE : string
         servicE_LEVEL_ID :number
         servicE_LEVEL : string
         CATEGORY_ID : number
         SLA_CATEGORY : string
         SUPPORT_WINDOW : string
         PRIORITY : string
         referencE_ID :number
         reference : string
         risK_POOL_ALLOCATION : string
         frequency : string
         minimuM_TARGET_OPERATOR : string
         expecteD_TARGET_OPERATOR : string
         starT_DATE : Date
         enD_DATE : Date
         slA_STATUS : string
         iS_NOT_APPLICABLE : boolean
         remarks : string
         secondarY_SLA_STATUS : string
         kpI_STATUS_ID : enumKPIDetailsStatus    
         detaiL_ID :number
         modE_ID :number     
         guid : string
         baseMeasureDataList : any
         capaStage : any
         disputeOverallReason : KPIDisputeOverallReason = new KPIDisputeOverallReason();
}

export class KPIDisputeOverallReason{
    ID:number;
    overalL_DISPUTE_RAISED_REASON:string;
    overalL_DISPUTE_REJECT_REASON:string;
    disputE_DATE :Date
}
