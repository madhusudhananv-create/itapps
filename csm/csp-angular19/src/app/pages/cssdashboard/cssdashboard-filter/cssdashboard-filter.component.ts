import { Component, OnInit, Input, ViewChild, Output, EventEmitter, AfterContentChecked, ChangeDetectorRef, inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatOptionModule, MatOption, MatNativeDateModule, MAT_DATE_FORMATS, DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../../shared/my-utility';
import { CssdashboardInputs } from '../../../models/cssdashboard-inputs';
import { SurveyService } from '../../../core/services/survey.service';
import { ViewCssDetailsComponent } from '../view-css-details/view-css-details.component';

// Custom date adapter to display "Month Day, Year" format (e.g., "October 1, 2025")
@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
    return super.format(date, displayFormat);
  }
}

export const MY_DATE_FORMATS = {
  parse: { dateInput: 'input' },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

@Component({
  selector: 'app-cssdashboard-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ],
  templateUrl: './cssdashboard-filter.component.html',
  styleUrl: './cssdashboard-filter.component.scss'
})
export class CssdashboardFilterComponent implements OnInit, AfterContentChecked {

  ddyear: number[] = [];
  selectedQuarter: string = '';
  selectedYear: number = 0;
  trendQuarter: number = 1;
  customer: any = [];
  businessUnits: any = [];
  @Input("custId") custId?: string;
  @Input("allCust") allCust?: boolean;
  @Input() currIndex: number = 0;
  @Output() prevClicked = new EventEmitter<void>();
  @Output() nextClicked = new EventEmitter<void>();
  @ViewChild('mySel') mySel!: MatSelect;
  @ViewChild('myCSM') myCSM!: MatSelect;
  @ViewChild('myBU') myBU!: MatSelect;
  @ViewChild('allCustomerSelected') allCustomerSelected!: MatOption;
  @ViewChild('allCSMSelected') allCSMSelected!: MatOption;
  @ViewChild('allBUSelected') allBUSelected!: MatOption;

  allAccountsExcepttop15Accounts: any;
  top15Accounts: any;
  customerIds: any;
  _loading: boolean = false;
  dates: any[] = [];
  fromDate: Date | null = new Date();
  toDate: Date | null = new Date();
  @Output() getCssInputEmitter = new EventEmitter<any>();
  cssInputs: CssdashboardInputs = new CssdashboardInputs();
  CSMList: any;
  csmIds: string = '';
  csmIdsa: any;
  customerIdsa: any;
  allGSLabAccounts: any;
  allGSLabKeyAccounts: any;
  qualitySpocAccounts: any;
  allstrategicAccounts: any;
  resultData: any;
  frequency: string = "Both";
  filteredCustomers: any = [];
  selectedBUs: any[] = [];
  accountSearchText: string = '';

  public _util = inject(MyUtility);
  private _appService = inject(AppsService);
  private surveyService = inject(SurveyService);
  private dialog = inject(MatDialog);
  private cdref = inject(ChangeDetectorRef);

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  selectDefaultvalues() {
    this.selectDefaultCSM();
    this.selectDefaultCustomer();
    this.selectDefaultBU();
    // Increase timeout to ensure ViewChild elements and their options are fully rendered
    setTimeout(() => {
      this.checkAllWithRetry();
    }, 800);
  }

  /**
   * Retry checkAll if ViewChild elements aren't ready yet
   */
  private checkAllWithRetry(retryCount = 0) {
    const maxRetries = 5;
    if (!this.mySel || !this.myCSM || !this.myBU || 
        !this.mySel.options || this.mySel.options.length === 0) {
      if (retryCount < maxRetries) {
        setTimeout(() => this.checkAllWithRetry(retryCount + 1), 300);
        return;
      }
    }
    this.checkAll();
  }

  ngOnInit() {
    this.ddyear = this._util.Years(3);
    this.selectedYear = this._util.Year();
    this.trendQuarter = 1;
    this.getAccountsForUser();
    this.frequency = 'Both';
    this.csmIds = "-1";
    this.service_GetCSMList();
    this.selectedQuarter = this.IsPremier() == true ? "Select Period" : "lastQuarter";
    this.filteredCustomers = this.customer;
    this.selectedBUs = ["All"];
    this.accountSearchText = '';
  }

  getAccountsForUser() {
    var role = localStorage.getItem('role');
    this._loading = true;
    this._appService.getAccountsForCSATDashboard(this.allCust || false).subscribe({
      next: (data: any) => {
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
          this.businessUnits = this.customer.map((x: any) => x.businesS_UNIT).filter((value: any, index: any, self: any) => {
            return value && value.trim() !== '' && self.indexOf(value) === index;
          }).sort();
        }

        if (this.customer != undefined) {
          if (this.allCust) {
            this.customer.splice(0, 1);
            this.customerIds = this.customer.map((x: any) => x.cusT_ID);
            this.customerIds.unshift("-1");
          }
          else {
            this.customerIds = this.customer.map((x: any) => x.cusT_ID);
            this.customerIds.unshift("-1");
          }
          this.selectDefaultvalues();
        }
        this._loading = false;
      },
      error: (error: any) => { this._util.serviceError(error); this._loading = false; }
    });
  }

  checkAll() {
    if (!this.mySel || !this.myCSM || !this.myBU) {
      return;
    }
    this.mySel.options.forEach((item: MatOption) => item.select());
    this.myCSM.options.forEach((item: MatOption) => item.select());
    this.myBU.options.forEach((item: MatOption) => item.select());
    this.emitChanges();
  }

  CheckIfAllSelected() {
    if (!this.mySel || !this.mySel.options) {
      return false;
    }
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
    if (!this.allCustomerSelected || !this.mySel) {
      return;
    }
    if (this.allCustomerSelected.selected)
      this.mySel.options.forEach((item: MatOption) => item.select());
    else
      this.mySel.options.forEach((item: MatOption) => item.deselect());
  }

  customerTosslePerOne() {
    if (!this.allCustomerSelected || !this.mySel) {
      return true;
    }
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
    return true;
  }

  toggleSelectionForCSM() {
    if (!this.allCSMSelected || !this.myCSM) {
      return;
    }
    if (this.allCSMSelected.selected)
      this.myCSM.options.forEach((item: MatOption) => item.select());
    else
      this.myCSM.options.forEach((item: MatOption) => item.deselect());
  }

  csmTosslePerOne() {
    if (!this.allCSMSelected || !this.myCSM) {
      return true;
    }
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
    return true;
  }

  onBUSelectionChange() {
    const selectedBUValues = this.myBU.value;
    if (selectedBUValues && selectedBUValues.includes("All")) {
      this.filteredCustomers = this.customer;
      setTimeout(() => {
        this.mySel.options.forEach((item: MatOption) => item.select());
      }, 0);
    }
    else if (selectedBUValues && selectedBUValues.length > 0) {

      this.filteredCustomers = this.customer.filter((c: any) =>
        selectedBUValues.includes(c.businesS_UNIT)
      );

      const filteredCustomerIds = this.filteredCustomers.map((c: any) => c.cusT_ID);
      this.mySel.options.forEach((item: MatOption) => item.deselect());

      setTimeout(() => {
        this.mySel.options.forEach((item: MatOption) => {
          if (filteredCustomerIds.includes(item.value) || item.value === -1) {
            item.select();
          }
        });
      }, 0);
    }
    else {
      this.filteredCustomers = this.customer;
    }

    this.selectedPeriod_OnChange();
  }

  toggleSelectionForBU() {
    if (!this.allBUSelected || !this.myBU) {
      return;
    }
    if (this.allBUSelected.selected) {
      this.myBU.options.forEach((item: MatOption) => item.select());
    } else {
      this.myBU.options.forEach((item: MatOption) => item.deselect());
    }
  }

  buTosslePerOne() {
    if (!this.allBUSelected || !this.myBU) {
      return true;
    }
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
    return true;
  }

  public IsPremier() {
    let custid = this.getCustomerIds();
    if (custid == "202100062" || custid == "212100001" || custid == "202100062,212100001" || custid == "212100001,202100062")
      return true;
    else
      return false;
  }

  service_GetCSMList() {
    this.surveyService.GetCSMListDistinct().subscribe({
      next: (data: any) => {
        this.CSMList = data;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  selectedPeriod_OnChange() {
    this._loading = true;
    if (!this.IsPremier() && this.selectedQuarter == "Select Period") {
      this.selectedQuarter = this.IsPremier() == true ? "Select Period" : "lastQuarter";
    }

    if (this.selectedQuarter == "Select Period") {
      this.fromDate = null as Date | null;
      this.toDate = null as Date | null;
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
    
    // For lastQuarter, check if the date range spans H1 or H2 and display accordingly
    if (this.selectedQuarter == 'lastQuarter' && this.fromDate && this.toDate) {
      const fromMonth = this.fromDate.getMonth();
      const toMonth = this.toDate.getMonth();
      const monthSpan = (toMonth - fromMonth + 12) % 12;
      
      // If span is ~6 months, it's a half-year period
      if (monthSpan >= 5 && monthSpan <= 7) {
        // Jan-Jun (months 0-5) = H1, Jul-Dec (months 6-11) = H2
        if (fromMonth >= 6 && toMonth >= 6) {
          this.selectedQuarter = 'H2';
          this.selectedYear = this.fromDate.getFullYear();
        } else if (fromMonth < 6 && toMonth < 6) {
          this.selectedQuarter = 'H1';
          this.selectedYear = this.fromDate.getFullYear();
        }
      }
    }
    
    if (this.selectedQuarter == 'H1' || this.selectedQuarter == 'H2' || this.selectedQuarter == 'Annual') {
      this._loading = false;
      return;
    }
    this.selectedQuarter = this.selectedQuarter != "Select Period" && this.toDate ? this._util.getQuarter(this.toDate.getMonth() + 1) : this.selectedQuarter;
    this.selectedYear = this.selectedQuarter == "Q4" && this.toDate ? this.toDate.getFullYear() - 1 : (this.toDate ? this.toDate.getFullYear() : this.selectedYear);
    this._loading = false;
  }

  emitChanges() {
    if (this.selectedQuarter == "Select Period") {
      if (this.fromDate && this.toDate && this.fromDate > this.toDate) {
        alert("Please choose From Date less than To Date.");
        return false;
      }
    }
    this.getdatesForQuarter();

    const emittedData = {
      selectedYear: this.selectedYear,
      selectedQuarter: this.selectedQuarter,
      fromDate: this.fromDate,
      toDate: this.toDate,
      trendQuarter: this.trendQuarter,
      customerIds: this.getCustomerIds(),
      csmIds: this.getCsmIds(),
      frequency: this.frequency
    };
    this.getCssInputEmitter.emit(emittedData);
    return true;
  }

  getCustomerIds() {
    let opCustomers: string = "";
    if (!this.mySel || this.mySel.value == undefined || this.mySel.value.indexOf == undefined) {
      return opCustomers;
    }
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
    if (!this.myCSM || this.myCSM.value == undefined || this.myCSM.value.indexOf == undefined) {
      return "-1";
    }
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
    //dialogRef.maxWidth = "80%";
    dialogRef.width = "80%";
    dialogRef.height = "80%";
    const dialog = this.dialog.open(ViewCssDetailsComponent, dialogRef);
    dialog.afterClosed().subscribe((res: any) => {
      // Dialog closed
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
        obj.customeR_IDS = "-1";
      else
        obj.customeR_IDS = this.getCustomerIds();
    }
    else
      obj.customeR_IDS = "-1";

    obj.frequency = this.frequency;
    this.cssInputs = obj;
  }

  onPrev() {
    this.prevClicked.emit();
  }

  onNext() {
    this.nextClicked.emit();
  }

  /**
   * Handle account search text change
   * Filters the customer list based on search input
   */
  onAccountSearchChange() {
    if (this.accountSearchText && this.accountSearchText.trim() !== '') {
      const searchLower = this.accountSearchText.toLowerCase().trim();
      this.filteredCustomers = this.customer.filter((c: any) => 
        c.cusT_NM.toLowerCase().includes(searchLower)
      );
    } else {
      this.filteredCustomers = this.customer;
    }
  }
}
