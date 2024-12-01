export class CrispCategorySummaryModel {
    name: string;
    redRags: CrispCategoryRagsModel;
    amberRags: CrispCategoryRagsModel;
    greenRags: CrispCategoryRagsModel;
}
export class CrispCategoryRagsModel {
    count: number;
    rag: string;
    projectIds: string[];
}


