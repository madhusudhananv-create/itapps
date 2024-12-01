export class AppreciationModel {
id:number;
cusT_ID :string;
proJ_ID :string;
appreciateD_BY : string;
comments: string;
recipient : string;
designation : string;
receiveD_DATE : Date;
createD_BY:String;
createD_DATE : Date;
updateD_BY : string;
updateD_DATE : Date;
isactive : boolean;
}

export class AppreciationModelExt extends AppreciationModel
{
    proJ_NM : string;
    portfoliO_ID : number;
    portfoliO_NAME : string; 
    recipienT_NM  : string;  
}