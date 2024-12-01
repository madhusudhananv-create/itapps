import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { enumAccessType } from "./enum";
import { Observable } from "rxjs/Observable";
import { myUtility } from "./myUtility";
import { AppAccessControlsModel } from "../models/access-control-model";
import { Router } from "@angular/router";


@Injectable()
export class AccessControl {

    apiurl: string = '';
    apiurl_auth: string = '';
    empid: string;

    constructor(private _http: HttpClient, private _router: Router, private _util: myUtility) {
        this.apiurl = environment.webapiuri;
        this.apiurl_auth = environment.webapiuri_auth;
        this.empid = localStorage.getItem('empid')
        //this.LoadAccessControls();
    }

    public accessControlRepository: AppAccessControlsModel[];
    public IsAllowedDebug(controlId: number, type: enumAccessType, custid: string, projid: string): Boolean {
        //debugger;
        return this.IsAllowed(controlId, type, custid, projid);
    }
    public IsAllowed(controlId: number, type: enumAccessType, custid: string, projid: string): Boolean {

        if (this.empid === null || this.empid === "")
            this.empid = localStorage.getItem('empid')
        let allow: Boolean = false;
        if (this.accessControlRepository === undefined || this.accessControlRepository === null || this.accessControlRepository.length === 0)
            this.accessControlRepository = this._util.getAccessList();

        let acc: AppAccessControlsModel
        if (this.accessControlRepository != undefined) {
            //Exceptions for customer
            if (this._util.IsGAVS() === false) {
                this.empid = this.empid.toLocaleLowerCase();
                let cust = this.accessControlRepository.find(x => x.EMP_ID.find(y => y === this.empid) && x.ACCESS_LEVEL == 3 && x.RESOURCE_ID == controlId)
                if (cust != null) {
                    if (type === enumAccessType.view)
                        acc = this.accessControlRepository.find(x => x.EMP_ID.find(y => y === this.empid) && x.ACCESS_LEVEL == 3 && x.RESOURCE_ID == controlId && x.VIEW_ACCESS == true)
                    else if (type === enumAccessType.create)
                        acc = this.accessControlRepository.find(x => x.EMP_ID.find(y => y === this.empid) && x.ACCESS_LEVEL == 3 && x.RESOURCE_ID == controlId && x.CREATE_ACCESS == true)
                    else if (type === enumAccessType.edit)
                        acc = this.accessControlRepository.find(x => x.EMP_ID.find(y => y === this.empid) && x.ACCESS_LEVEL == 3 && x.RESOURCE_ID == controlId && x.EDIT_ACCESS == true)
                    else if (type === enumAccessType.delete)
                        acc = this.accessControlRepository.find(x => x.EMP_ID.find(y => y === this.empid) && x.ACCESS_LEVEL == 3 && x.RESOURCE_ID == controlId && x.DELETE_ACCESS == true)
                    if (acc != null) {
                        allow = true;
                    }
                    return allow;
                }
            }
            //Exceptions for employees
            // if (this._util.IsGAVS() === true && projid != '') {
            //     let emp = this.accessControlRepository.find(x => x.EMP_ID.search(this.empid) != -1 && x.PROJ_ID.search(projid) != -1 && x.ACCESS_LEVEL == 2 && x.RESOURCE_ID == controlId)
            //     if (emp != null) {
            //         if (type === enumAccessType.view)
            //             emp = this.accessControlRepository.find(x => x.EMP_ID.search(this.empid) != -1 && x.PROJ_ID.search(projid) != -1 && x.ACCESS_LEVEL == 2 && x.RESOURCE_ID == controlId && x.VIEW_ACCESS == true)
            //         else if (type === enumAccessType.create)
            //             emp = this.accessControlRepository.find(x => x.EMP_ID.search(this.empid) != -1 && x.PROJ_ID.search(projid) != -1 && x.ACCESS_LEVEL == 2 && x.RESOURCE_ID == controlId && x.CREATE_ACCESS == true)
            //         else if (type === enumAccessType.edit)
            //             emp = this.accessControlRepository.find(x => x.EMP_ID.search(this.empid) != -1 && x.PROJ_ID.search(projid) != -1 && x.ACCESS_LEVEL == 2 && x.RESOURCE_ID == controlId && x.EDIT_ACCESS == true)
            //         else if (type === enumAccessType.delete)
            //             emp = this.accessControlRepository.find(x => x.EMP_ID.search(this.empid) != -1 && x.PROJ_ID.search(projid) != -1 && x.ACCESS_LEVEL == 2 && x.RESOURCE_ID == controlId && x.DELETE_ACCESS == true)
            //         if (emp != null) {
            //             allow = true;
            //         }
            //         return allow;
            //     }
            // }

            //Role based access - overload
            let role = localStorage.getItem('role');
            let empDeligate = this.accessControlRepository.find(x => x.ROLE_ID.toString() == role && x.EMP_ID.find(y => y == this.empid) && x.ACCESS_LEVEL == 1 && x.RESOURCE_ID == controlId);

            if (empDeligate == undefined || empDeligate == null)
                empDeligate = this.accessControlRepository.find(x => x.EMP_ID.find(y => y == this.empid) && x.ACCESS_LEVEL == 1 && x.RESOURCE_ID == controlId)
            if (empDeligate != null) {
                if (type === enumAccessType.view)
                    empDeligate = this.accessControlRepository.find(x => x.EMP_ID.find(t => t === this.empid) && x.ACCESS_LEVEL == 1 && x.RESOURCE_ID == controlId && x.VIEW_ACCESS == true)
                else if (type === enumAccessType.create)
                    empDeligate = this.accessControlRepository.find(x => x.EMP_ID.find(t => t === this.empid) && x.ACCESS_LEVEL == 1 && x.RESOURCE_ID == controlId && x.CREATE_ACCESS == true)
                else if (type === enumAccessType.edit)
                    empDeligate = this.accessControlRepository.find(x => x.EMP_ID.find(t => t === this.empid) && x.ACCESS_LEVEL == 1 && x.RESOURCE_ID == controlId && x.EDIT_ACCESS == true)
                else if (type === enumAccessType.delete)
                    empDeligate = this.accessControlRepository.find(x => x.EMP_ID.find(t => t === this.empid) && x.ACCESS_LEVEL == 1 && x.RESOURCE_ID == controlId && x.DELETE_ACCESS == true)

                if (empDeligate != null) {
                    if (empDeligate.CUST_ID.length > 0) {
                        if (empDeligate.CUST_ID.find(t => t.toString() == custid.toString())) {
                            allow = true;
                        }
                    }
                    else
                        allow = true;
                }

                // if (empDeligate != null) {
                //     allow = true;
                // }
                return allow;
            }
            else {
                //Role based access
                let role;
                var userRoleId: number = parseInt(localStorage.getItem('role'));

                if (type === enumAccessType.view)
                    role = this.accessControlRepository.find(x => x.RESOURCE_ID == controlId && x.ACCESS_LEVEL == 1 && x.VIEW_ACCESS == true && x.ROLE_ID == userRoleId)
                else if (type === enumAccessType.create)
                    role = this.accessControlRepository.find(x => x.RESOURCE_ID == controlId && x.ACCESS_LEVEL == 1 && x.CREATE_ACCESS == true && x.ROLE_ID == userRoleId)
                else if (type === enumAccessType.edit)
                    role = this.accessControlRepository.find(x => x.RESOURCE_ID == controlId && x.ACCESS_LEVEL == 1 && x.EDIT_ACCESS == true && x.ROLE_ID == userRoleId)
                else if (type === enumAccessType.delete)
                    role = this.accessControlRepository.find(x => x.RESOURCE_ID == controlId && x.ACCESS_LEVEL == 1 && x.DELETE_ACCESS == true && x.ROLE_ID == userRoleId)

                if (role != null) {
                    if (role.CUST_ID.length > 0) {
                        if (role.CUST_ID.find(t => t.toString() == custid.toString())) {
                            allow = true;
                        }
                    }
                    else
                        allow = true;
                }
            }
        }
        return allow;
    }

    

    

    public GetCustomerSpecific() {
        if (this.empid === null)
            this.empid = localStorage.getItem('empid')
        //this.accessControlRepository.find(x => x.EMP_ID.find(t => t === this.empid));
    }

    CheckValidAccess(functionality: number) {
        if (this.IsAllowed(functionality, 1, '', '')) { }
        else {
            alert("Invalid access to the URL. Redirecting to Main Dashboard!!")
            this._router.navigateByUrl('/newdashboard/custm');

        }
    }
}