
import { AuditFindingCappa } from "./audit-finding-capa";

export class CapaCustomerApproval {
    id: number;
    findinG_ID :number
    uniquE_ID :string;
    rooT_CAUSE_ID :number;
    isverified :boolean;
    isrejected :boolean;
    recommendeD_ACTION :string;
    status :string;
    ischecked:boolean
    remarks:string;
    updateD_BY:string;
    updateD_DATE:Date;
    isactive:boolean;  
    statuS_ID : number;
    capadata: AuditFindingCappa 
}
