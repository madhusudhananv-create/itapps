import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { myUtility } from '../../Shared/myUtility';
import { Input } from '@angular/core';
import { KpiSharedService } from '../../controls/kpi/kpi-shared.service';
import { AppsService } from '../../Services/apps.service';
import { Router, RoutesRecognized } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';
//import { ProjectSelectorComponent } from '../project-selector/project-selector.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SharedService } from '../../Shared/shared.service';
import { MatDialog, MatDialogConfig, MatSelect } from '@angular/material';
import { KpiFileUploadComponent } from './kpi-file-upload/kpi-file-upload.component';
import { AccessControl } from '../../Shared/accessControl';
import { ExternalKpiDataUploadComponent } from './external-kpi-data-upload/external-kpi-data-upload.component';
import { ExternalKpiFormulaUploadComponent } from './external-kpi-formula-upload/external-kpi-formula-upload.component';
import { RequestOptions } from '@angular/http';
import { Observable } from 'rxjs-compat';


@Component({
  selector: 'app-kpi',
  templateUrl: './kpi.component.html',
  styleUrls: ['./kpi.component.scss'],
  providers: [KpiSharedService],
})
export class KpiComponent implements OnInit {
  @Input('custId') custId: string;
  tempVariable: string;
  projId: string;
  includeInternal: Boolean = false;
  CustomerGoal: Boolean = true;
  disabled: boolean = false;
  previousUrl: any;
  ddCustomer: MatSelect
  displayedColumns = ['index', 'description', 'issuE_TYPE', 'severitY', 'actioN_PLAN', 'assigneD_TO', 'status', 'edit', 'delete'];
  Customer = [];
  tabIndex: boolean = false;
  isProductView: boolean = false;
  prodId: number;
  isUploadVisible: boolean = false;
  portId: number;
  modeId: number;
  month: number;
  year: any;
  kpiId: number;
  tierId: number;
  selectedTabIndex: number;
  private _http: any;
  message: any;
  _loading: boolean = false;
  slaAvailable: boolean = false;
  productViewTabIndex: number = 0;
  constructor(public _util: myUtility, private _activatedRoute: ActivatedRoute, public _appService: AppsService, public router: Router, public _shared: SharedService, public dialog: MatDialog, public _access: AccessControl) { }

  ngOnInit() {
    this._util.validateLogin();
    if (this._util.IsPremier(this.custId) || this._util.IsBaseMeasureEnabledCustomer(this.custId)) {
      this.isProductView = true;
    }

    const storedData = localStorage.getItem('slaAvailableList');
    const slaAvailableList = storedData ? JSON.parse(storedData) : [];
    this.slaAvailable = slaAvailableList.filter(x => x.customerId == this.custId)[0].slaAvailable;
    if(this.slaAvailable){
      this.isProductView = true;
    }

    //this.LoadCustomerByEmpId();
    if (this.custId != null && this.custId != undefined)
      this.tempVariable = this.custId;

    this.router.events
      .pipe(filter((e: any) => e instanceof RoutesRecognized),
        pairwise()
      ).subscribe((e: any) => {
      });
    // if (this._util.IsPremier(this.custId) && this._access.IsAllowed(73, 1, '', ''))
    //   this.isUploadVisible = true;
    if (this._activatedRoute.snapshot.url.toString().startsWith("productkpi")) {
      this._activatedRoute.params.subscribe(params => {
        this.custId = params['custid'];
        this.portId = params['portId'];
        this.prodId = params['prodId']
        this.modeId = params['modeId'];
        this.month = params['month'];
        this.year = params['year'];
        this.kpiId = params['kpiId'];
        this.isProductView = true;
        this.LoadCustomerByEmpId();
        this.selectedTabIndex = 1;
        this.tabIndex = true;
      })
    }
    else {
      this.LoadCustomerByEmpId();
    }
    if (this._util.IsPremier(this.custId) && this._access.IsAllowed(73, 1, '', ''))
      this.isUploadVisible = true;
    //this.custId = Number(this._activatedRoute.snapshot.params["custid"]);
  }
  ngOnChanges() {

  }
  LoadCustomerByEmpId() {

    this._appService.GetCustomerList(localStorage.getItem('empid'), false).subscribe(data => {
      this.Customer = data;
      if (this.Customer.length > 0 && this.custId != undefined) {
        //this.ddCustomer_Onchange();
        this.Customer = this.Customer.filter(x => x.cusT_ID == this.custId)
      }
      else if (this.Customer.length > 0 && this.custId != undefined) {
        this.custId = this.Customer[0].releasE_ID;
        // this.ddCustomer_Onchange();
      }
    }, error => { this._util.serviceError(error); });
  }
  ddCustomer_Onchange() {

  }

  project_onChange($event) {
    let obj: any = JSON.parse($event);
    this.custId = obj.customer;
    this.projId = obj.project;
    //this.LoadData();
  }

  getSelectedProjectsList(event) {

    this.projId = event;

  }

  getSelectedProduct(event) {
    if (event != null) {
      this.prodId = event.prodArray;
      this.tierId = event.tierId;
    }
  }
  onIncludeChange() {

  }
  OntabChange(index) {
    if (index == 2)
      this.tabIndex = true;
    else
      this.tabIndex = false;
  }
  OnProductViewtabChange(index) {
    this.productViewTabIndex = index;
    if (index == 1)
      this.tabIndex = true;
    else
      this.tabIndex = false;

    if (index > 1)
      this.OntabChange(index)
  }
  getDashboard(custId) {
    if (this._util.btnCalledFromNewCSMDashboard == false && !this._util.IsPremier(custId) && !this._util.IsBaseMeasureEnabledCustomer(custId)) {
      this.router.navigate(['/newdashboard/cust', custId, false])
    }
    else if (this._util.IsPremier(custId) || this._util.IsBaseMeasureEnabledCustomer(custId)) {
      this.router.navigate(['/serviceleveldashboard/cust', custId, true])
    }
    else {
      localStorage.removeItem('selectedCustomer')
      localStorage.setItem('selectedCustomer', custId)
      this.router.navigate(['/csm-dashboard'])
    }
  }

  OpenFileUploadDialog() {
    const dialogRef = new MatDialogConfig();
    dialogRef.autoFocus = true;
    dialogRef.maxWidth = "70%";
    dialogRef.width = "30%";
    dialogRef.height = "250px";
    dialogRef.data = {
      'custId': this.custId
    };
    this.dialog.open(ExternalKpiDataUploadComponent, dialogRef);
  }

  OpenFileUploadDialogF() {
    const dialogRef = new MatDialogConfig();
    dialogRef.autoFocus = true;
    dialogRef.maxWidth = "70%";
    dialogRef.width = "30%";
    dialogRef.height = "250px";
    dialogRef.data = {
      'custId': this.custId
    };
    this.dialog.open(ExternalKpiFormulaUploadComponent, dialogRef);
  }
  ProcessExternalKPIs() {
    this._loading = true;
    let ipDate = new Date("1/" + this._util.tableMonth + "/" + this._util.tableYear).toDateString();
    this._appService.ProcessExternalKPIs(this.custId, ipDate).subscribe(
      data => {
        this._loading = false;
        this.message = data;
        alert(this.message + " For " + this._util.tableMonth + " " + this._util.tableYear);
        //this.getSelectedProduct(null);
      },
      error => {
        { this._util.serviceError(error); this._loading = false; }
      });
  }

}
