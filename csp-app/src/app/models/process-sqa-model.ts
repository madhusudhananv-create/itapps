export class ProcessModelModel {
    id: number = 0;
    title: string;
    description: string;
    releasE_VERSION_REFERENCE: string;
    createD_DATE: Date;
    createD_BY: string;
    updateD_DATE: Date;
    updateD_BY: string;
    isactive: boolean
    releasE_DATE: Date;
    industrY_STANDARD_REFERENCE: any;
}
export class ProcessSqaServiceArea {
    id: number = 0;
    procesS_MODEL_ID: number;
    procesS_AREA_DESCRIPTION: string;
    maturitY_LEVEL: number;
    gavS_SERVICE_AREA: number;
    createD_DATE: Date;
    createD_BY: string;
    updateD_DATE: Date;
    updateD_BY: string;
    isactive: boolean
}
export class ProcessSqaProcess {
    id: number = 0;
    procesS_AREA_ID: number;
    title: string;
    description: string;
    maturitY_LEVEL: number;
    createD_DATE: Date;
    createD_BY: string;
    updateD_DATE: Date;
    updateD_BY: string;
    isactive: boolean
}
export class ProcessSQAObjective {
    id: number = 0;
    objectivE_ID: number;
    title: string;
    description: string;
    procesS_ID: number;
    maturitY_LEVEL: number;
    createD_DATE: Date;
    createD_BY: string;
    updateD_DATE: Date;
    updateD_BY: string;
    isactive: boolean
}
export class ProcessSQAObjectiveNew
{
    id:number = 0;
    process_ID : number;
    title : string;
    description :string;
    reference_DOCUMENT : string;
    filename_SERVER : string;
    created_DATE: Date;
    createD_BY :string;
    updateD_DATE :Date;
    updateD_BY :string;
    isactive : boolean
}

export class RiskCategory
{
    id : number;
    title : string
}

export class RiskCategory2
{
    id : number;
    title : string;
    risK_LEVEL1_ID : number
}

export class RiskOwner
{
    id: number;
    title : string;
    sorT_ORDER: number
}

export class ProcessModelRisksNew
{
    id : number;
	title : string;
	description : string;
	risK_CATEGORY_LEVEL1 : number;
	risK_CATEGORY_LEVEL2 :number;
	risK_CATEGORY_LEVEL3 : number;
	risK_OWNER : string;
	referencE_DOCUMENT  : string;
	filE_NAME_SERVER : string;
	createD_BY : string;
	createD_DATE : Date;
	updateD_BY : string;
	updateD_DATE : Date;
    isactive : boolean;
    isMapped: boolean;
}

export class RiskObjectiveMappingData
{
    procesS_MODEL_OBJECTIVES_NEW : ObjectiveNew[];
    procesS_MODEL_RISKS_NEW : ProcessModelRisksNew;
}
export class ObjectiveNew{
    
}

export class ProcessModelNew1
{
    id: number;
    title: string;
    description : string;
    releasE_VERSION_REFERENCE : string;
    releasE_DATE : Date;
    createD_DATE : Date;
    createD_BY : string;
    updateD_DATE : Date;
    updateD_BY : string;
    isactive : boolean;
}

export class ControlCategory
{
    id: number;
    description : string;
    procesS_MODEL_ID : number;  
}

export class ControlReference
{
    id: number;
    description : string;
    controL_CATEGORY_ID : number;
}

export class ProcessModelControlnew
{
    id: number;
    title: string;
    description : string;
    controL_TYPE : string;
    framework : string;
    functions : string;
    category : number;
    requiremenT_REFERENCE : string;
    filE_NAME_SERVER : string;
    isactive : boolean;
    classification : string;
    automation : string;
    assertion : string;
    createD_BY : string;
    createD_DATE : Date;
    updateD_BY : string;
    updateD_DATE : Date;
    controL_OWNER : string;
}

export class ProcessViewModel
{
    procesS_MODEL : ProcessModelNew1;
    procesS_MODEL_CATEGORY : ControlCategory;
    procesS_MODEL_CONTROL_REFERENCE : ControlReference;
}

export class ControlRisksMappingModel
{
    procesS_MODEL_CONTROL_NEW : ProcessModelControlnew;
    procesS_MODEL_RISKS_NEW : ProcessModelRisksNew[];
    procesS_MODELVIEW_FOR_CONTROL : ProcessViewModel;

}

export class Classify
{
    id: number;
    description : string;
}

export class ProcessModelTestsNew
{
    id: number;
    title: string;
    description : string;
    classification : string;
    referencE_DOCUMENT  : string;
	filE_NAME_SERVER : string;
    createD_BY : string;
    createD_DATE : Date;
    updateD_BY : string;
    updateD_DATE : Date;
    isactive : boolean;
}

export class TestControlsMapping
{
    procesS_MODEL_TESTS_NEW : ProcessModelTestsNew;
    procesS_MODEL_CONTROL_NEW : ProcessModelControlnew[];
}

export class TestViewModel
{
    id: number;
    title : string;
    description : string;
    servicE_AREA : string;
    procesS_MODEL : string;
    procesS_AREA : string;
    process : string
}

export class TestReportSummary
{
    title : string;
    description : string;
    tesT_RESULT : string;
    objectivE_TITLE : string;
    risK_TITLE : string;
    controL_TITLE : string;
}

// export class DropDownAudit
// {
//     tesT_RESULTS : string[];
//     statuS_CONTROLS : string[];
//     impactinG_ATTRIBUTES : string[];
//     risK_SEVERITY : string[];
//     auditoR_LIST : string[];
//     servicE_AREA : string[];
//     AUDITOR_LIST : RiskOwner[];
// }