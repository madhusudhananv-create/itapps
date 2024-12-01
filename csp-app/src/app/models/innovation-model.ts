export class InnovationModel {
    id:number;
    projecT_ID:string;
    rag;stringl
    identifieD_DATE:Date;
    description:string;
    status:string;
    targeT_DATE:Date;
    actuaL_DATE:Date;
    responsible:string;
    area:string;
    beforE_ERROR:string;
    beforE_CYCLE_TIME:string;
    beforE_LEAD_TIME : number;
    afteR_LEAD_TIME : number;
    beforE_EFFORT:string;
    afteR_ERROR:string;
    afteR_CYCLE_TIME:string;
    afteR_EFFORT:string;
    customeR_SAVINGS:string;
    customeR_PERSONHOUR_SAVINGS : number;
    financiaL_REVENUE:string;
    financiaL_OPERATING_COST:string;
    financiaL_PROFITABILITY:string;
    automate:boolean;
    tooL_USED:string;
    referencE_IDEA_ID:number;
    isinnovation:boolean;
    isprocessimprovement:boolean;
    innovatioN_DESCRIPTION:string;
    procesS_IMPROVEMENT_DESCRIPTION:string;
    comments:string;
    createD_BY:string;
	createD_DATE:Date;
	updateD_BY:string;
	updateD_DATE:Date;
    isactive:Boolean;
    approach : string;
    beforE_CASES_COUNT : number;
    afteR_CASES_COUNT : number;
    afteR_FTECOST_HOUR : number;
    beforE_FTECOST_HOUR : number;
    afteR_FTECOST_MONTH : number;
    beforE_FTECOST_MONTH : number;
    beforE_FTESPENT_MONTH : number;
    afteR_FTESPENT_MONTH : number;
    afteR_COST : string;
    beforE_COST : string;
    internaL_SAVINGS : string;
    customeR_BUSINESS_VALUE : string;
    beforE_OCCOURANCE_COUNT : number;
    afteR_OCCOURANCE_COUNT : number;
    gavS_SERVICE :GAVSService[]=[];
    qualitY_REDUCTION_OF_ERRORS : number;
    reductioN_IN_LEAD_TIME : number;
    reductioN_IN_CYCLE_TIME : number;

    reductioN_IN_LEAD_TIME_DATA : string;
    reductioN_IN_CYCLE_TIME_DATA : string;

    savinG_PER_YEAR_EFFORT : number;
    automatioN_INDEX :number;
    savingS_IN_USD : number;
    harD_BENEFITS : number;
    revenue : number;
    operatinG_COST : number;
    profitability : number;
    iS_ONETIME : boolean = false;

    beforE_CYCLE_TIME_UOM :number = 1;
    beforE_LEAD_TIME_UOM :number = 1;
    beforE_TIME_TAKEN_UOM :number = 1;

    afteR_CYCLE_TIME_UOM :number = 1;
    afteR_LEAD_TIME_UOM :number = 1;
    afteR_TIME_TAKEN_UOM :number = 1;

    beforE_TIME_TAKEN : number;
    afteR_TIME_TAKEN : number;

}
export class GAVSService
{
  servicE_ID:number;
  iS_CHECKED:Boolean = false;
}

export class InnovationModelExt extends InnovationModel{
    cusT_ID: string;
    cusT_NM: string;
    portfoliO_ID: number;
    portfoliO_NM: string;
    proJ_NM: string;
}