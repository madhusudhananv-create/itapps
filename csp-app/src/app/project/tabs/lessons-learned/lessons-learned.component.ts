import { Component, OnInit ,Input ,ViewChild } from '@angular/core';
import { LessonLearntModel } from '../../../models/lesson-learnt-model';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Http, Headers, RequestOptions } from '@angular/http';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { AccessControl } from '../../../Shared/accessControl';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-lessons-learned',
  templateUrl: './lessons-learned.component.html',
  styleUrls: ['./lessons-learned.component.scss']
})
export class LessonsLearnedComponent implements OnInit {

  editLessonLearnt:LessonLearntModel = new LessonLearntModel();
  readonlymode: boolean = true;
  editmode: boolean = false;
  ddCategoryOfLesson:string[];
  ddProcessArea:string[];
  constructor(private _http: Http, private _util: myUtility, private _appservice: AppsService, private _access: AccessControl,private _spinner: Ng4LoadingSpinnerService) { }
  @Input('ProjectId') input_projectid: string;
  @ViewChild('bppaginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['index' ,'categorY_OF_LESSON','description', 'publisheD_BY', 'publisheD_DATE','procesS_AREA','edit','delete'];
  dataSource : MatTableDataSource<LessonLearntModel>
  ngOnInit() 
  {
    this.getLessonLearntforProject()
  }
  ngOnChanges() {
    this.getLessonLearntforProject()
  }
  getLessonLearntforProject() {
    this._spinner.show();
    this._appservice.getLessonLearntbyProjId(this.input_projectid).subscribe(data => {
      this.dataSource = new MatTableDataSource<LessonLearntModel>(data.lessonlearnt)
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort; 
      this.ddCategoryOfLesson = data.ddCategoryOfLesson;
      this.ddProcessArea = data.ddProcessArea
      this._spinner.hide();
    }, error => { this._util.serviceError(error); })
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
      this._appservice.deleteLessonLearnt(element).subscribe(data => {this.getLessonLearntforProject() }, error => { this._util.serviceError(error); });
    } else {

    }
  }
  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter required fields");
      return;
    }
    if (this.editLessonLearnt.id === 0 || this.editLessonLearnt.id === undefined) {
      this.editLessonLearnt.projecT_ID = this.input_projectid;
      this.service_addLessonLearnt(this.editLessonLearnt);
      this.readonlymode = true;
      this.editmode = false;
    }
    else {
      // let issue = this.input.filter(t => t.id == this.EditIssue.id)[0];
      // issue = this.EditIssue;
      this.service_updateLessonLearnt(this.editLessonLearnt);
      this.readonlymode = true;
      this.editmode = false;
    }
    this.editLessonLearnt = new LessonLearntModel();
  }
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empId' , localStorage.getItem('empid'));
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
