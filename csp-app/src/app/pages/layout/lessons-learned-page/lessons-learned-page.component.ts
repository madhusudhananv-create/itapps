import { Component, OnInit ,Input ,ViewChild } from '@angular/core';
import { LessonLearntModel } from '../../../models/lesson-learnt-model';
import { MatPaginator, MatTableDataSource, MatSort, MatDialogConfig } from '@angular/material';

import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Http, Headers, RequestOptions } from '@angular/http';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { AccessControl } from '../../../Shared/accessControl';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from '../layout.service';
import { enumDateRange, enumRoles } from '../../../Shared/enum';
import { ProjectsModel } from '../../../models/projects-model';

@Component({
  selector: 'app-lessons-learned-page',
  templateUrl: './lessons-learned-page.component.html',
  styleUrls: ['./lessons-learned-page.component.scss']
})

export class LessonsLearnedPageComponent implements OnInit {

  editLessonLearnt:LessonLearntModel = new LessonLearntModel();
  readonlymode: boolean = true;
  editmode: boolean = false;
  ddCategoryOfLesson:string[];
  ddProcessArea:string[];
  input_projectid: string;
  allLessonsLearnt:any;
  constructor(private route: ActivatedRoute,private _http: Http, private _util: myUtility, private _appservice: AppsService, private _access: AccessControl,private _spinner: Ng4LoadingSpinnerService,public _layoutService: LayoutService) { }
 // @Input('ProjectId') input_projectid: string;


  private sub: any;
  input_customerid: string;
  allproj: boolean = false;
  projNames: ProjectsModel[];
  showdetails: boolean = false;
  _loading:boolean=true;
  maxdate=new Date();


  @ViewChild('bppaginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['index' ,'categorY_OF_LESSON','description', 'publisheD_BY', 'publisheD_DATE','procesS_AREA','edit','delete'];
  dataSource : MatTableDataSource<LessonLearntModel>
  ngOnInit()
  {

      this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];


    });


    let role = localStorage.getItem('role');



    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;


    this._layoutService.selectedCust = this.input_customerid;
    this.getAllProjectsFromCustomer();



  }
  // ngOnChanges() {
  //   // this.getLessonLearntforProject()
  // }



getAllProjectsFromCustomer() {
    this._appservice.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe(
      data => {
        this.projNames = data;



        if(this.projNames!=undefined && this.projNames!=null && this.projNames.length>0)
        {
            this.input_projectid = this.projNames[0].proJ_ID;
            // this.showdetails = true;
            this.onProjectChange();
        }

      },
      error => {
        this._util.serviceError(error);
      }
    )
  }


  onProjectChange() {

    //this.input.daterange.startDate = new Date();
    //this.LoadData(enumDateRange.Weekly);

    this.getLessonLearntforProject()
  }






  getLessonLearntforProject() {
    this._spinner.show();
    this._loading=true;

    this._appservice.getLessonLearntbyProjId(this.input_projectid).subscribe(data => {
      this.dataSource = new MatTableDataSource<LessonLearntModel>(data.lessonlearnt)
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.ddCategoryOfLesson = data.ddCategoryOfLesson;
      this.ddProcessArea = data.ddProcessArea
      this._spinner.hide();
      this.allLessonsLearnt=data.lessonlearnt;

      this.showdetails=true;
      this._loading=false;

    }, error => {
      this._loading=false;
      this._util.serviceError(error); })
  }
  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.editLessonLearnt = new LessonLearntModel();
  }
  EditRow_onClick(element)
  {
    this.editLessonLearnt = element;
    this.editmode = true;
    this.readonlymode= false;
  }
  DeleteRow_onClick(element): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._loading=true;
      this._appservice.deleteLessonLearnt(element).subscribe(data => {this.getLessonLearntforProject() }, error => { this._util.serviceError(error); });
      alert("Deleted successfully")
    } else {

    }
  }
  SubmitForm(isValid) {

    this._loading=true;
    if (!isValid) {
      this._loading=false;
      alert("Please enter required fields");
      return;
    }
    if (this.editLessonLearnt.id === 0 || this.editLessonLearnt.id === undefined) {
      this.editLessonLearnt.projecT_ID = this.input_projectid;
      this.service_addLessonLearnt(this.editLessonLearnt);
      alert("Added successfully")
      this.readonlymode = true;
      this.editmode = false;
    }
    else {
      // let issue = this.input.filter(t => t.id == this.EditIssue.id)[0];
      // issue = this.EditIssue;
      this.service_updateLessonLearnt(this.editLessonLearnt);
      alert("Updated successfully")
      this.readonlymode = true;
      this.editmode = false;
    }
    this.editLessonLearnt = new LessonLearntModel();
  }
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empId' , localStorage.getItem('empid'))
    return headers;
  }
  service_addLessonLearnt(lessonlearnt: LessonLearntModel) {
    let apiuri: string = environment.webapiuri + 'AddLessonLearnt';
    this._http.post(apiuri, lessonlearnt, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.getLessonLearntforProject();
        // this.dataSource.push(JSON.parse(data.text()));
        // this.RefreshTable();
      }, error => { this._util.serviceError(error); });
  }
  service_updateLessonLearnt(bestpractice: LessonLearntModel) {
    let apiuri: string = environment.webapiuri + 'UpdateLessonLearnt';
    this._http.post(apiuri, bestpractice, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        // this.RefreshTable();
        this.getLessonLearntforProject();
      }, error => { this._util.serviceError(error); });
  }
  bShowFilter: boolean = true;
  ToggleFilter_onClick() {
    this.bShowFilter = !this.bShowFilter;
  }
  Filter_onChange($event) {
    let filteredData = $event;
    this.dataSource = new MatTableDataSource(filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
