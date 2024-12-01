import { AuditFindingCappa } from "./audit-finding-capa";

export class AuditFindingImplementation
{
    id: number;
    findinG_ID :number
    uniquE_ID :string;
    rooT_CAUSE_ID :number;
    isimplemented :boolean;
    status :string;
    remarks:string;
    updateD_BY:string;
    updateD_DATE:Date;
    isactive:boolean;  
    capadata: AuditFindingCappa 
  isverified: boolean;
}