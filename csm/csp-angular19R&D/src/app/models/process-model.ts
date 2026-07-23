export class ProcessModel {
    createD_BY?: string;
    createD_DATE?: Date;
    filE_CONTENT?: string;
    filE_EXTENSION?: string;
    filE_NAME?: string;
    filE_NAME_SERVER?: string;
    filE_TYPE?: string;
    id?: number;
    isactive?: boolean;
    projecT_ID?: string;
    publisH_DATE?: Date;
    rag?: string;
    reporT_TYPE?: string;
    updateD_BY?: string;
    updateD_DATE?: Date;
}

export class ProcessDataModel {
    projecT_PROCESS_TYPE?: ProcessTypeModel[];
    ddData?: ProcessDDModel[];
}

export class ProcessTypeModel {
    reporT_TYPE?: string;
    projecT_PROCESS?: ProcessModel[];
    procesS_CATEGORY?: ProcessCategoryModel[];
}

export class ProcessCategoryModel {
    reporT_CATEGORY?: string;
    projecT_PROCESS?: ProcessModel[];
}

export class ProcessDDModel {
    reporT_TYPE?: string;
    reporT_CATEGORY?: string[];
}
