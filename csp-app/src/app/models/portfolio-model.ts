//import { ProductModel } from "./portfolio-product";

export class PortfolioModel {
    id:number;
    title:string;
    contacT_NAME:string;
    contacT_EMAILID:string;
    createD_BY:string;
    createD_DATE:Date;
    updateD_BY:string;
    updateD_DATE:Date;
    isactive:Boolean;
    crispGraphData:any[]= [];
}

export class PortfoliosModel {
    id:number;
    title:string;
    comments:string;    
    createD_BY:string = localStorage.getItem("empid");
    createD_DATE:Date = new Date();
    updateD_BY:string = localStorage.getItem("empid");
    updateD_DATE:Date = new Date();
    isactive:Boolean = true;    
}

export class PortfoliosOwnersModel {
    id:number;
    portfoliO_ID:number;
    owneR_NAME:string;
    owneR_EMAILID:string;    
    createD_BY:string;
    createD_DATE:Date;
    updateD_BY:string;
    updateD_DATE:Date;
    isactive:Boolean;    
}

export class PortfoliosOwnersProjectModel {
    id:number;
    portfoliO_OWNER_ID:number;
    cusT_ID:string;
    proJ_ID:string;    
    createD_BY:string;
    createD_DATE:Date;
    updateD_BY:string;
    updateD_DATE:Date;
    isactive:Boolean;    
}

export class ProjectModelNew
{
    portfolio_id : number;
    proj_id : string;
    proj_nm :  string;
}
export class ProductModelNew
{
    id : number;
    portfoliO_ID:number;
    producT_TITLE:string;
    servicE_AREA_TYPE_ID:number;
    createD_BY:string;
    createD_DATE:Date;
    updateD_BY:string;
    updateD_DATE:Date;
    isactive:Boolean;
}




