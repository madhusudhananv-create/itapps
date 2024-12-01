import { Component, OnInit, Input, ViewChild, ChangeDetectorRef,ElementRef } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { myUtility } from '../../../Shared/myUtility';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../../../environments/environment';
import { AppsService } from '../../../Services/apps.service';
import { ActionitemModel } from '../../../models/actionitem-model';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { MinutesofmeetingComponent } from '../../../minutesofmeeting/minutesofmeeting.component';
import{MOM_DETAIL} from '../../../models/mom-details-model'
import { AccessControl } from '../../../Shared/accessControl';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-actionitem',
  templateUrl: './actionitem.component.html',
  styleUrls: ['./actionitem.component.scss']
})
export class ActionitemComponent implements OnInit {
  @Input() input: ActionitemModel[];
  @Input('ProjectId') input_projectid: string;
  @Input('CustomerId') input_custId : string;
  EditActionitem: ActionitemModel;
  displayedColumns = ['index', 'description', 'owner', 'priority', 'targeT_DATE', 'status', 'completioN_DATE', 'comments', 'source', 'identifieD_DATE', 'edit', 'delete'];
  dataSource = new MatTableDataSource(this.input);
  mom_detail:MOM_DETAIL = new MOM_DETAIL;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  @ViewChild('TABLE') table: ElementRef;
  constructor(private _access: AccessControl, private _http: Http, private _util: myUtility, private _appservice: AppsService, private changeDetectorRefs: ChangeDetectorRef,public dialog: MatDialog) { }
  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.input);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.newEditActionitem(); 
  }
  ngOnChanges() {
    this.dataSource = new MatTableDataSource(this.input);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.newEditActionitem();   
  }

  EditAllowed = true;
  readonlymode: boolean = true;
  editmode: boolean = false;
  dataUpdate: any;
  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter required fields");
      return;
    }
    if (this.EditActionitem.id === 0 || this.EditActionitem.id === undefined) {
      this.EditActionitem.id = 0;
      this.EditActionitem.projecT_ID = this.input_projectid;
      this.EditActionitem.rag = 'green';
      this.EditActionitem.createD_BY = localStorage.getItem('empid');
      this.EditActionitem.createD_DATE = new Date();
      this.EditActionitem.updateD_BY = localStorage.getItem('empid');
      this.EditActionitem.updateD_DATE = new Date();
      this.service_addActionitem(this.EditActionitem);
      this.readonlymode = true;
      this.editmode = false;
    }
    else {
      this.EditActionitem.updateD_BY = localStorage.getItem('empid');
      this.EditActionitem.updateD_DATE = new Date();
      this.service_updateActionitem(this.EditActionitem);
      this.readonlymode = true;
      this.editmode = false;
    }
    this.newEditActionitem();
    this.changeDetectorRefs.detectChanges();
  }
  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
    this.RefreshTable();
  }
  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.newEditActionitem();
    this.RefreshTable();
  }
  ExportTOExcel()
{
  let name = 'ActionItem'
  this._util.exportToExcel(this.table.nativeElement , name)
  // const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);
  // const wb: XLSX.WorkBook = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
  // /* save to file */
  // XLSX.writeFile(wb, 'ActionItem.xlsx');
  
}
  EditRow_onClick(element) {
    this.EditActionitem = element;
    this.Edit_onClick()
  }
  DeleteRow_onClick(element): void {
    if (confirm('Are you sure you want to delete the record?')) {
      this._appservice.deleteActionItem(element).subscribe(data => { }, error => { this._util.serviceError(error); });
      this.input.splice(this.input.indexOf(element), 1);
      this.RefreshTable();
    } else {

    }
  }
  showMoM() 
  {
    this.mom_detail = new MOM_DETAIL;
    this.mom_detail.customeR_ID.push(this.input_custId);
    this.mom_detail.projecT_ID.push(this.input_projectid);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      mom: this.mom_detail,
    }
    const dialogRef = this.dialog.open(MinutesofmeetingComponent, dialogConfig);
    dialogRef.updateSize('90%', '550px').updatePosition({ top: '25px', left: '100px' });
    dialogRef.afterClosed().subscribe(result => {
//console.log(`Dialog result: ${result}`);
    });
  }
  RefreshTable() {
    this.dataSource = new MatTableDataSource<any>(this.input);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  //**********************************************
  //service methods
  //**********************************************
  GetAuthHeader() {
    let headers = new Headers({ 'Accept': 'application/json' });
    headers.append('token', this._util.AppSettings.token);
    return headers;
  }
  service_addActionitem(actionitem) {
    let apiuri: string = environment.webapiuri + 'AddActionitem';
    this._http.post(apiuri, actionitem, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.input.push(JSON.parse(data.text()));
        this.RefreshTable();
      }, error => { this._util.serviceError(error); });
  }
  service_updateActionitem(actionitem) {
    let apiuri: string = environment.webapiuri + 'UpdateActionitem';
    this._http.post(apiuri, actionitem, { headers: this.GetAuthHeader() })
      .subscribe(data => {
        this.RefreshTable();
      }, error => { this._util.serviceError(error); });
  }
  //**********************************************
  newEditActionitem() {
    this.EditActionitem = new ActionitemModel();
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