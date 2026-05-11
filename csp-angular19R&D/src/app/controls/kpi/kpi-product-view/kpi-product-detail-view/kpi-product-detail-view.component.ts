import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { AppsService } from '../../../../core/services/apps.service';
import { MyUtility } from '../../../../shared/my-utility';
import { AccessControl } from '../../../../shared/access-control';

@Component({
  selector: 'app-kpi-product-detail-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule
  ],
  templateUrl: './kpi-product-detail-view.component.html',
  styleUrls: ['./kpi-product-detail-view.component.scss']
})
export class KpiProductDetailViewComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('TABLE') table: any;

  kpiId!: number;
  KpiData: any[] = [];
  KpiDataExclusion: any[] = [];
  remarks: string = '';
  isNA: boolean = false;
  isNoData: boolean = false;
  isDraft: boolean = true;
  isExclusion: boolean = false;
  exclusionComment: any;
  baseMeasureValId: any;
  kpiDetailId!: number;
  enableExclusion: boolean = false;
  isExNoData: boolean = false;
  exRemarks: string = '';
  loading: boolean = false;
  progress: boolean = false;
  isDisabled: boolean = false;
  outData: any[] = [];
  ipData: any[] = [];
  
  // For Excel export
  FinalTabData: any[] = [];
  displayedColumns: string[] = [];
  dataSource!: MatTableDataSource<any>;
  
  // Date fields
  currentMonth!: string;
  prevMonth!: string;
  currentYear!: string;
  month!: string;
  year!: string;
  productName: string = '';
  
  // Access control
  isKPIProcessEnabledCustomer: boolean = false;

  constructor(
    public dialog: MatDialogRef<KpiProductDetailViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _appservice: AppsService,
    public _util: MyUtility,
    public _access: AccessControl
  ) {
  }

  ngOnInit() {
    
    // Initialize from dialog data
    if (this.data) {
      this.kpiId = this.data.kpiId;
      this.KpiData = this.data.baseMeasureData || [];
      this.KpiDataExclusion = this.data.exclusionBaseMeasureData || [];
      this.kpiDetailId = this.data.kpiDetailId;
      this.enableExclusion = this.data.enableExclusion || false;
      this.baseMeasureValId = this.data.baseMeasureValId;
      this.productName = this.data.productName || '';
      this.month = this.data.month;
      this.year = this.data.year;
      this.isKPIProcessEnabledCustomer = this.data.isKPIProcessEnabledCustomer || false;
      
    }
    
    this.checkDisable();
  }

  SaveBaseMeasures() {
    
    if (this.KpiData.length == 1) {
      const numerator = this.KpiData.map(x => x.numerator);
      const denominator = this.KpiData.map(x => x.denominator);
      const denominatorDesc = this.KpiData.map(x => x.denominatorDescription);
      
      if (!this.isNA && !this.isNoData && ((denominator[0] == null && denominatorDesc[0] != 'NA') || (denominator[0] == '' && denominatorDesc[0] != 'NA'))) {
        this._util.showWarningPopup('Please fill the Base Measure Values.', 'Validation Error');
        return;
      }
      if ((!this.isNA || !this.isNoData) && denominator[0] == '0' && denominatorDesc[0] != 'NA') {
        this._util.showWarningPopup('Denominator cannot be Zero. Please enter valid value', 'Validation Error');
        return;
      }
      if ((this.isNA) && (this.remarks == '' || this.remarks == null)) {
        this._util.showWarningPopup('Please fill Reason for the month.', 'Validation Error');
        return;
      }
      if ((this.isNA) && this.remarks != null && this.remarks.trim().length < 10) {
        this._util.showWarningPopup('Please enter atleast 10 Characters for Reason.', 'Validation Error');
        return;
      }
      
      if (this.isExclusion) {
        const exNumerator = this.KpiDataExclusion.map(x => x.numerator);
        const exDenominator = this.KpiDataExclusion.map(x => x.denominator);
        const exDenominatorDesc = this.KpiDataExclusion.map(x => x.denominatorDescription);
        
        if (exNumerator.length == 1) {
          if (this.exclusionComment == '' || this.exclusionComment == null || this.exclusionComment == undefined) {
            this._util.showWarningPopup('Please fill justification for Exclusion.', 'Validation Error');
            return;
          }
          if (!this.isNA && !this.isExNoData && ((exDenominator[0] == null && exDenominatorDesc[0] != 'NA') || (exDenominator[0] == '' && exDenominatorDesc[0] != 'NA'))) {
            this._util.showWarningPopup('Please fill the Base Measure Values for Exclusion.', 'Validation Error');
            return;
          }
          if ((!this.isNA || !this.isExNoData) && exDenominator[0] == '0' && exDenominatorDesc[0] != 'NA') {
            this._util.showWarningPopup('Denominator for Exclusion cannot be Zero. Please enter valid value.', 'Validation Error');
            return;
          }
          if (this.isExNoData && (this.exRemarks == '' || this.exRemarks == null)) {
            this._util.showWarningPopup('Please fill Reason for the month for Exclusion.', 'Validation Error');
            return;
          }
          if ((this.isExNoData) && this.exRemarks != null && this.exRemarks.trim().length < 10) {
            this._util.showWarningPopup('Please enter atleast 10 Characters for Reason(Exclusion).', 'Validation Error');
            return;
          }
        }
      }
      
      if (this.isNA && (this.remarks != '' && this.remarks != null)) {
        // Return data in consistent object format
        const naData = {
          kpI_ACTUAL: 'NA',
          slA_STATUS: 'NA',
          secondarY_SLA_STATUS: 'NA',
          iS_NOT_APPLICABLE: 1,
          remarks: this.remarks,
          iS_NO_DATA: this.isNoData,
          iS_EXCLUSION: false,
          iS_EX_NO_DATA: this.isExNoData,
          exremarks: this.exRemarks,
          kpiData: this.KpiData
        };
        this.dialog.close({ data: naData });
        return;
      }
      else {
        this.getAchievement();
      }
    }
    else {
      let flag = [];
      let denomtotal = 0;
      
      for (let ele of this.KpiData) {
        if (!this.isNA && ele.denominator != null && ele.denominator != '') {
          denomtotal += ele.denominator;
        }
        else if ((!this.isNA) && (ele.numerator !== null && ele.denominator !== null) && (ele.numerator != '' && ele.denominator != '')) {
          flag.push(2);
        }
        else if ((this.isNA) && (this.remarks == '' || this.remarks == null)) {
          this._util.showWarningPopup('Please fill Reason for the month.', 'Validation Error');
          return;
        }
        else if ((this.isNA) && this.remarks.trim().length < 10) {
          this._util.showWarningPopup('Please enter atleast 10 Characters for Reason.', 'Validation Error');
          return;
        }
        else if (this.isNA && (this.remarks != '' || this.remarks != null)) {
          // Return data in consistent object format
          const naData = {
            kpI_ACTUAL: 'NA',
            slA_STATUS: 'NA',
            secondarY_SLA_STATUS: 'NA',
            iS_NOT_APPLICABLE: 1,
            remarks: this.remarks,
            iS_NO_DATA: this.isNoData,
            iS_EXCLUSION: false,
            iS_EX_NO_DATA: this.isExNoData,
            exremarks: this.exRemarks,
            kpiData: this.KpiData
          };
          this.dialog.close({ data: naData });
          return;
        }
        else {
          flag.push(1);
        }
      }
      
      if (denomtotal == 0 && !this.isNA) {
        this._util.showWarningPopup("Please fill Base Measure values with denominator values to proceed further.", "Validation Error");
        return;
      }
      else {
        this.KpiData = this.KpiData.filter(x => (x.numerator != null && x.denominator != null) && (x.denominator != ''));
        this.getAchievement();
      }
    }
  }

  applyChanges(selectedCheckBox: string) {
    for (let ele of this.KpiData) {
      ele.numerator = '';
      ele.denominator = '';
    }
    for (let ele of this.KpiDataExclusion) {
      ele.numerator = '';
      ele.denominator = '';
    }
    if (selectedCheckBox == 'NA') {
      this.isNoData = false;
      this.remarks = '';
      this.isExNoData = false;
      this.exRemarks = '';
      this.isExclusion = false;
      this.exclusionComment = '';
    }
  }

  applyExChanges(selectedCheckBox: string) {
    for (let ele of this.KpiDataExclusion) {
      ele.numerator = '';
      ele.denominator = '';
    }
    if (selectedCheckBox == 'NA') {
      this.exRemarks = '';
    }
  }

  onClose() {
    this.dialog.close({ data: '' });
  }

  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46) {
      return false;
    }
    return true;
  }

  formatDecimal(value: any) {
    const regex = /^[0-9]{0,8}(\.[0-9]{0,5})?$/;
    if (regex.test(value)) {
      return value;
    }
    else {
      this._util.showWarningPopup("Please enter value in the format 12345678.12345", "Invalid Format");
      return false;
    }
  }

  getAchievement() {
    this.loading = true;
    this.outData = [];
    this.ipData = [];
    
    for (let ele of this.KpiData) {
      ele.isExclusion = false;
      this.ipData.push(ele);
    }
    
    if (this.isExclusion) {
      for (let ele of this.KpiDataExclusion) {
        ele.isExclusion = true;
        this.ipData.push(ele);
      }
    }
    
    this._appservice.getKpiAchievement(this.ipData, this.kpiId).subscribe({
      next: (data: any) => {
        data.iS_EXCLUSION = this.isExclusion;
        data.exclusioN_COMMENT = this.exclusionComment;
        data.iS_EX_NO_DATA = this.isExNoData;
        data.exremarks = this.exRemarks;
        data.kpiData = this.KpiData;
        this.outData = data;
        this.loading = false;
        this.dialog.close({ data: this.outData });
      },
      error: (err: any) => {
        console.error('getAchievement: Error calculating achievement:', err);
        this._util.serviceError(err);
        this.loading = false;
      }
    });
  }

  checkDisable() {
    // Temporary fix - allow editing for all months
    this.isDisabled = false;
    return;
    
    // Original logic (commented for now)
    // this.currentMonth = this._util.MonthCurrAbr();
    // this.prevMonth = this._util.prevMonthAbr();
    // this.currentYear = this._util.Year();
    // this.month = this.data.month;
    // this.year = this.data.year;
    // if (this.prevMonth == this.month || (this.currentMonth == this.month && this.currentYear == this.year)) {
    //   this.isDisabled = false;
    // }
  }

  updateTable() {
    this.dataSource = new MatTableDataSource(this.FinalTabData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ExportTOExcel(kpiDataType: number) {
    this.progress = true;
    this.FinalTabData = [];
    this.displayedColumns = [];
    
    this._appservice.GetExternalKPIDataByBaseMeasure(this.kpiDetailId).subscribe({
      next: (data: any) => {
        this.FinalTabData = data;
        this.progress = false;
        
        if (this.FinalTabData.length > 0) {
          this.progress = true;
          const getdate = new Date();
          const fileName = `Drill down details for_${this.productName}_${this._util.tableYear}_${this._util.tableMonth}`;
          this.displayedColumns = Object.keys(this.FinalTabData[0]);
          this.updateTable();
          
          setTimeout(() => {
            this._util.exportToExcel(this.table.nativeElement, fileName);
            this.progress = false;
          }, 3000);
        }
        else {
          this._util.showWarningPopup("No records!", "No Data");
        }
      },
      error: (error: any) => {
        console.error('ExportTOExcel: Error fetching data:', error);
        this.progress = false;
        this._util.serviceError(error);
      }
    });
  }
}
