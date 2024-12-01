export class CustomerPortfolioProjectModel {
    cusT_ID: string;
    cusT_NM: string;
    proJ_ID: string;
    proJ_NM: string;
    portfoliO_ID: number;
    portfoliO_NAME: string;
}

export class cusT_GROUP {
    cusT_ID: string;
    cusT_NM: string;
    portfoliO_GROUP: portfoliO_GROUP[];
    projecT_INFO: projecT_INFO[];
}
export class portfoliO_GROUP {
    portfoliO_ID: number;
    portfoliO_NM: string;
    projecT_INFO: projecT_INFO[];
}
export class projecT_INFO {
    proJ_ID: string;
    proJ_NM: string;
}