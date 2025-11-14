import { Component, OnInit, Input, ViewChild, Output, EventEmitter, AfterViewInit, DebugElement , ChangeDetectorRef, AfterContentChecked} from '@angular/core';
import { AppsService } from '../../../../Services/apps.service';
import { myUtility } from '../../../../Shared/myUtility';
import { MatDialog, MatDialogConfig, MatOption, MatSelect } from '@angular/material';
import { ViewCssDetailsComponent } from '../view-css-details/view-css-details.component';
import { CssdashboardInputs } from '../../../../models/cssdashboard-inputs';
import { SurveyService } from '../../../survey/survey.service';
import { ObjectUnsubscribedError } from 'rxjs';

@Component({
  selector: 'app-cssdashboard-filter',
  templateUrl: './cssdashboard-filter.component.html',
  styleUrls: ['./cssdashboard-filter.component.scss']
})
export class CssdashboardFilterComponent implements OnInit {

  ddyear: number[]
  selectedQuarter: string;
  selectedYear: number;
  trendQuarter: number = 1;
  //customerIds: string;
  customer: any = [];
  businessUnits: any = [];
  @Input("custId") custId: string;
  @Input("allCust") allCust: boolean;
  @ViewChild('mySel') mySel: MatSelect;
  @ViewChild('myCSM') myCSM: MatSelect;
  @ViewChild('myBU') myBU: MatSelect;
  @ViewChild('allCustomerSelected') allCustomerSelected: MatOption;
  @ViewChild('allCSMSelected') allCSMSelected: MatOption;
  @ViewChild('allBUSelected') allBUSelected: MatOption;

  allAccountsExcepttop15Accounts: any
  top15Accounts: any
  customerIds: any;
  _loading: boolean = false;
  dates: any[];
  fromDate: Date = new Date();
  toDate: Date = new Date();
  @Output() getCssInputEmitter = new EventEmitter<any>();
  cssInputs: CssdashboardInputs= new CssdashboardInputs();
   CSMList: any;
   csmIds: string;
  csmIdsa: any;
  customerIdsa: any;
  allGSLabAccounts: any;
  allGSLabKeyAccounts: any;
  qualitySpocAccounts: any;
  allstrategicAccounts :any;
  resultData: any;
  frequency: string ="Both";
  filteredCustomers: any = [];
  isAccountDropdownDisabled: boolean = false;
  selectedBUs: any[] = [];
  constructor(public _util: myUtility, private _appService: AppsService, private surveyService: SurveyService, private dialog: MatDialog, private cdref: ChangeDetectorRef) { }
   ngAfterContentChecked() {

    this.cdref.detectChanges();

  }
  
  selectDefaultvalues() {
    this.selectDefaultCSM();
    this.selectDefaultCustomer();
    this.selectDefaultBU();
    setTimeout(() => {
      this.checkAll();
    }, 500);
  }

  ngOnInit() {
    this.ddyear = this._util.Years(3);
    this.selectedYear = this._util.Year();
    this.trendQuarter = 1;//this.allCust ? -1 : Number(this.custId);
    this.getAccountsForUser();
    this.frequency ="Both";
    this.csmIds = "-1";
    this.service_GetCSMList();
    this.selectedQuarter = this.IsPremier() == true ? "Select Period" : "lastQuarter";
    this.filteredCustomers = this.customer;
    this.selectedBUs = ["All"];
  }

  getAccountsForUser() {
    var role = localStorage.getItem('role');
    this._loading = true;
    this._appService.getAccountsForCSATDashboard(this.allCust).subscribe(data => {
      this.resultData = data;
      if (this.resultData != undefined) {
        this.customer = this.resultData.customers;
         this.filteredCustomers = this.customer; 
        this.top15Accounts = this.resultData.allTop15Accounts;
        this.allAccountsExcepttop15Accounts = this.resultData.allAccountsExceptTop15Accounts;
        this.qualitySpocAccounts = this.resultData.allQASpocAccounts;
        this.allGSLabAccounts = this.resultData.allGSLabAccounts;
        this.allGSLabKeyAccounts = this.resultData.allGSLabKeyAccounts;
        this.allstrategicAccounts = this.resultData.allstrategicAccounts;
         this.businessUnits = this.customer.map(x => x.businesS_UNIT).filter((value, index, self) => {
          return value && value.trim() !== '' && self.indexOf(value) === index;
        }).sort();
    }
   
      
      if (this.customer != undefined) {
        if (this.allCust) {
          this.customer.splice(0, 1);
          this.customerIds = this.customer.map(x => x.cusT_ID);
          this.customerIds.unshift("-1");
        }
        else {
          this.customerIds = this.customer.map(x => x.cusT_ID);
          this.customerIds.unshift("-1");
        }
        this.selectDefaultvalues();
      }
      this._loading = false;
    }, error => { this._util.serviceError(error); this._loading = false; })
  }
  checkAll() {
    this.mySel.options.forEach((item: MatOption) => item.select());
    this.myCSM.options.forEach((item: MatOption) => item.select());
    this.myBU.options.forEach((item: MatOption) => item.select());
    this.emitChanges();
  }
  CheckIfAllSelected() {
    let selectArray = this.mySel.options.toArray();

    for (let i = 1; i < selectArray.length; i++) {
      if (selectArray[i].selected)
        continue;
      else
        return false
    }
    return true;

  }
  
