export class DeliveryModel {
    id?: number;
    projecT_ID?: string;
    rag?: string;
    lastweeK_ACHIEVED?: string;
    nextweeK_MILESTONE?: string;
    riskS_ISSUES?: string;
    customeR_SUPPORT?: string;
    publisH_DATE?: Date;
    createD_BY?: string;
    createD_DATE?: Date;
    updateD_BY?: string;
    updateD_DATE?: Date;
    isactive?: Boolean;
}

export class DeliveryDetailsModel {
    delivery?: DeliveryModel;
    daterange?: DateRangeModel;
}

export class DateRangeModel {
    startDate?: Date;
    endDate?: Date;
}
