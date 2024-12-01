export class ScopeModel {
    id: number;
    projecT_ID: string;
    rag: string;
    description: string;
    scope: string;
    objectives: string;
    deliverables: string;
    inScope_Id: number;
    serviceTower: number;
    tools: string;
    technologY_USED: string;
    constraints: string;
    assumptions: string;
    ouT_SCOPE: string;
    createD_BY: string;
    createD_DATE: Date;
    updateD_BY: string;
    updateD_DATE: Date;
    isactive: Boolean;
}

export class modelRow {
    ID : number;
    SERVICE_AREA_ID: Number;
    ServiceTower: string;
    Tools: string;
    Technology: string;
    Project_Id: string;   
    Cust_Id: string;   
}

export class projectScopes{
    PROJECT_SCOPE : ScopeModel;
    PROJECT_INSCOPE_DETAILS : modelRow[];
}