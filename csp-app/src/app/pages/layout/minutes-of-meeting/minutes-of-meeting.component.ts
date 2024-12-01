import { Component, OnInit, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { ActivatedRoute } from '@angular/router';
import { Http, Headers, RequestOptions } from '@angular/http';
import { EmpInfoModel } from '../../../models/emp-info-model';
import { MOM_DETAIL, MOM } from '../../../models/mom-details-model';
import { CustomerProjectIds } from '../../../models/customer-projects-model';
import { environment } from '../../../../environments/environment';
import {ProjectSelectorMultipleComponent} from '../../../controls/project-selector-multiple/project-selector-multiple.component';
import { customer } from '../../process-model/audit-execution/audit-execution.component';
import { CustomerModel } from '../../../models/customer-model';
import { ProjectModel } from '../../../models/ras/project-model';
import { forEach } from '@angular/router/src/utils/collection';


export interface Emp {
  empInf: EmpInfoModel[];
}

@Component({
  selector: 'app-minutes-of-meeting',
  templateUrl: './minutes-of-meeting.component.html',
  styleUrls: ['./minutes-of-meeting.component.scss']
})

export class MinutesOfMeetingComponent implements OnInit {

  empName: any;
  // @Input('ProjectIds') projIds:string[]
 
  _loading: boolean = false;
  @Input() checked: boolean;
  //checked: boolean;
  IsChecked : boolean = false;
  
  constructor( private appService: AppsService, public _util: myUtility, private _http: Http, private _activatedRoute: ActivatedRoute) { }
  touch: any[] = [];
  custIds: string[];
  selectedMoMId: string;
  updatemode: boolean = false;
  ddshow: boolean = false;
  disablediv: boolean = false;
  enableDelete: boolean = false;
  selectedYear: number;
  selectedMonth: string;
  empInfo: EmpInfoModel[][] = [];
  inital_value: number[] = [1];
  projIds: string[];
  project_list: string[] = [];
  customer_list: string[] = [];
  momdet: any[] = []
  mom_detail: MOM_DETAIL = new MOM_DETAIL;
  editmom: MOM = new MOM();
  mom: MOM = new MOM();
  empname: string[] = [];
  meetings: any[] = [];
  meetingscust: any[] = [];
  show: boolean = true;
  customerList : CustomerModel[] = [];
  projList : ProjectModel[] = [];


  selectedCust : string;
  selectedProj: string;
  selectedCustArray : string[] = [];
  selectedProjArray : string[] = [];
  
  rowId: number = 0;
  emp: Emp[] = [];
  allproj: boolean = false;
  ngOnInit() {
    let i;
    for (i = 0; i < 3; i++)
      this.mom.moM_ITEMS.push(this.getNewMomItem());

    this.project_list = this.mom_detail.projecT_ID;
    this.customer_list = this.mom_detail.customeR_ID;
    //this.reloadMoMDetail();
    this.GetProjectresource(this.rowId, this.project_list);
    this.getCustomerList();
  }

  getNewMomItem() {
    let mom_detail1 = new MOM_DETAIL();
    // if(this.allproj)
    //     {
    //     
    //     }
    //     else
    //     {
    //       this.selectedCustArray = [];
    //       mom_detail1.customeR_ID = this.selectedCust
    //       mom_detail1.projecT_ID = this.selectedProj;
    //     }
    return mom_detail1;
    }

  getCustomerList()
  {
    this.appService.getCustomer().subscribe(
      data => {
        this.customerList = data;
      }, error => {
        this._util.serviceError(error);
      }
    )
  }

  getProjectsForCustomer()
  {
    this.appService.getAllProjectsForCustomer(this.selectedCust).subscribe(
      data => {
        this.projList = data;
     //   this.fillCustProjDetails();
      }, error => {
        this._util.serviceError(error);
      }
    )
  }

  fillCustProjDetails()
  {
    let i;
    let len = this.mom.moM_ITEMS.length;
    this.mom.moM_ITEMS = [];
    for (i = 0; i < len; i++)
    {
      let newMoM = this.getnewMoM();
      this.mom.moM_ITEMS.push(newMoM);    
      this.GetProjectresource(i, newMoM.projecT_ID);
    }
  }

  getnewMoM()
  {
    let mom_detail2 = new MOM_DETAIL();
    this.selectedCustArray = [];
    this.selectedProjArray = [];
    this.selectedCustArray.push(this.selectedCust);
    this.selectedProjArray.push(this.selectedProj);

    mom_detail2.customeR_ID = this.selectedCustArray;
    mom_detail2.projecT_ID = this.selectedProjArray;

    return mom_detail2;
  }


  // SearchMoMOnDate(date) {
  //   this.appService.getMomsWithDate(date).subscribe(
  //     data => {
  //       this.meetings = data;
  //       this.ddshow = true;
  //     }
  //     , error => {
  //       this._util.serviceError(error);
  //     }
  //   )
  // }
  SearchMoMOnDate(date, projId) {
    this.appService.getMomsWithDate(date, projId).subscribe(
      data => {
        this.meetings = data;
        if (!this._util.IsGAVS()) {
          this.meetings.forEach(element => {
            if (element.moM_STATUS == "submit")
              this.meetingscust.push(element)
          });
        }
        this.ddshow = true;
      }
      , error => {
        this._util.serviceError(error);
      }
    )
  }
  OnChange(e : MouseEvent) {
    let result : boolean;
    result = this.isEmptyObject(this.mom.moM_ITEMS);
    if(result)
    {
      this.allproj =  !this.IsChecked;
      return true;
    }
    else
    {
      if(confirm("Changing the view will erase the Customer and Project you choose. Do you still want to continue??"))
      {
        this.allproj = !this.IsChecked;
        for(let i = 0; i< this.mom.moM_ITEMS.length ; i++)
        {
          this.mom.moM_ITEMS[i].customeR_ID = [];
          this.mom.moM_ITEMS[i].projecT_ID = [];
        }
        this.selectedProj = undefined;
        this.selectedCust = undefined;
        return true;
      }
      else
      {  
        if(!this.IsChecked)
          this.allproj = false;
        else
          this.allproj = true;

        return false;
      }
    } 
  }

  CreateNewMoMDetail()
  {

  }

  isEmptyObject(obj) {
    for(let key in obj){
      //if the value is 'object'
      if(obj[key] instanceof Object === true){
        if(this.isEmptyObject(obj[key]) === false) return false;
      }
      //if value is string/number
      else{
        //if array or string have length is not 0.
        if(obj[key].length !== 0) return false;
      }
    }
    return true;
  }

  reloadMoMDetail() {
    if (this.selectedYear != undefined && this.selectedMonth != undefined && this.selectedProj != undefined) {
      let d = "1-" + this.selectedMonth + "-" + this.selectedYear;
      this.SearchMoMOnDate(d, this.selectedProj);
    }
    // else 
    // alert("Choose Month and Year")
  }
  GetEmpName(empId) {
    this.appService.getEmpNameById(empId).subscribe(
      data => {
        this.empName = data;
        this.empname.push(this.empName);
      },
      error => {
        { this._util.serviceError(error); }
      }
    )
  }
  getMoMDetailbyMomId() {
    this.appService.GetMoMbyMoMId(this.selectedMoMId, this.selectedProj, this._util.IsGAVS()).subscribe(
      data => {
        this.editmom = data;
        this.updatemode = true;
        this.mom = new MOM();
        this.mom.moM_ITEMS.push(this.getNewMomItem());
        let b;
        for (b = 0; b < this.editmom.moM_ITEMS.length; b++) {
          let a;
          let numIds: string[] = [];
          if (b != 0)
            this.mom.moM_ITEMS.push(new MOM_DETAIL)
          for (a = 0; a < this.editmom.moM_ITEMS[b].customeR_ID.length; a++) {
            numIds.push(this.editmom.moM_ITEMS[b].customeR_ID[a])
          }
          this.mom.moM_ITEMS[b].id = this.editmom.moM_ITEMS[b].id;
          this.mom.moM_ITEMS[b].customeR_ID = numIds;
          this.mom.moM_ITEMS[b].projecT_ID = this.editmom.moM_ITEMS[b].projecT_ID;
          this.mom.meetinG_DESCRIPTION = this.editmom.meetinG_DESCRIPTION;
          this.mom.meetinG_DATE = this.editmom.meetinG_DATE;
          this.mom.meetinG_TIME = this.editmom.meetinG_TIME;
          this.mom.meetinG_VENUE = this.editmom.meetinG_VENUE;
          this.mom.chairperson = this.editmom.chairperson;
          this.mom.meetinG_AGENDA = this.editmom.meetinG_AGENDA;
          this.mom.meetinG_PARTICIPANTS = this.editmom.meetinG_PARTICIPANTS;
          this.mom.moM_ITEMS[b].discussioN_POINTS = this.editmom.moM_ITEMS[b].discussioN_POINTS;
          this.mom.moM_ITEMS[b].actioN_ITEM = this.editmom.moM_ITEMS[b].actioN_ITEM;
          this.mom.moM_ITEMS[b].priority = this.editmom.moM_ITEMS[b].priority;
          this.mom.moM_ITEMS[b].responsibility = this.editmom.moM_ITEMS[b].responsibility
          this.mom.moM_ITEMS[b].targeT_DATE = this.editmom.moM_ITEMS[b].targeT_DATE;
          this.project_list = this.mom.moM_ITEMS[b].projecT_ID
          let v;
          for (v = 0; v < this.mom.moM_ITEMS[b].customeR_ID.length; v++) {
            if (this.mom.moM_ITEMS[b].projecT_ID[b] == "") {
              this.project_list = [];
              this.project_list.push("all");
              this.project_list.push(this.mom.moM_ITEMS[b].customeR_ID[v].toString())
            }
          }
          this.GetProjectresource(b, this.project_list);
          if (this.editmom.status == "submit")
            this.disablediv = true;
        }
        if (this.editmom.createD_BY != localStorage.getItem('empid'))
          this.disablediv = true;

        if (this.editmom.createD_BY == localStorage.getItem('empid') && this.editmom.status != "submit")
          this.enableDelete = true;
      },
      error => {
        { this._util.serviceError(error); }
      }
    )
  }
  AddNewRow() {
    let newMOM = this.getnewMoM();
    this.mom.moM_ITEMS.push(newMOM);
    this.GetProjectresource((this.mom.moM_ITEMS.length -1), newMOM.projecT_ID);
  }
  GetProjectresource(rowId, project_list) {
    this.appService.getProjectResourcebyProjIds(project_list).subscribe(
      data => {
        this.empInfo[rowId] = data;
      },
      error => {
        { this._util.serviceError(error); }
      }
    )
  }

  resetForm(form)
  {
    form.reset();
  }
  Getname(status) {
    this.mom.status = status;
  }
  // SubmitForm(momform, status) {
  //   this.Getname(status);
  //   if (momform.valid) {
  //     this._loading = true;
  //     if (this.mom.status == "save" || this.mom.status == "submit" && this.selectedMoMId == undefined)
  //       this.service_addMOMDetails(this.mom)
  //     else if (this.mom.status == "update" || this.mom.status == "submit" && this.selectedMoMId != undefined)
  //       this.service_updateMoMDetails(this.mom);
  //   }
  //   else if(this.mom.moM_ITEMS.length >0)
  //   {
  //     for(let o of this.mom.moM_ITEMS)
  //     {
  //       let index = this.mom.moM_ITEMS.findIndex( record => record === o );
  //       if(o.discussioN_POINTS == undefined && o.priority == undefined && o.responsibility == undefined && o.targeT_DATE == undefined) 
  //       this.mom.moM_ITEMS.splice(index ,(this.mom.moM_ITEMS.length - index));
  //     }
  //     this._loading = true;
  //     if (this.mom.status == "save" || this.mom.status == "submit" && this.selectedMoMId == undefined)
  //       this.service_addMOMDetails(this.mom)
  //     else if (this.mom.status == "update" || this.mom.status == "submit" && this.selectedMoMId != undefined)
  //       this.service_updateMoMDetails(this.mom);
  //   }
  //   else
  //     alert("Enter the required fields")
  // }
  SaveMoM(momForm, status) {
    this.Getname(status);

    if (momForm.valid) {
      if (this.mom.status == "save" || this.mom.status == "submit" && this.selectedMoMId == undefined)
        if (this.getEmptyData(this.mom)) {
          alert("Enter the required fields")
        }
        else {
          let loop = false;
          for (let o of this.mom.moM_ITEMS) {
            if (o.actioN_ITEM == undefined)
              loop = true
          }
          if (loop) {
            if (confirm("Action Item empty.Do you still want to submit?"))
              this.service_addMOMDetails(this.mom)
          }
          else
            this.service_addMOMDetails(this.mom)
        }
    }
    else if (this.mom.moM_ITEMS.length > 0) {
      if (this.mom.status == "save" || this.mom.status == "submit" && this.selectedMoMId == undefined) {
        if (this.getEmptyData(this.mom)) {
          alert("Enter the required fields")
          // let i;
          // for (i = 0; i < 3; i++)
          //   this.mom.moM_ITEMS.push(this.getNewMomItem());
        }
        else {
          let loop = false;
          for (let o of this.mom.moM_ITEMS) {
            if (o.actioN_ITEM == undefined)
              loop = true
          }
          if (loop) {
            if (confirm("Action Item empty.Do you still want to submit?"))
              this.service_addMOMDetails(this.mom)
          }
          else
            this.service_addMOMDetails(this.mom)
        }
      }

      for (let o of this.mom.moM_ITEMS) {
        let index = this.mom.moM_ITEMS.findIndex(record => record === o);
        if (o.discussioN_POINTS == undefined && o.priority == undefined && o.responsibility == undefined && o.targeT_DATE == undefined)
          this.mom.moM_ITEMS.splice(index, (this.mom.moM_ITEMS.length - index));
      }
    }
    else
      alert("Enter the required fields")
  }
  UpdateMoM(momForm, status) {
    this.Getname(status);
    if (momForm.valid) {
      this._loading = true;
      if (this.mom.status == "update" || this.mom.status == "submit" && this.selectedMoMId != undefined)
        if (this.getEmptyData(this.mom)) {
          alert("Enter the required fields")
        }
        else
          this.service_updateMoMDetails(this.mom);
    }
    else if (this.mom.moM_ITEMS.length > 0) {
      if (this.mom.status == "update" || this.mom.status == "submit" && this.selectedMoMId != undefined) {
        if (this.getEmptyData(this.mom)) {
          alert("Enter the required fields")
        }
        else
          this.service_updateMoMDetails(this.mom);
      }
      for (let o of this.mom.moM_ITEMS) {
        let index = this.mom.moM_ITEMS.findIndex(record => record === o);
        if (o.discussioN_POINTS == undefined && o.priority == undefined && o.responsibility == undefined && o.targeT_DATE == undefined)
          this.mom.moM_ITEMS.splice(index, (this.mom.moM_ITEMS.length - index));
      }
    }
    else
      alert("Enter the required fields")
  }
  getEmptyData(mom: MOM) {
    if (mom.meetinG_DESCRIPTION == undefined || mom.meetinG_DATE == undefined || mom.moM_ITEMS.length == 0)
      return true;

    else return false
  }
  DisplayCustandProj() {
    if (this.show == true)
      this.show = false;
    else
      this.show = true;

  }
  project_onChange($event) {
    let obj: CustomerProjectIds = $event;
   // console.log("customer" + $event.customer)
    let b;
    let count = this.mom.moM_ITEMS.length;

    let numIds: string[] = [];
    for (b = 0; b < obj.customer.length; b++) {
      numIds.push(obj.customer[b])
    }
    this.rowId = obj.rowId;
    this.mom.moM_ITEMS[this.rowId].customeR_ID = numIds;
    this.mom.moM_ITEMS[this.rowId].projecT_ID = obj.project;
    if (this.mom.moM_ITEMS[this.rowId].projecT_ID.length == 0) {
      this.project_list = [];
      this.project_list.push("all");
      let v;
      for (v = 0; v < this.mom.moM_ITEMS[this.rowId].customeR_ID.length; v++)
        this.project_list.push(this.mom.moM_ITEMS[this.rowId].customeR_ID[v].toString())
    }
    else if (this.mom.moM_ITEMS[this.rowId].customeR_ID.length == 0) {
      this.project_list = [];
      obj.project = [];
    }
    else {
      this.project_list = obj.project;
    }
    this.GetProjectresource(this.rowId, this.project_list);
  }
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empId', localStorage.getItem('empid'));
    headers.append('momId', this.selectedMoMId);
    return headers;
  }
  service_addMOMDetails(data: MOM) {
    this._loading = true;
    let apiuri: string = environment.webapiuri + 'AddMOMDetails';
    this._http.post(apiuri, data, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        if (this.mom.status == "submit") {
          alert("MoM submitted successfully");
          this.selectedCust = undefined;
          this.selectedProj = undefined;
          let element: HTMLElement = document.getElementById('closebutton') as HTMLElement;
          element.click();
        }
        else {
          let element: HTMLElement = document.getElementById('closebutton') as HTMLElement;
          element.click();
          alert("MoM Created successfully");
          this.selectedCust = undefined;
          this.selectedProj = undefined;
        }
        this.mom = new MOM();
        this._loading = false;
      }, error => { this._util.serviceError(error); });
  }
  service_updateMoMDetails(data: MOM) {
    this._loading = true;
    let apiuri: string = environment.webapiuri + 'UpdateMOMDetails';
    this._http.post(apiuri, data, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        if (this.mom.status == "submit") {
          alert("MoM submitted successfully");
          this.selectedCust = undefined;
          this.selectedProj = undefined;
          let element: HTMLElement = document.getElementById('closebutton') as HTMLElement;
          element.click();
        }
        else {
          alert("MoM Updated successfully");
          this.selectedCust = undefined;
          this.selectedProj = undefined;
          let element: HTMLElement = document.getElementById('closebutton') as HTMLElement;
          element.click();
        }
        this._loading = false;
        this.mom = new MOM();

      }, error => { this._util.serviceError(error); });
  }

}
