export class IssueModel {
	id?: number;
	projecT_ID?: string;
	rag?: string;
	description?: string;
	impacT_SUMMARY?: string;
	iS_POTENTIAL_RISK?: boolean;
	businesS_IMPACT?: string;
	geO_LOCATION?: string;
	issuE_TYPE?: string;
	severity?: string;
	actioN_PLAN?: string;
	assigneD_TO?: string;
	assigneD_TO_EMPID?: string;
	identifieD_BY?: string;
	reporteD_BY?: string;
	level?: string;
	identifieD_DATE?: Date | null;
	targeT_DATE?: Date | null;
	status?: string;
	issuE_RESOLVED_DATE?: Date | null;
	comments?: string;
	createD_BY?: string;
	createD_DATE?: Date;
	updateD_BY?: string;
	updateD_DATE?: Date;
	isactive?: Boolean;
	subvertical?: string;
	rootcause?: string;
	SPOC?: string;
	acK_DATE?: Date | null;
	servicE_IMPACT?: string;
	financiaL_IMPACT?: string;
	financiaL_IMPACT_DESCRIPTION?: string;
	issuE_SOURCE?: string;
	issuE_SOURCE_OTHER?: string;
	locatioN_SELECTION?: string;
	businesS_IMPACT_DESC?: string;
	title?: string;
}

export class IssueModelExt extends IssueModel {
	cusT_ID?: string;
	cusT_NM?: string;
	portfoliO_ID?: number;
	portfoliO_NM?: string;
	proJ_NM?: string;
	isEscalated?: string;
	assigneD_TO_NAME?: any;
}
