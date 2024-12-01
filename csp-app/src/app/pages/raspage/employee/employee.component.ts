import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
//import { FormGroup, FormControl } from '@angular/forms';
import { EmpInfoDetailedModel } from '../../../models/emp-info-model';
import { ProcessAreaModelNew } from '../../../models/audit-checklist-based-model';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';


@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {

  empinfo: EmpInfoDetailedModel = new EmpInfoDetailedModel();

  constructor(private _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {
  }

  //csmtitle = ["val1", "val2", "val3"];
  //get current date
  todaysDate = new Date();

   onClickSubmit() {

    if (this.empinfo.emP_ID == undefined) {
      alert("Please Enter Employee Id");
    } 
    else if(this.empinfo.frsT_NM == undefined || this.empinfo.frsT_NM == "") {
      alert("Please Enter Employee First Name");
    }
    else if(this.empinfo.gender == undefined || this.empinfo.gender == "") {
      alert("Please Choose Employee Gender");
    }
    else if(this.empinfo.emaiL_ID == undefined || this.empinfo.emaiL_ID == "") {
      alert("Please Enter Employee Email");
    }

    else {
      var checkEmail = this.isEmail(this.empinfo.emaiL_ID.toString());
      if(checkEmail == true) {
//        console.log("valid email");
        this.service_AddNewEmpInfo(this.empinfo);
        //this.emptyFieldsAfterSubmit();
        // this.refresh();
      }
      else{
       // console.log("Not a valid email");
        alert("Please Enter a Valid Email");
      }
          
    // console.log("eid:" +this.empinfo.EMP_ID);    
    // console.log("firstname:"+this.empinfo.FRST_NM);
    // console.log("gender:"+this.empinfo.GENDER);
    // console.log("email:"+this.empinfo.EMAIL_ID);  

    }
    
  }

  service_AddNewEmpInfo(EmpInfoModelObj: EmpInfoDetailedModel) {
    this._appservice.addEmployee(EmpInfoModelObj).subscribe(data => {
      // this.service_GetProcessAreaList();
      alert("Employee Added Successfully");

      this.emptyFieldsAfterSubmit(EmpInfoModelObj);
      //Empty fields
      // EmpInfoModelObj.EMP_ID=undefined;
      // EmpInfoModelObj.FRST_NM=undefined;
      // EmpInfoModelObj.GENDER=undefined;  
      // EmpInfoModelObj.EMAIL_ID=undefined;

      //this.bAddNewProcessArea = false;
    }, error => { this._util.serviceError(error); });
  }


  isEmail(email:string): boolean {
      var result:boolean;      
      var regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      result = regexp.test(email);
//console.log(result);
      return result;
  }

  emptyFieldsAfterSubmit(fields): void {

    fields.EMP_ID = undefined;
    fields.FRST_NM = undefined;
    fields.GENDER = undefined;  
    fields.EMAIL_ID = undefined;
  }

  // service_AddNewEmpInfo(processArea: ProcessAreaModelNew) {
  //   this._appservice.addEmployee(processArea).subscribe(data => {
  //     // this.service_GetProcessAreaList();
  //     alert("Process Area Added Successfully");
  //     //this.bAddNewProcessArea = false;
  //   }, error => { this._util.serviceError(error); });
  // }

}
