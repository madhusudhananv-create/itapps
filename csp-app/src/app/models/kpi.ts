import { kpidetails } from "./kpi-details";

export class kpi {
	id: number;
	customeR_ID: string;
	projecT_ID: string;
	succesS_GOAL: string;
	goaL_ID: number;
	servicE_AREA: string;
	kpI_NAME: string;
	kpI_UNIQUEID:string;
	abbreviation: string;
	supporT_WINDOW: string;
	frequency: string;
	priority: string;
	slA_TARGET_UNIT_OF_MEASUREMENT: string;
	displaY_ORDER: number;
	servicE_TOWER_ID: number;
	charT_TYPE: string;
	shoW_IN_CHART: Boolean;
	globaL_KPI_CATEGORY_ID:number;
	createD_BY: string;
	createD_DATE: Date;
	updateD_BY: string;
	updateD_DATE: Date;
	isactive: Boolean;
	isExpired: boolean = false;
	producT_ID:number;
	modE_ID:number;
	kpI_MASTER_ID: number;
}
export class kpiWithTargets extends kpi {
	kpI_TARGETS: kpI_TARGETS[] = [];
	producT_kPI_DETAILS : ProductkpiDetails[]=[];	
}

export class kpI_TARGETS {
	id: number;
	kpI_ID: number;
	starT_DATE: Date;
	enD_DATE: Date;
	createD_BY: string;
	createD_DATE: Date;
	updateD_BY: string;
	updateD_DATE: Date;
	isactive: Boolean = true;
	slA_TARGET_HIGH_OPERATOR:string;
	slA_TARGET_HIGH_VALUE:number;
	slA_TARGET_HIGH_DESCRIPTION:string;
	slA_TARGET_VERYHIGH_OPERATOR:string;
	slA_TARGET_VERYHIGH_VALUE:number;
	slA_TARGET_VERYHIGH_DESCRIPTION:string;
	specificatioN_LIMIT:string;
	expecteD_SERVICE_LEVEL:number;
	minimuM_SERVICE_LEVEL:number;
}
export class kpi_kpiDetails {
	kpi: kpi[];
	kpidetails: kpidetails[];
}
export class ProductkpiWithTargets{
	id : number;
	kpI_ID: number;
	starT_DATE: Date;
	enD_DATE: Date;
	slA_TARGET_HIGH_OPERATOR:string;
	slA_TARGET_HIGH_VALUE:number;
	slA_TARGET_HIGH_DESCRIPTION:string;
	slA_TARGET_VERYHIGH_OPERATOR:string;
	slA_TARGET_VERYHIGH_VALUE:number;
	slA_TARGET_VERYHIGH_DESCRIPTION:string;
	specificatioN_LIMIT:string;
	expecteD_SERVICE_LEVEL:number;
	minimuM_SERVICE_LEVEL:number;
	createD_BY: string;
	createD_DATE: Date;
	updateD_BY: string;
	updateD_DATE: Date;
	isactive: Boolean = true;
}
export class ProductkpiDetails{
	kpI_ID: number;
	reference : string;
	servicE_AREA_ID : number;
	servicE_LEVEL_ID : number;
	servicE_LEVEL_METRIC_DESCRIPTION : string;
	createD_BY: string;
	createD_DATE: Date;
	updateD_BY: string;
	updateD_DATE: Date;
}