  toggleSelectionForCustomer() {
    if (this.allCustomerSelected.selected)
      this.mySel.options.forEach((item: MatOption) => item.select());
    else
      this.mySel.options.forEach((item: MatOption) => item.deselect());
  }

  customerTosslePerOne() {
    if (this.allCustomerSelected.selected) {
      this.allCustomerSelected.deselect();
      return false;
    }
    let count = 0;
    this.mySel.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
    if (this.customer.length == count)
      this.allCustomerSelected.select();
  }

  toggleSelectionForCSM() {
    if (this.allCSMSelected.selected)
      this.myCSM.options.forEach((item: MatOption) => item.select());
    else
      this.myCSM.options.forEach((item: MatOption) => item.deselect());
  }

  csmTosslePerOne() {
    if (this.allCSMSelected.selected) {
      this.allCSMSelected.deselect();
      return false;
    }
    let count = 0;
    this.myCSM.options.forEach((item: MatOption) => {
      if (item.selected) {
        count++;
      }
    });
    if (this.CSMList.length == count)
      this.allCSMSelected.select();
  }
 onBUSelectionChange() {
  const selectedBUValues = this.myBU.value;
  if (selectedBUValues && selectedBUValues.includes("All")) {

    this.isAccountDropdownDisabled = true;
    this.filteredCustomers = this.customer;
    setTimeout(() => {
      this.mySel.options.forEach((item: MatOption) => item.select());
    }, 0);
  } 
  else if (selectedBUValues && selectedBUValues.length > 0) {
    this.isAccountDropdownDisabled = true;
    
    this.filteredCustomers = this.customer.filter(c => 
      selectedBUValues.includes(c.businesS_UNIT)
    );
    
    const filteredCustomerIds = this.filteredCustomers.map(c => c.cusT_ID);  
    this.mySel.options.forEach((item: MatOption) => item.deselect());
  
    setTimeout(() => {
      this.mySel.options.forEach((item: MatOption) => {
        if (filteredCustomerIds.includes(item.value) || item.value === "-1") {
          item.select();
        }
      });
    }, 0);
  } 
  else {
    this.isAccountDropdownDisabled = false;
    this.filteredCustomers = this.customer;
  }
  
  this.selectedPeriod_OnChange();
}

  toggleSelectionForBU() {
  if (this.allBUSelected.selected) {
    this.myBU.options.forEach((item: MatOption) => item.select());
  } else {
    this.myBU.options.forEach((item: MatOption) => item.deselect());
  }
}

buTosslePerOne() {
  if (this.allBUSelected.selected) {
    this.allBUSelected.deselect();
    setTimeout(() => {
      this.onBUSelectionChange();
    }, 0);
    return false;
  }
  
  let count = 0;
  this.myBU.options.forEach((item: MatOption) => {
    if (item.selected) {
      count++;
    }
  });
  
  if (this.businessUnits.length == count) {
    this.allBUSelected.select();
  }
  
}
  public IsPremier() {
    let custid = this.getCustomerIds();
    if (custid == "202100062" || custid == "212100001" || custid == "202100062,212100001" || custid == "212100001,202100062")
      return true;
    else
      return false;
  }
  
  service_GetCSMList() {
    this.surveyService.GetCSMListDistinct().subscribe(data => {
      this.CSMList = data;
    }, error => { this._util.serviceError(error); });
  }
  selectedPeriod_OnChange() {
    this._loading = true;
    if (!this.IsPremier() && this.selectedQuarter == "Select Period") {
      this.selectedQuarter = this.IsPremier() == true ? "Select Period" : "lastQuarter";
    }


    if (this.selectedQuarter == "Select Period") {
      this.fromDate = null;
      this.toDate = null;
    }
    this.getdatesForQuarter();

  }

  reset() {
    this._loading = true;
    this.trendQuarter = 1;
    if (this.allCust) {
      this.selectedQuarter = "lastQuarter";
      this.mySel.options.forEach((item: MatOption) => item.deselect());
      this.myCSM.options.forEach((item: MatOption) => item.deselect());
      this.customerIds = "-1";
      this.csmIds = "-1";
      this.selectDefaultvalues();
    }
    else {
      this.selectDefaultvalues();
    }
  }
   selectDefaultCSM() {
     if (this.myCSM != undefined && this.myCSM.options != undefined && this.myCSM.options.first != undefined) {
       this.myCSM.options.first.select();
     }
   }
  selectDefaultCustomer() {
    if (this.mySel != undefined && this.mySel.options != undefined && this.mySel.options.first != undefined) {
      this.mySel.options.first.select();
    }
  }
   selectDefaultBU() {
    if (this.myBU != undefined && this.myBU.options != undefined && this.myBU.options.first != undefined) {
      this.myBU.options.first.select();
    }
  }

