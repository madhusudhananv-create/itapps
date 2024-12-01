import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatPaginator, MatTableDataSource, MatSort, MatDialogConfig, MatDialog } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../../../environments/environment';
import { AppsService } from '../../../Services/apps.service';
import { InnovationModel, GAVSService } from '../../../models/innovation-model';
import { FormsModule } from '@angular/forms';

import { fromEvent } from 'rxjs/observable/fromEvent';
import { debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';
import { merge } from "rxjs/observable/merge";
import { AccessControl } from '../../../Shared/accessControl';
import { IdeasInnovationMatrixComponent } from '../../../ideas-innovation-matrix/ideas-innovation-matrix.component';

@Component({
  selector: 'app-innovation',
  templateUrl: './innovation.component.html',
  styleUrls: ['./innovation.component.scss'],
})
export class InnovationComponent implements OnInit {
  @Input() input: any[];
  @Input('inputrag') input_rag: any;
  @Input('ProjectId') input_projectid: string;
  EditInnovation: InnovationModel
  filteredIdeas:InnovationModel[];
  filtered1Ideas:InnovationModel[] =[];
  displayedColumns = [];
  displayedColumns1 = [];
  gavsServices:any;
  gavsServiceChecked:any[] = []
  dataSource = new MatTableDataSource(this.input);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource2: MatTableDataSource<InnovationModel>
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  constructor(private _access:AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService,public dialog: MatDialog) { }
  ngOnInit() {
    //if (this._util.IsEditable())
      this.displayedColumns = ['index', 'identifieD_DATE', 'description', 'status', 'targeT_DATE', 'actuaL_DATE', 'responsible', 'area', 'comments', 'edit', 'delete'];
    // else
    this.displayedColumns1 = ['index', 'identifieD_DATE','description','status', 'responsible','area','use'];
    //   this.displayedColumns = ['index', 'identifieD_DATE', 'description', 'status', 'targeT_DATE', 'actuaL_DATE', 'responsible', 'area', 'comments'];
    this.dataSource = new MatTableDataSource<any>(this.input);
    this.newEditInnovation();
  }
  ngOnChanges() {
    this.dataSource = new MatTableDataSource(this.input);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.newEditInnovation();
    this.editmode = false;
    this.readonlymode = true;
  }
  EditAllowed = true;
  readonlymode: boolean = true;
  editmode: boolean = false;
  processArea:string[];
  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
    this.getProcessAreaData();
    this.filteredIdeas = [];
    this.getGavsServices()
  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.newEditInnovation();
    this.EditInnovation.gavS_SERVICE = []
  }
  getProcessAreaData()
  {
    this._appservice.getProcessArea(this.input_projectid).subscribe(data => { this.processArea = data; }, error => { this._util.serviceError(error); })
  }
  GetFilteredIdeas(event :any)
  {
    this._appservice.getIdeasFromProcessArea(event).subscribe(
      data => {
        this.filteredIdeas = data;
        this.dataSource2 =  new MatTableDataSource<InnovationModel>(this.filteredIdeas);
       }, error => { this._util.serviceError(error); })
  }
  getGavsServices()
  {
    this._appservice.getGavsServices().subscribe(
      data => {
        this.gavsServices = data;
        this.gavsServices.forEach((element ,index) => {
          this.EditInnovation.gavS_SERVICE.push(new GAVSService()) 
          this.EditInnovation.gavS_SERVICE[index].servicE_ID = element.servicE_ID
        });
       }, error => { this._util.serviceError(error); })
  }
  EditRow_onClick(element) {
    this.EditInnovation = element;
    this.GetFilteredIdeas(element.area)
    this.Edit_onClick();
  }
  showIdeaMatrix()
  {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true,
    dialogConfig.data = {
      processArea: "all"
    },

      dialogConfig.maxWidth = "100%"
      dialogConfig.height ="100%",
      dialogConfig.width = "100vw"
    const dialogRef = this.dialog.open(IdeasInnovationMatrixComponent, dialogConfig);
    // dialogRef.updateSize('100%', '100%');
     dialogRef.updatePosition({top :'10px'});
    dialogRef.afterClosed().subscribe(result => {
     // console.log(`Dialog result: ${result}`);
    });
  }
  SaveRAG_onClick(rag) {
    if (rag === "" || rag === null) {
      alert("Please select RAG");
      return;
    }
    this._util.updateRAG(this.input_rag, 'innovation', rag);
    let ragdetails = {
      PROJECT_ID: this.input_projectid,
      CATEGORY: 'innovation',
      RAG: rag,
      UPDATED_BY: localStorage.getItem('empid'),
      UPDATED_DATE: this._util.getDate(new Date())
    };
    this.service_updateRag(ragdetails);
  }
  DeleteRow_onClick(element): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteInnovation(element).subscribe(data => { }, error => { this._util.serviceError(error); });
      this.input.splice(this.input.indexOf(element), 1);
      this.RefreshTable();
    } else {

    }
  }
  Use_Element(element)
  {
    this.EditInnovation.description = element.description;
    this.EditInnovation.referencE_IDEA_ID = element.id
  }
 
  // onKey(event: any) {
  //   let desc = event.target.value;
  //   if(desc != "")
  //   {
  //     this.filtered1Ideas = this.filteredIdeas.filter(t=>t.description.toLowerCase().includes(desc.toLowerCase()));
  //     this.dataSource2 = new MatTableDataSource<InnovationModel>(this.filtered1Ideas);
  //   }  
  //   else
  //   this.filteredIdeas = [];
  // }
  RefreshTable() {
    this.dataSource = new MatTableDataSource<any>(this.input);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter required fields");
      return;
    }
    if (this.EditInnovation.id === 0 || this.EditInnovation.id === undefined) {
      this.EditInnovation.id = 0;
      this.EditInnovation.projecT_ID = this.input_projectid;
      this.EditInnovation.rag = 'green';
      this.EditInnovation.createD_BY = localStorage.getItem('empid');
      this.EditInnovation.createD_DATE = new Date();
      this.EditInnovation.updateD_BY = localStorage.getItem('empid');
      this.EditInnovation.updateD_DATE = new Date();
      // this._appservice.addInnovation(this.EditInnovation)
      // .subscribe(data => {
      //   this.input.push(JSON.parse(JSON.stringify(data)));
      //   this.readonlymode = true;
      //   this.editmode = false;
      //   this.RefreshTable();
      //   alert("Improvements/Ideas added successfully")
      // }, error => { this._util.serviceError(error); });
      this.service_addInnovation(this.EditInnovation);
      this.readonlymode = true;
      this.editmode = false;
    }
    else {
      this.EditInnovation.updateD_BY = localStorage.getItem('empid');
      this.EditInnovation.updateD_DATE = new Date();
      this._appservice.updateInnovation(this.EditInnovation)
        .subscribe(data => {
          this.readonlymode = true;
          this.editmode = false;
          this.RefreshTable();
          alert("Ideas / Innovations updated successfully")
        }, error => { this._util.serviceError(error); });
      this.readonlymode = true;
      this.editmode = false;
    }
    this.newEditInnovation();
  }
  //**********************************************
  //service methods
  //**********************************************
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empid', localStorage.getItem('empid'));
    return headers;
  }
  service_updateRag(ragdetails) {
    let apiuri: string = environment.webapiuri + 'UpdateRags';
    this._http.post(apiuri, ragdetails, { headers: this.GetAuthHeader() })
      .subscribe(data => { }, error => { this._util.serviceError(error); });
  }
  service_addInnovation(innovation) {
    let apiuri: string = environment.webapiuri + 'AddInnovation';
    this._http.post(apiuri, innovation, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.input.push(JSON.parse(data.text()));
        this.RefreshTable();
      }, error => { this._util.serviceError(error); });
  }
  service_updateinnovation(innovation) {
    let apiuri: string = environment.webapiuri + 'UpdateInnovation';
    this._http.post(apiuri, innovation, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.RefreshTable();
      }, error => { this._util.serviceError(error); });
  }



  //**********************************************
  newEditInnovation() {
    this.EditInnovation = new InnovationModel();
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
