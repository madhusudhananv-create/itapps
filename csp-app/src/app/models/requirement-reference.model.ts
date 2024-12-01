export class RequirementRefModel{
    id:number;
    applicability_Level:number;
    customer_Project_Name: number[];
    category_Id:number[];
    doc_Req_Reference:string;
    doc_Revision_No:string;
    doc_Revision_Date:Date;
    requirement_Title:string;
    requirement_Desc:string;
    compliance_fulfilment:string;
    documents_Evidence:string;
    owner:string;
    concerned_Authority:string;
    created_By:string;
    created_Date:Date;
    updated_By:string;
    updated_Date:Date;
    status:string;
    comments:string;
    issues:string;
    documentTargetDate:Date;
    responsibility:string;
    isActive:boolean;
    projectName:string[];
    customer:string;
    updateD_FORMAT_DATE:Date;
    updateD_PERSON:string;
}
export class Req_StatusModel{
    id:number;
    value:string;
    applicability_Level:number;
    customer_Project_Name: number[];
    category_Id:number[];
    doc_Req_Reference:string;
    doc_Revision_No:string;
    doc_Revision_Date:Date;
    requirement_Title:string;
    requirement_Desc:string;
    compliance_fulfilment:string;
    documents_Evidence:string;
    owner:string;
    concerned_Authority:string;
    created_By:string;
    created_Date:Date;
    updated_By:string;
    updated_Date:Date;
    status:string;
    comments:string;
    issues:string;
    documentTargetDate:Date;
    responsibility:string;
    isActive:boolean;
    projectName:string[];
    customer:number;
}


export class Req_CategoryModel{
    id:number;
    category:string;
    created_By:string;
    created_Date:Date;
    updated_By:string;
    updated_Date:Date;
    isActive:boolean;
}

export class Req_LevelModel{

        id:number;
        level:string;
        created_By:string;
        created_Date:Date;
        updated_By:string;
        updated_Date:Date;
        isActive:boolean;
    
}

export class Req_Stage_Status_Model{

    id:number;
    req_Id:number;
    status:string;
    updateD_FORMAT_DATE:Date;
    updateD_PERSON:string;
    updated_By:string;
    updated_Date:Date;
    isActive:boolean;

}


export class GetRequirementRefModel{
    id:number;
    applicability_Level:number;
    customer_Project_Name:number[];
    projectName:string[];
    category_Id:number[];
    doc_Req_Reference:string;
    doc_Revision_No:string;
    doc_Revision_Date:Date;
    requirement_Title:string;
    requirement_Desc:string;
    compliance_fulfilment:string;
    documents_Evidence:string;
    owner:string;
    concerned_Authority:string;
    created_By:string;
    created_Date:Date;
    updated_By:string;
    updated_Date:Date;
    status:string;
    comments:string;
    issues:string;
    documentTargetDate:Date;
    responsibility:string;
    isActive:boolean;
    updateD_FORMAT_DATE:Date;
    updateD_PERSON:string;
}

export class ProcessModelList
{
    id: number;
    title: string;
    description : string;
    releasE_VERSION_REFERENCE : string;
    releasE_DATE : Date;
    createD_DATE : Date;
    createD_BY : string;
    updateD_DATE : Date;
    updateD_BY : string;
    isactive : boolean;
}

export class ProcessAreaModelNew {
    id: number = -1;
    title: string;
    description: string;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
}

export class ProcessModelNew {
    id: number = -1;
    procesS_AREA_ID: number = 0;
    title: string = "";
    description = "";
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    bSelected = false;
}

export class CustomerModel {
    cusT_ID:string;
    cusT_NM:string;
    industrY_TYPE:string;
    url:string;
    createD_BY:string;
    createD_DATE:Date;
    updateD_BY:string;
    updateD_DATE:Date;
} 

export class ServiceAreaModelNew {
    id: number;
    title: string;
    description: string;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    isactive: boolean = true;
    isMapped: boolean = false;
}

export class Project{
    proj_Id: string;
    cust_Addr_Id: number;
    bill_Crncy_Id: number;
    proj_Nm: string;
    proj_Alias_Nm: string;
    start_Date: Date;
    end_Date:Date;
    bill_Type:boolean;
    proc_Type:string;
    lvl_1_Appr_Emp_Id:string;
    lvl_2_Appr_Emp_Id:string;
    lvl_3_Appr_Emp_Id:string;
    lvl_4_Appr_Emp_Id:string;
    proj_Buhead_Emp_Id:string;
    proj_Dm_Emp_Id:string;
    proj_Pm_Emp_Id:string;
    proj_Am_Emp_Id:string;
    createD_BY: string = localStorage.getItem('empid');;
    createD_DATE: Date = new Date();
    updateD_BY: string = localStorage.getItem('empid');;
    updateD_DATE: Date = new Date();
    dept_Id:number;
    cust_Id:string;
    bu_Id:number;
    parent_Proj_Id:string;
    quality_Spoc:string;
    bp_Share_To_All:boolean;
    proj_Status:string;
    project_Status:string;
}


export class RequirementModel{
    starT_DATE: Date;
    enD_DATE : Date;
    customer_Project_Name: number;
    projectName:string[];

  }