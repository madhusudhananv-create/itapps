export class CssBatchCustomerMonthlyModel {
    id!: number;
    batcH_MONTHLY_ID!: number;
    cusT_ID?: string;
    proJ_ID?: string;
    questioN_MODEL_ID?: number;
    emaiL_ID?: string;
    displaY_NAME: string = '';
    procesS_STOP?: boolean;
    procesS_ENABLED_BY?: string;
    procesS_ENABLED_DATE?: Date;
    procesS_DISABLED_BY?: string;
    procesS_DISABLED_DATE?: Date;
    surveY_ID?: number;
    surveY_SENT_DATE?: Date;
    surveY_RECEIVED_DATE?: Date;
    status: string = '';
    createD_BY?: string;
    createD_DATE?: Date;
    updateD_BY?: string;
    updateD_DATE?: Date;
    isactive?: boolean;
    iS_VERIFIED?: boolean;
    comments?: string;
    meetinG_DATE?: Date;
    csM_NOTIFIED?: boolean;
}

export class CssBatchCustomerMonthlyExtendedModel extends CssBatchCustomerMonthlyModel {
    cusT_NM: string = '';
    proJ_NM: string = '';
    proD_ID?: number;
    proD_NM: string = '';
    contacT_ROLE: string = '';
    revenuE_TYPE: string = '';
    businesS_UNIT?: string;
    proJ_STATUS?: string;
    contractinG_UNIT?: string;
    approver?: string;
    url?: string;
}
