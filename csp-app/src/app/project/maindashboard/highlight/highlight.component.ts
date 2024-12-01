import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HighlightsModel } from '../../../models/highlights-model';
import { ClientDetailsModel } from '../../../models/client-details-model';
import { EmpInfoModel } from '../../../models/emp-info-model';
import { ProjectDetailsModel } from '../../../models/project-details-model';
import { CustomerProjectsModel } from '../../../models/customer-projects-model';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { CustomerModel } from '../../../models/customer-model';
import { ChartsService } from '../../../Services/charts.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Rx';
import { HttpClient } from 'selenium-webdriver/http';


@Component({
  selector: 'app-highlight',
  templateUrl: './highlight.component.html',
  styleUrls: ['./highlight.component.scss']
})
export class HighlightComponent implements OnInit {

  custId: string;
  projId: string;
  highlights: HighlightsModel[];
  newHighlight: HighlightsModel;
  clientDetails: CustomerModel[];
  customername: CustomerModel[];
  customerProjects: ProjectDetailsModel[];
  selectedProjectsArr: any;
  selectedClient: ClientDetailsModel;
  displayedColumns = ['index', 'description', 'publisH_DATE', 'edit', 'delete'];
  dataSource = new MatTableDataSource<any>(this._util.highlights);
  readonlymode: boolean = true;
  editmode: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  constructor(public _util: myUtility, private _appservice: AppsService, private _chartsService: ChartsService, private _activatedRoute: ActivatedRoute, private _http: Http) { }

  ngOnInit() {

    this.custId  = this._activatedRoute.snapshot.params["custId"];
    this.projId  = this._activatedRoute.snapshot.params["projId"];
    this.loadData( this.custId, this.projId);

    // this._appservice.getCustomerName(this.custId).subscribe(data => {
    //   this.customername = data;
    // }, error => { this._util.serviceError(error); });

    this._appservice.getCustomerProjectsName(localStorage.getItem('empid'), this.custId ).subscribe(data => {
      this.customerProjects = data;
    }, error => { this._util.serviceError(error); });

    this.newHighlight = new HighlightsModel;
    this.selectedProjectsArr = new ProjectDetailsModel;

  }
  loadData(client_ID, proj_ID) {
    this._chartsService.getHighlights(client_ID, proj_ID, this._util.AppSettings.token)
      .subscribe
      (
      data => {
        this._util.highlights = data;
        this.dataSource = new MatTableDataSource<any>(this._util.highlights);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
      ,
      error => {
        this._util.serviceError(error);
      }
      );
  }
  ngOnChanges() {
    this.dataSource = new MatTableDataSource(this._util.highlights);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  AddRow_onClick(){
    this.newHighlight = new HighlightsModel();
    this.newHighlight.projecT_ID = this.projId;
    this.readonlymode = false;
    this.editmode = true;
  }
  EditRow_onClick(element) {
    this.newHighlight = element;
    this.readonlymode = false;
    this.editmode = true;
  }
  DeleteRow_onClick(element): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteHighlights(element).subscribe(data => { }, error => { this._util.serviceError(error); });
      this._util.highlights.splice(this._util.highlights.indexOf(element), 1);
      this.RefreshTable();
    } else {

    }
  }
  Cancel_onClick() {

    let custId  = this._activatedRoute.snapshot.params["custId"];
    this.readonlymode = true;
    this.editmode = false;
    this.newHighlight = new HighlightsModel();
    this.loadData(this.custId, this.projId);
  }
  SubmitForm(highlightForm) {
    if (!highlightForm.valid) {
      alert("Please enter required fields");
      return;
    }
    if (this.newHighlight.id === 0 || this.newHighlight.id === undefined) {
      let dbHighlights = this._util.CopyObject(this.newHighlight);

      dbHighlights.id = 0;
      dbHighlights.publisH_DATE = this._util.GetLocalDate(this.newHighlight.publisH_DATE);
      dbHighlights.customeR_ID = this.custId;
      dbHighlights.projecT_ID = this.projId;
      dbHighlights.createD_BY = localStorage.getItem('empid');
      dbHighlights.createD_DATE = new Date();
      this.service_addHighlight(dbHighlights);
    }
    else {
      let dbHighlights = this._util.CopyObject(this.newHighlight);
      dbHighlights.publisH_DATE = this._util.GetLocalDate(this.newHighlight.publisH_DATE);
      dbHighlights.updateD_BY = localStorage.getItem('empid');
      dbHighlights.updateD_DATE = new Date();
      this.service_updateHighlight(dbHighlights);
    }
    this.Cancel_onClick();
    this.newHighlight = new HighlightsModel;
    highlightForm.submitted = false;
  }
  service_addHighlight(highlight: HighlightsModel) {
    this._appservice.addHighlight(highlight)
      .subscribe(data => {
        this.loadData( highlight.customeR_ID, highlight.projecT_ID);
        alert("Highlight added successfully")
      }, error => { this._util.serviceError(error); });
  }
  service_updateHighlight(highlight: HighlightsModel) {
    let apiuri: string = environment.webapiuri + 'UpdateHighLight';
    this._http.post(apiuri, highlight, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.loadData( this.custId, this.projId);
        alert("Highlight updated successfully")
      }, error => { this._util.serviceError(error); });
  }
  RefreshTable() {
    this.dataSource = new MatTableDataSource<any>(this._util.highlights);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    return headers;
  }
}
