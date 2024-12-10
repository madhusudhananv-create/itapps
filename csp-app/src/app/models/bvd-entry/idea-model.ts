export class Idea {
    id: number;
    cusT_ID: string;
    projecT_ID: string;
    servicE_AREA_ID: number;
    ideA_STATUS_ID: number;
    description: string;
    potentiaL_SOLUTION_DESCRIPTION: string;
    potentiaL_SOLUTION_CATEGORY_ID: number;
    ideA_IMPROVEMENT_TYPE_ID: number;
    identifieD_BY: any = [];
    identifieD_DATE: string;
    procesS_AREA_ID: number;
    procesS_ID: number;
    comments: string
    created_by: string
    created_date: Date
    updated_by: string;
    updated_time: Date
    isactive: boolean;
    issubmitted: boolean;
    stagE_ID: number;
    revieW_COMMENTS: string;
    portfoliO_ID: number;
}

export class IdeaStatus {
    id: number;
    title: string;
    stagE_ID: number;
    isactive: boolean
}

// export enum IdeaStatus {
//     Submitted = 1,
//     Reviewed = 2,
//     Approved = 3,
//     OnHold = 4,
//     Draft = 5,
//     Rejected = 6,
//     Completed = 7,
//     Planned = 8,
//     Execution = 9,
//     Implemented = 10
// }

export class PotentialSolutionCategory {
    id: number;
    title: string;
    isactive: boolean
}

export class IdeaImprovementType {
    id: number;
    type: string;
    isactive: boolean
}

export class IdeaViewModel {
    id: number;
    description: string;
    identifieD_DATE: string;
    projecT_NAME: string;
    responsible: string;
    status: string;
    type: string;
    targeT_DATE: string;
    CUSTOMER_NAME:string;
}

