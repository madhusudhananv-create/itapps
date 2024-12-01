export class ReleaseModel {
    id:number = 0;
    releasE_ID: number = 0;
    name: string;
    starT_DATE: Date;
    enD_DATE: Date;
    cusT_ID:string = "200000000";
    proJ_ID:string = "206P000049-06";
    suB_PROJ_ID:number = 0;
    createD_BY:string = localStorage.getItem("empid");
    createD_DATE = new Date();
    updateD_BY:string = localStorage.getItem("empid");
    updateD_DATE = new Date();
    isactive:boolean = true;
}
