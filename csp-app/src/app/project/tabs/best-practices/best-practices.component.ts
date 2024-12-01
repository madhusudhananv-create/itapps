import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { MatPaginator, MatTableDataSource, MatSort, MatDialogConfig, MatDialog } from '@angular/material';
import { AccessControl } from '../../../Shared/accessControl';
import { BestPracticesModel } from '../../../models/best-practices-model';
import { environment } from '../../../../environments/environment';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { map, startWith } from 'rxjs/operators';
import { BestpracticeMatrixComponent } from '../../../bestpractice-matrix/bestpractice-matrix.component';

@Component({
  selector: 'app-best-practices',
  templateUrl: './best-practices.component.html',
  styleUrls: ['./best-practices.component.scss']
})
export class BestPracticesComponent implements OnInit {

  constructor(private _http: Http, private _util: myUtility, private _appservice: AppsService, private _access: AccessControl, private _spinner: Ng4LoadingSpinnerService, public dialog: MatDialog) { }
  @Input('ProjectId') input_projectid: string;
  @Input('CustomerId') input_customerid: string;
  @ViewChild('bppaginator') paginator1: MatPaginator;
  @ViewChild('bppaginator1') paginator2: MatPaginator;
  @ViewChild(MatSort) sort1: MatSort;
  @ViewChild(MatSort) sort2: MatSort;
  displayedColumns = ['index', 'description', 'reporteD_BY', 'reporteD_DATE', 'revieweD_BY', 'revieweD_DATE', 'approveD_BY', 'approveD_DATE', 'procesS_AREA', 'edit', 'delete'];
  displayedColumns1 = ['index1', 'description1', 'reporteD_BY1', 'reporteD_DATE1', 'use'];
  readonlymode: boolean = true;
  editmode: boolean = false;
  dataSource1: MatTableDataSource<BestPracticesModel>
  dataSource2: MatTableDataSource<BestPracticesModel>
  ddIndustryVertical: any;
  ddClientServiceArea: string[];
  clientservicearea: string;
  myControl = new FormControl();
  ddProcessArea: string[];
  ddServiceArea: string[];
  ddClientITBusiness: any;
  ddstatus: any
  editBestPractice: BestPracticesModel = new BestPracticesModel()
  filteredBestpractices: BestPracticesModel[] = [];
  filterSearchedBestpractices: BestPracticesModel[] = [];

  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  // }
  ngOnInit() {
    this.getBestPracticesforProject()
  }
  ngOnChanges() {
    this.getBestPracticesforProject()
  }
  bestpracticeData:BestPracticesModel[] = [];
  getBestPracticesforProject() {
    this._spinner.show();
    this.editmode = false;
    this.readonlymode = true;
    this._appservice.getBestPracticesbyProjId(this.input_projectid).subscribe(data => {
      let newdadta = data.bestpractice.filter(t=> t.status != "Not Applicable");
      this.dataSource1 = new MatTableDataSource<BestPracticesModel>(newdadta)
      this.bestpracticeData = newdadta;
      this.dataSource1.paginator = this.paginator1;
      this.dataSource1.sort = this.sort1;
      this.editBestPractice = new BestPracticesModel();
      this.ddIndustryVertical = data.ddIndVertical;
      this.ddClientITBusiness = data.ddClientITBusiness;
      this.ddServiceArea = data.ddServiceArea;
      this.ddProcessArea = data.ddProcessArea;
      this.ddstatus = data.ddStatus;
      this.filteredBestpractices = []
      this._spinner.hide();
    }, error => { this._util.serviceError(error); })
  }
  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
    this.filteredBestpractices = []
  }
  GetFilteredBestPractices(event: any) {
   
    this._appservice.getBestPracticesFromDescription(event).subscribe(
      data => {
        this.filteredBestpractices = data;
        this.dataSource2 = new MatTableDataSource<BestPracticesModel>(this.filteredBestpractices);
      }, error => { this._util.serviceError(error); })
  }
  // onKey(event: any) {
  //   let desc = event.target.value;
  //   if(desc != "")
  //   {
  //     this.filterSearchedBestpractices = this.filteredBestpractices.filter(t=>t.description.toLowerCase().includes(desc.toLowerCase()));
  //     this.dataSource2 = new MatTableDataSource<BestPracticesModel>(this.filterSearchedBestpractices);
  //   }  
  //   else
  //   this.filterSearchedBestpractices = [];
  // }
  showBestPracMatrix() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      processArea: "all",
      serviceArea: "all"
    },
      dialogConfig.maxWidth = "100%"
    dialogConfig.height = "100%",
      dialogConfig.width = "100vw"
    const dialogRef = this.dialog.open(BestpracticeMatrixComponent, dialogConfig);
    // dialogRef.updateSize('100%', '100%');
    dialogRef.updatePosition({ top: '10px' });
    dialogRef.afterClosed().subscribe(result => {
//console.log(`Dialog result: ${result}`);
    });
  }

  sendMailToCSM(bestpractiseForm)
  {
    if(bestpractiseForm.valid)
    {
      this.editBestPractice.projecT_ID = this.input_projectid;
      this._appservice.sendMailToCSM(this.input_projectid, this.input_customerid, this.editBestPractice).subscribe(data => {  }, error => { this._util.serviceError(error); });
    }
  }

  Use_Element(element) {
    this.editBestPractice.description = element.description;
    this.editBestPractice.referencE_BEST_PRACTICE_ID = element.id
  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.editBestPractice = new BestPracticesModel();
    this.filteredBestpractices = [];
  }
  EditRow_onClick(element) {
    this.editBestPractice = element;
    this.GetFilteredBestPractices(element.procesS_AREA)
    this.editmode = true;
    this.readonlymode = false;
  }
  DeleteRow_onClick(element): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteBestPractices(element).subscribe(data => { this.getBestPracticesforProject() }, error => { this._util.serviceError(error); });
    } else {

    }
  }
  GetBPIndustryVertical(depT_ID) {
    this.ddIndustryVertical.dep
  }
  // AddNewType() 
  // {
  //   if (this.clientservicearea != "" && this.clientservicearea != undefined) {
  //     if(!this.ddClientServiceArea.includes(this.clientservicearea))
  //     this.ddClientServiceArea.push(this.clientservicearea);
  //     this.editBestPractice.clienT_SERVICE_AREA = this.clientservicearea;
  //   }
  // }
  // ClearType() 
  // {
  //   this.clientservicearea = "";
  // }
  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter required fields");
      return;
    }
    if (this.editBestPractice.id === 0 || this.editBestPractice.id === undefined) {
      this.editBestPractice.projecT_ID = this.input_projectid;
      this.service_addBestPractices(this.editBestPractice);
      this.readonlymode = true;
      this.editmode = false;
    }
    else {
      // let issue = this.input.filter(t => t.id == this.EditIssue.id)[0];
      // issue = this.EditIssue;
      this.service_updateBestPractices(this.editBestPractice);
      this.readonlymode = true;
      this.editmode = false;
    }
    this.editBestPractice = new BestPracticesModel();
  }

  //service methods
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    headers.append('empId', localStorage.getItem('empid'))
    return headers;
  }
  service_addBestPractices(bestpractice: BestPracticesModel) {
    let apiuri: string = environment.webapiuri + 'AddBestPractices';
    this._http.post(apiuri, bestpractice, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.getBestPracticesforProject();
        // this.dataSource.push(JSON.parse(data.text()));
        // this.RefreshTable();
      }, error => { this._util.serviceError(error); });
  }
  service_updateBestPractices(bestpractice: BestPracticesModel) {
    let apiuri: string = environment.webapiuri + 'UpdateBestPractices';
    this._http.post(apiuri, bestpractice, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        // this.RefreshTable();
        this.getBestPracticesforProject();
      }, error => { this._util.serviceError(error); });
  }
  bShowFilter: boolean = true;
  ToggleFilter_onClick() {
    this.bShowFilter = !this.bShowFilter;
  }
  Filter_onChange($event) {
    let filteredData = $event;
    this.dataSource1 = new MatTableDataSource(filteredData);
    // this.dataSource1.paginator = this.paginator;
    // this.dataSource1.sort = this.sort;
  }
}