  getdatesForQuarter() {
  

    this.dates = this._util.getDatesBasedOnQuarter(this.selectedQuarter, this.selectedYear, this.trendQuarter, this.fromDate, this.toDate);
    this.fromDate = this.dates[0].fromDate;
    this.toDate = this.dates[0].toDate;
    if(this.selectedQuarter == 'H1' || this.selectedQuarter == 'H2'|| this.selectedQuarter == 'Annual' )
      { 
        this._loading = false;
        return;
      }
    this.selectedQuarter = this.selectedQuarter != "Select Period" ? this._util.getQuarter(this.toDate.getMonth() + 1) : this.selectedQuarter;
    this.selectedYear = this.selectedQuarter == "Q4" ? this.toDate.getFullYear() - 1 : this.toDate.getFullYear();
    this._loading = false;
  }

  emitChanges() {
    if (this.selectedQuarter == "Select Period") {
      if (this.fromDate > this.toDate) {
        alert("Please choose From Date less than To Date.");
        return false;
      }
    }
    this.getdatesForQuarter();
   
    this.getCssInputEmitter.emit({
      selectedYear: this.selectedYear,
      selectedQuarter: this.selectedQuarter,
      fromDate: this.fromDate,
      toDate: this.toDate,
      trendQuarter: this.trendQuarter,
      customerIds: this.getCustomerIds(),
      csmIds: this.getCsmIds(),
      frequency: this.frequency
    });
  }

  getCustomerIds() {
    let opCustomers: string = "";
    if (this.mySel.value != undefined && this.mySel.value.indexOf != undefined) {
      if (this.mySel.value.indexOf("-1") != -1) {
        opCustomers = "-1";
      }
      else {
        if (this.mySel.value.indexOf("-2") != -1) {
          if (this.qualitySpocAccounts != undefined)
            opCustomers += (opCustomers != "" ? "," : "") + this.qualitySpocAccounts;
        }
        if (this.mySel.value.indexOf("-3") != -1) {
          if (this.top15Accounts != undefined)
            opCustomers += (opCustomers != "" ? "," : "") + this.top15Accounts;
        }
        if (this.mySel.value.indexOf("-4") != -1) {
          if (this.allAccountsExcepttop15Accounts != undefined)
            opCustomers += (opCustomers != "" ? "," : "") + this.allAccountsExcepttop15Accounts;
        }
        if (this.mySel.value.indexOf("-5") != -1) {
          if (this.allGSLabAccounts != undefined)
            opCustomers += (opCustomers != "" ? "," : "") + this.allGSLabAccounts;
        }
        if (this.mySel.value.indexOf("-6") != -1) {
          if (this.allGSLabKeyAccounts != undefined)
            opCustomers += (opCustomers != "" ? "," : "") + this.allGSLabKeyAccounts;
        }
        if (this.mySel.value.indexOf("-7") != -1) {
          if (this.allstrategicAccounts != undefined)
            opCustomers += (opCustomers != "" ? "," : "") + this.allstrategicAccounts;
        }
        opCustomers += (opCustomers != "" ? "," : "") + this.mySel.value.join(',');
      }
    }
    else {
      opCustomers = "-1";
      this.selectDefaultCustomer();
    }
    return opCustomers;
  }


  getCsmIds() {
    let opCsmIds: string = "";
    if (this.myCSM.value != undefined && this.myCSM.value.indexOf != undefined) {
      if (this.myCSM.value.indexOf("-1") != -1) {
        opCsmIds = "-1";
      }
      else {
        opCsmIds += (opCsmIds != "" ? "," : "") + this.myCSM.value.join(',');
      }
    }
    else {
      opCsmIds = "-1";
      this.selectDefaultCSM();
    }
    return opCsmIds;
  }



  ViewCSSDetails() {
    this.bindCSATInputs();
    const dialogRef = new MatDialogConfig();
    dialogRef.autoFocus = true;
    dialogRef.data = {
      'cssInputs': this.cssInputs
    }
    dialogRef.maxWidth = "80%";
    dialogRef.width = "80%";
    dialogRef.height = "80%";
    const dialog = this.dialog.open(ViewCssDetailsComponent, dialogRef);
    dialog.afterClosed().subscribe(res => {
      this.cssInputs = new CssdashboardInputs();
    })
  }

  bindCSATInputs() {
    this.cssInputs = new CssdashboardInputs();
    let obj = new CssdashboardInputs();
    obj.StarT_DATE = this.fromDate != undefined ? new Date(this.fromDate).toDateString() : "";
    obj.enD_DATE = this.toDate != undefined ? new Date(this.toDate).toDateString() : "";
    obj.csM_IDs = this.getCsmIds();
    if (this.mySel.value != undefined && this.mySel.value.indexOf != undefined) {
      if (this.mySel.value.indexOf("-1") != -1)
        obj.customeR_IDS = "-1"; //this.getCustomerIds();
      else
        obj.customeR_IDS = this.getCustomerIds();
    }
    else
      obj.customeR_IDS = "-1";

    // if (this.selectedQuarter == "Select Period") {
    //   obj.frequency = "Monthly"
    // }
    // else {
    //   obj.frequency = "Quarterly"
    // }
    obj.frequency = this.frequency;
    this.cssInputs = obj;

  }
}
