// export class ProjectDataConfigurationModel{
//     id:number;
//     settinG_NAME:string;
//     settinG_TYPE:number;
//     settinG_VALUE:string;
//     comments:string;
//     enD_DATE:Date;
//     iS_APPROVED:string;
//     created_By:string;
//     created_Date:Date;
//     updated_By:string;
//     updated_Date:Date;
//     isActive:boolean;
// }

export class ProjectDataConfigurationModel{
    id:number;
    cust_Id:string;
    proj_Id:string;
    configuration_Setting_Id:number;
    int_Value:number;
    bit_Value:boolean;
    string_Value:string;
    is_Approved:boolean;
    comments:string;
    approved_By:string;
    approveD_BY_NAME : string
    approval_Comments:string;
    end_date:Date;
    isActive:boolean;
    created_Date:string;
    created_By:string;
    updated_Date:string;
    updated_By:string;
    isMailApproveReject:boolean;      
}
