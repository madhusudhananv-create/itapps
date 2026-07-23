export class ProjectDetailsModel {
    proJ_ID?: string;
    proJ_NM?: string;
    proJ_RAG?: string;
    publisheD_ON?: Date;
    lastupdated?: string;
    details?: any; // Simplified to any to avoid circular dependencies
    rags?: any[];
    scope?: any;
    deliveryDetails?: any;
    people?: any;
    resource?: any[];
    process?: any[];
    risk?: any[];
    issue?: any[];
    valueadds?: any[];
    actionitems?: any[];
    innovation?: any[];
    success?: any[];
}
