/**
 * Service Area Model
 * Represents a service area/tower for project scope configuration
 * Migrated from LEGACY-SOURCE/src/app/models/requirement-reference.model.ts
 */
export class ServiceAreaModelNew {
    id!: number;
    title!: string;
    description!: string;
    createD_BY: string = localStorage.getItem('empid') || '';
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid') || '';
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    isMapped: boolean = false;
}
