export class SqaProjectReportsModel {
    id: number = 0;
    customeR_ID: string;
    projecT_ID: string;
    datA_DUMP_NAME: string;
    datA_DUMP_TYPE: string;
    comments: string;
    createD_BY: string;
    createD_DATE: Date;
    updateD_BY: string;
    updateD_DATE: Date;
    isactive: Boolean;
}

export class SqaChartParamsModel {
    id: number;
    customeR_ID: string;
    projecT_ID: string;
    datA_DUMP_ID: number;
    datA_DUMP_TYPE: string;
    charT_USER: string = 'PROJECT';
    title: string = "Chart Title";
    description: string;
    category: string = "Custom";
    subcategory: string;
    yaxiS_LABLE: string = "In Numbers";
    charT_TYPE: string;
    starT_DATE: Date;
    enD_DATE: Date;
    target: number;
    xaxiS_TYPE: string;
    yaxiS_TYPE: string = 'Count';
    grouP_BY_LEVEL1: string = '';
    grouP_BY_LEVEL2: string = '';
    frequency: string = "Monthly";
    createD_BY: string;
    createD_DATE: Date;
    updateD_BY: string;
    updateD_DATE: Date;
    isactive: boolean = true;
}

export class SqaChartFilterModel {
    id: number;
    charT_ID: number;
    field: string;
    filter: string;
    filteR_STRING: string;
    operator: string;
    sorT_ORDER: number;
    createD_BY: string = '';
    createD_DATE: Date = new Date();
    updateD_BY: string = '';
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}

export class SqaChartParamsWithFilterModel extends SqaChartParamsModel {
    filters: SqaChartFilterModel[] = [];
}
