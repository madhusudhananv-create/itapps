import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { AppsService } from '../../../../Services/apps.service';
import { myUtility } from '../../../../Shared/myUtility';
import { AccessControl } from '../../../../Shared/accessControl';

@Component({
  selector: 'app-kpi-product-detail-view',
  templateUrl: './kpi-product-detail-view.component.html',
  styleUrls: ['./kpi-product-detail-view.component.scss']
})
export class KpiProductDetailViewComponent implements OnInit {
  ipData: any;
  exclusionComment: any;
  currentMonth: string;
  prevMonth: string;
  currentYear: number;
  FinalTabData: any[];
  displayedColumns: any[];
  dataSource: any;
  paginator: any;
  sort: any;
  custId: any;
  baseMeasureValId: any;
  productName: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<KpiProductDetailViewComponent>, public _access: AccessControl, public _util: myUtility,
    private _appservice: AppsService) { }
  KpiData: any[];
  actualAchieved: string;
  outData: any[];
  kpiId: number;
  loading: Boolean = false;
  remarks: string;
  exRemarks: string;
  isNA: boolean = false;
  isNoData: boolean = false;
  isExNoData: boolean = false;
  isDraft: boolean = true;
  isExclusion: boolean = false;
  KpiDataExclusion: any[];
  isDisabled: boolean = true;
  month: string;
  kpiDetailId: number;
  year: number;
  progress: boolean = false;
  @ViewChild('TABLE') table: ElementRef;
  isKPIProcessEnabledCustomer: boolean = false;
  enableExclusion: boolean = false;

  ngOnInit() {
    this.checkDisable();
    if (this.data != null) {
      this.kpiId = this.data.kpiId;
      this.enableExclusion = this.data.enableExclusion;
      if (this.data.baseMeasureData != null) {
        this.KpiData = this.data.baseMeasureData;
        this.baseMeasureValId = this.data.baseMeasureData[0].baseMeasureValueId;
      }
      else this.KpiData = [];
      if (this.data.isExclusion != null)
        this.isExclusion = this.data.isExclusion;
      if (this.data.exclusionComment != null)
        this.exclusionComment = this.data.exclusionComment;
      if (this.data.detailId != null)
        this.kpiDetailId = this.data.detailId;
      if (this.data.productName != null)
        this.productName = this.data.productName;
      if (this.data.custId != null)
        this.custId = this.data.custId;
      else
        this.custId = this._util.AppSettings.customerid;
      this.isKPIProcessEnabledCustomer = this._util.IsKPIProcessEnabledCustomer(this.custId);
      if (this.data.exclusionbaseMeasureData != null) {
        this.KpiDataExclusion = this.data.exclusionbaseMeasureData;
      }
      else { this.KpiDataExclusion = this.data.baseMeasureData; this.isExclusion = false; }
      this.remarks = this.data.remarks;
      this.isNA = this.data.isNA;
      this.isDraft = this.data.isDraft;
      this.isNoData = this.data.isNoData;
      this.exRemarks = this.data.exRemarks;
      this.isExNoData = this.data.isExNoData;
    }
  }

  SaveBaseMeasures() {
    let numerator = this.KpiData.map(x => x.numerator);
    let denominator = this.KpiData.map(x => x.denominator);
    let denominatorDesc = this.KpiData.map(x => x.denominatorDescription);
    if (numerator.length == 1) {
      if (!this.isNA && (numerator[0] == null || numerator[0] == '')) {

      }
      if (!this.isNA && ((denominator[0] == null && denominatorDesc[0] != 'NA') || (denominator[0] == '' && denominatorDesc[0] != 'NA'))) {
        alert('Please fill the Base Measure Values.')
        return;
      }
      if ((!this.isNA) && denominator[0] == '0' && denominatorDesc[0] != 'NA') {
        alert('Denominator cannot be Zero. Please enter valid value');
        return;
      }
      if ((this.isNA) && (this.remarks == '' || this.remarks == null)) {
        alert('Please fill Reason for the month.');
        return;
      }
      if ((this.isNA) && this.remarks != null && this.remarks.trim().length < 10) {
        alert('Please enter atleast 10 Characters for Reason.');
        return;
      }
      if (this.isExclusion) {
        numerator = this.KpiDataExclusion.map(x => x.numerator);
        denominator = this.KpiDataExclusion.map(x => x.denominator);
        denominatorDesc = this.KpiDataExclusion.map(x => x.denominatorDescription);
        if (numerator.length == 1) {
          if (!this.isNA && !this.isExNoData) {
            // alert('Please fill the Base Measure Values for Exclusion.');
            // return;
          }
          if (this.exclusionComment == '' || this.exclusionComment == null || this.exclusionComment == undefined) {
            alert('Please fill justification for Exclusion.');
            return;
          }
          if (!this.isNA && !this.isExNoData && ((denominator[0] == null && denominatorDesc[0] != 'NA') || (denominator[0] == '' && denominatorDesc[0] != 'NA'))) {
            alert('Please fill the Base Measure Values for Exclusion.');
            return;
          }
          if ((!this.isNA || !this.isExNoData) && denominator[0] == '0' && denominatorDesc[0] != 'NA') {
            alert('Denominator for Exclusion cannot be Zero. Please enter valid value.');
            return;
          }
          if (this.isExNoData && (this.exRemarks == '' || this.exRemarks == null)) {
            alert('Please fill Reason for the month for Exclusion.');
            return;
          }
          if ((this.isExNoData) && this.exRemarks != null && this.exRemarks.trim().length < 10) {
            alert('Please enter atleast 10 Characters for Reason(Exclusion).');
            return;
          }
        }
      }
      if (this.isNA && (this.remarks != '' || this.remarks != null)) {
        this.outData = [];
        this.outData.push(this.isNA);
        this.outData.push(this.remarks);
        this.outData.push("NA");
        this.outData.push(this.isNoData);
        this.outData.push(false);
        this.outData.push(this.isExNoData);
        this.outData.push(this.exRemarks);
        this.outData.push(this.KpiData);
        this.dialog.close({ data: this.outData });
      }
      else
        this.getAchievement();
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
          alert('Please fill Reason for the month.');
          return;
        }
        else if ((this.isNA) && this.remarks.trim().length < 10) {
          alert('Please enter atleast 10 Characters for Reason.');
          return;
        }
        else if (this.isNA && (this.remarks != '' || this.remarks != null)) {
          this.outData = [];
          this.outData.push(this.isNA);
          this.outData.push(this.remarks);
          this.outData.push("NA");
          this.outData.push(this.isNoData);
          this.outData.push(this.isExNoData);
          this.outData.push(this.exRemarks);
          this.outData.push(this.KpiData);
          this.dialog.close({ data: this.outData });
          return;
        }
        else {
          flag.push(1);
        }
      }
      var x = flag.indexOf(1) > -1 ? true : false;
      var y = flag.indexOf(2) > -1 ? true : false;
      if (denomtotal == 0 && !this.isNA) {
        alert("Please fill Base Measure values with denominator values to proceed further.");
        return;
      }
      else {
        this.KpiData = this.KpiData.filter(x => (x.numerator != null && x.denominator != null) && (x.denominator != ''));
        this.getAchievement();
      }
    }
  }

  applyChanges(selectedCheckBox) {
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

  applyExChanges(selectedCheckBox) {
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

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    //alert(charCode);
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
      alert("Please enter value in the format 12345678.12345");
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
    this._appservice.getKpiAchievement(this.ipData, this.kpiId).subscribe(
      data => {
        data.iS_EXCLUSION = this.isExclusion;
        data.exclusioN_COMMENT = this.exclusionComment;
        data.iS_EX_NO_DATA = this.isExNoData;
        data.exremarks = this.exRemarks;
        data.kpiData = this.KpiData;
        this.outData = data;
        this.loading = false;
      }, (err) => { this._util.serviceError(err) },
      () => { this.dialog.close({ data: this.outData }); }
    )

  }
  checkDisable() {
    this.isDisabled = false; // This 2 lines were added for temp fix for monthly entry
    return;
    this.currentMonth = this._util.MonthCurrAbr();
    this.prevMonth = this._util.prevMonthAbr();
    this.currentYear = this._util.Year();
    this.month = this.data.month;
    this.year = this.data.year;
    if (this.prevMonth == this.month || (this.currentMonth == this.month && this.currentYear == this.year)) {
      this.isDisabled = false;
    }
  }
  updateTable() {
    this.dataSource = new MatTableDataSource(this.FinalTabData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ExportTOExcel(kpiDataType) {
    this.progress = true;
    this.FinalTabData = [];
    this.displayedColumns = [];
    this._appservice.GetExternalKPIDataByBaseMeasure(this.kpiDetailId).subscribe(data => {
      this.FinalTabData = data;
      this.progress = false;
      // if (this.table.nativeElement.textContent != "") {
      let getdate = new Date();
      let fileName = `Drill down details for_${this.productName}_${this._util.tableYear}_${this._util.tableMonth}`;
      if (this.FinalTabData.length > 0) {
        this.progress = true;
        this.displayedColumns = Object.keys(this.FinalTabData[0]);
        this.updateTable();
        setTimeout(() => {
          this._util.exportToExcel(this.table.nativeElement, fileName);
          this.progress = false;
        }, 3000);
      }
      else {
        alert("No records!");
      }
    },
      error => {
        this.progress = false;
        this._util.serviceError(error);
      });
  }


}

