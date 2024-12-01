export class EmpInfoModel {
    emP_ID?: string;
    frsT_NM: string;
    middlE_NM: string;
    lasT_NM: string;
    emaiL_ID: string;
    title: string;
    emP_CSP_ROLE: string;
    csM_TITLE_ID: number;
    projecT_ID: string;
    empid:string;
    isselected : boolean = false;
}
export class EmpInfoDetailedModel {
    emP_ID: string;
    basE_CNTRY_ID: number = 1;
    manageR_EMP_ID: string = "100365";
    revieweR_EMP_ID: string = "100365";
    empL_TYPE: string = "Employee"; //Contractor;Employee
    frsT_NM: string = "";
    middlE_NM: string = "";
    lasT_NM: string =
        "";

    gender: string =
        ""; //M

    dob: Date =
        new Date();

    doj: Date =
        new Date();

    dor: Date = new Date();
    level: String =
        "T1";

    title: String =
        "Engineer";

    csM_TITLE_ID:
        number = 3;

    experience: String = "1";

    emaiL_ID: String =
        "";

    mobilE_NBR: String =
        "";

    potentiaL_TO_BILL:
        boolean = false;
    // 0

    unbilL_CLASSIFY:
        String = "";

    emP_ROLE: String =
        "";

    emP_BAS_ROLE:
        String = "";

    emP_CSP_ROLE:
        String = "";

    appraisaL_RATING:
        String = "";

    promotioN_INFO:
        String = "";

    createD_BY: String =
        localStorage.getItem("empid");

    createD_DATE:
        Date = new
            Date();

    updateD_BY: String =
        localStorage.getItem("empid");

    updateD_DATE:
        Date = new
            Date();

    superadmin: boolean =
        false; //0 

}
export class ProjectResourceByEmpIdModel {
    id: number;
    frsT_NM: string;
    emP_ID: string;
    cusT_NM: string;
    cusT_ID: string;
    proJ_NM: string;
    proJ_ID: string;
    bilL_FLG: boolean;
    curR_INDC: boolean;
    starT_DATE: Date = new Date(); // 
    enD_DATE : Date = new Date(); //
    proJ_RESRC_ID :number; //

}
export class ProjectResourceModel {
    proJ_ID: string;
    emP_ID: string;
    bilL_FLG: boolean;
    allcT_PCT: number;
    curR_INDC: string;
    createD_BY: string;    
    starT_DATE: Date = new Date(); // 
    enD_DATE : Date = new Date(); //
}

export class projResourceExtended extends ProjectResourceByEmpIdModel
{
    cusT_ID : string;
}