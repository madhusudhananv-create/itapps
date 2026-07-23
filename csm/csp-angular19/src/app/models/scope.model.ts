/**
 * Scope Model
 * Represents project scope information including objectives, deliverables, constraints, etc.
 * Migrated from LEGACY-SOURCE/src/app/models/scope-Model.ts
 */
export class ScopeModel {
    [key: string]: any; // Index signature for dynamic property access
    id!: number;
    projecT_ID!: string;
    rag!: string;
    description!: string;
    scope!: string;
    objectives!: string;
    deliverables!: string;
    inScope_Id!: number;
    serviceTower!: number;
    tools!: string;
    technologY_USED!: string;
    constraints!: string;
    assumptions!: string;
    ouT_SCOPE!: string;
    createD_BY!: string;
    createD_DATE!: Date;
    updateD_BY!: string;
    updateD_DATE!: Date;
    isactive!: Boolean;
}

/**
 * Model Row for In-Scope Details Table
 * Represents a row in the in-scope service area table
 */
export class modelRow {
    ID!: number;
    SERVICE_AREA_ID!: Number;
    ServiceTower!: string;
    Tools!: string;
    Technology!: string;
    Project_Id!: string;   
    Cust_Id!: string;   
}

/**
 * Project Scopes Wrapper Model
 * Contains both project scope and in-scope details
 */
export class projectScopes {
    PROJECT_SCOPE!: ScopeModel;
    PROJECT_INSCOPE_DETAILS!: modelRow[];
}
