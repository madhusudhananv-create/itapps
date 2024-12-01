import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { enumDateRange, enumRoles } from '../../../Shared/enum';
import { AccessControl } from '../../../Shared/accessControl';
import { LayoutService } from '../layout.service';
import { ActivatedRoute } from '@angular/router';
import { ProjectsModel } from '../../../models/projects-model';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { MatPaginator, MatTableDataSource, MatProgressBar } from '@angular/material';
import { environment } from '../../../../environments/environment';
import { PeopleModel } from '../../../models/people-model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';






@Component({
  selector: 'app-people-page',
  templateUrl: './people-page.component.html',
  styleUrls: ['./people-page.component.scss']
})
export class PeoplePageComponent implements OnInit {

  private sub: any;
  input_projectid: string;
  input_customerid: string;
  _loading: boolean = true;
  showdetails: boolean = false;
  projNames: ProjectsModel[];
  allproj: boolean = false;
  empid: string;
  ngtest: string;
  input: any;
  @Input('inputrag') input_rag: any;
  dataSource: any;
  txtChallenges: any;
  readonlymode: boolean = true;
  editmode: boolean = false;
  editPeople: boolean = false;
  EditAllowed = true;
  displayedColumns = ['index', 'title', 'emP_Name', 'onsite', 'offshore'];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    //this.dataSource.paginator = this.paginator;
  }

  constructor(private route: ActivatedRoute, private _access: AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService, public _layoutService: LayoutService,
    private _spinner: Ng4LoadingSpinnerService) { }

  ngOnInit() {



    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
      this._layoutService.selectedCust = this.input_customerid;
    });

    this.getAllProjectsFromCustomer();



    //People section




  }
  // ngOnChanges() {

  //   console.log("After intiliazing id in ngOnChanges",this.input_projectid);
  //   if(this.input_projectid!=undefined)
  //   this.getProjectPeopleByProjId(this.input_projectid);   
  // }

  getAllProjectsFromCustomer() {


    this._appservice.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe(
      data => {
        this.projNames = data;
        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {
          this.input_projectid = this.projNames[0].proJ_ID;
          this.onProjectChange();

        }

      },
      error => {
        this._util.serviceError(error);
      }
    )
  }



  //People section code

  SubmitForm(forminput) {
    if (!forminput.valid) {
      alert('Please enter required fields');
      return;
    }
    let s: PeopleModel = new PeopleModel();
    s.projecT_ID = this.input_projectid;
    s.resourcE_CHALLENGES = forminput.value.txtChallenges;
    s.updateD_BY = localStorage.getItem('empid');
    s.updateD_DATE = new Date();
    this._util.updateRAG(this.input_rag, 'people', forminput.value.ragSelected);
    this.service_updatePeople(this.input_projectid, forminput.value.ragSelected, s.resourcE_CHALLENGES);
    //this.service_updateScope(this.input_projectid, rag, description, technology, scope);
    this.readonlymode = true;
    this.editmode = false;
    alert(" Saved successfully")
  }
  EditPeopleIndex: number;
  EditEmpID: string;
  EditPeople_onClick(index, id) {
    this.EditPeopleIndex = index;
    this.EditEmpID = id;
  }
  IsReadonlyCust(i, id) {
    return true;
    if (this.EditPeopleIndex === i && this.EditEmpID === id)
      return false;
    else
      return true;
  }
  SavePeople_onClick(emp) {
    this._appservice.updateResourceTitle(emp).subscribe(data => {
      this.getNewTitle();
    }, error => { this._util.serviceError(error); });
    this.EditPeopleIndex = null;
    this.EditEmpID = null;
  }
  CancelPeople_onClick() {
    this.EditPeopleIndex = null;
    this.EditEmpID = null;
  }
  getNewTitle() {
    if (this.input != null && this.input.resource.length > 0) {
      this._appservice.getNewResource(this.input_projectid)
        .subscribe(
          data => {
            this.input.resource = data;
          },
          error => {
            this._util.serviceError(error);
          });
    }
  }
  //**********************************************
  //service methods
  //**********************************************
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    return headers;
  }
  dataUpdate: any;
  fdate: any;
  service_updatePeople(projid, rag, challenges) {
    //var datePipe = new DatePipe("en-US");
    //this.fdate = datePipe.transform(Date(), 'dd/MM/yyyy').toString() ;
    let apiuri: string = environment.webapiuri + 'UpdatePeople';

    this.dataUpdate = {
      PROJECT_ID: projid,
      RAG: rag,
      RESOURCE_CHALLENGES: challenges,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: new Date()
    }

    this._http.post(apiuri, this.dataUpdate, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  //**********************************************

  getProjectPeopleByProjId(projectID: string) {

    this._appservice.getProjectPeopleByProjId(projectID).subscribe(
      data => {
        this.input = data;
        console.log(data);
      },
      error => {

        this._util.serviceError(error);
      }
    )
  }


  getProjectRagsByProjId(projectID: string) {

    this._appservice.getProjectRagsByProjId(projectID).subscribe(
      data => {
        this.input_rag = data;

        this.showdetails = true;
        this._loading = false;

      },
      error => {

        this._util.serviceError(error);
      }
    )


  }

  onProjectChange() {

    // this.showdetails=false;
    this._loading = true;

    this.getProjectPeopleByProjId(this.input_projectid);
    this.getProjectRagsByProjId(this.input_projectid);

    // this.dataSource = new MatTableDataSource<any>(this.input.resource);





  }


}
