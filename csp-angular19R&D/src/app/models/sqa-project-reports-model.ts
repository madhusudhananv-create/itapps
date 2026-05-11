/**
 * SQA Project Reports Model
 * Models for SQA (Software Quality Assurance) project reports and charts
 * Migrated from Angular 6 to Angular 19
 */

export class SqaProjectReportsModel {
    id: number = 0;
    customeR_ID: string = '';
    projecT_ID: string = '';
    datA_DUMP_NAME: string = '';
    datA_DUMP_TYPE: string = '';
    comments: string = '';
    createD_BY: string = '';
    createD_DATE: Date = new Date();
    updateD_BY: string = '';
    updateD_DATE: Date = new Date();
    isactive: Boolean = false;
}

export class SqaChartParamsModel {
    id: number = 0;
    customeR_ID: string = '';
    projecT_ID: string = '';
    datA_DUMP_ID: number = 0;
    datA_DUMP_TYPE: string = '';
    charT_USER: string = 'PROJECT';
    title: string = "Chart Title";
    description: string = '';
    category: string = "Custom";
    subcategory: string = '';
    yaxiS_LABLE: string = "In Numbers";
    charT_TYPE: string = '';
    starT_DATE: Date = new Date();
    enD_DATE: Date = new Date();
    target: number = 0;
    xaxiS_TYPE: string = '';
    yaxiS_TYPE: string = 'Count';
    grouP_BY_LEVEL1: string = '';
    grouP_BY_LEVEL2: string = '';
    frequency: string = "Monthly";
    createD_BY: string = '';
    createD_DATE: Date = new Date();
    updateD_BY: string = '';
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}

export class SqaChartFilterModel {
    id: number = 0;
    charT_ID: number = 0;
    field: string = '';
    filter: string = '';
    filteR_STRING: string = '';
    operator: string = '';
    sorT_ORDER: number = 0;
    createD_BY: string = '';
    createD_DATE: Date = new Date();
    updateD_BY: string = '';
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}

export class SqaChartParamsWithFilterModel extends SqaChartParamsModel {
    filters: SqaChartFilterModel[] = [];
}
