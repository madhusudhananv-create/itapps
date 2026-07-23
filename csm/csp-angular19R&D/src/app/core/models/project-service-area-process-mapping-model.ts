/**
 * Project Service Area Process Mapping Model
 * Migrated from LEGACY-SOURCE/src/app/models/project-service-area-process-mapping-model.ts
 * 
 * Represents the mapping between projects, service areas, and processes
 * Used in PSPD component for managing process configurations
 */

export class ProjectServiceAreaProcessMappingModel {
    id: number = 0;
    cusT_ID!: string;
    proJ_ID!: string;
    servicE_AREA_ID!: number;
    procesS_MODEL_ID!: number;
    procesS_Area_ID!: number;
    procesS_ID!: number;
    createD_BY: string = localStorage.getItem('empid') || '';
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid') || '';
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    procesS_TAILORING_NOTES!: string;
    iS_DIRTY?: boolean;
}

/**
 * Service Area Process Model Process Collection
 * Represents individual processes with selection state
 */
export class ServiceAreaProcessModleProcessCollection {
    procesS_MODEL_ID!: number;
    procesS_MODEL_TITLE!: string;
    procesS_AREA_ID!: number;
    procesS_AREA_TITLE!: string;
    procesS_ID!: number;
    procesS_TITLE!: string;
    procesS_DESCRIPTION!: string;
    iS_DIRTY!: boolean;
    bSelected!: boolean;
    isDisabled: boolean = false;
    procesS_TAILORING_NOTES!: string;
}
