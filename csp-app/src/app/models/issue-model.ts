export class IssueModel {
    id: number;
	projecT_ID:string;
	rag:string;
	description:string;
	impacT_SUMMARY:string;
	iS_POTENTIAL_RISK:boolean;
	businesS_IMPACT:string;
	geO_LOCATION:string;
	issuE_TYPE:string;
	severity:string;
	actioN_PLAN:string;
	assigneD_TO:string;
	identifieD_BY:string;
	reporteD_BY:string;
	level:string;
	identifieD_DATE:Date;
	targeT_DATE:Date;
	status:string;
	issuE_RESOLVED_DATE:Date;
	comments:string;
	createD_BY:string;
	createD_DATE:Date;
	updateD_BY:string;
	updateD_DATE:Date;
	isactive:Boolean;
}

export class IssueModelExt extends IssueModel{
	cusT_ID: string;
    cusT_NM: string;
    portfoliO_ID: number;
    portfoliO_NM: string;
    proJ_NM: string;
	isEscalated : string;
}
