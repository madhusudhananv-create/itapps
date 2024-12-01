import { EmpInfoModel } from "./emp-info-model";

export class MOM_DETAIL
{
    id:number;
    customeR_ID:string[] = [];
    projecT_ID:string[] = [];
    discussioN_POINTS:string;
    actioN_ITEM:string;
    priority:string;
    //responsibility:EmpInfoModel;
    responsibility:number;
    targeT_DATE:Date;

}
export class MOM{
    createD_BY:string;
    meetinG_DATE:Date;
    meetinG_TIME:string;
    meetinG_DESCRIPTION:string;
    meetinG_VENUE:string;
    chairperson:string;
    meetinG_AGENDA:string
    status:string
    meetinG_PARTICIPANTS:string;
    moM_ITEMS:MOM_DETAIL[] = [];
}