import { Component, EventEmitter, Output, Input, OnInit, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import { myUtility } from '../../Shared/myUtility';
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
const moment = _moment;
@Component({
  selector: 'app-monthandyearpicker',
  templateUrl: './monthandyearpicker.component.html',
  styleUrls: ['./monthandyearpicker.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class MonthandyearpickerComponent implements OnInit {
  @Input('min') minDate: Date;
  @Input('max') maxDate: Date;
  @Input('date') dat: Date;

  selectedYear: number = this._util.Year();
  selectedOption: string = "range"; //"quarter";
  selectedQuarter: number = 4;
  years: number[] = []
  QuarterSlideMin = 1
  QuarterSlideMax = 4
  StartDate: string = "1-Jan-" + this._util.Year().toString();
  EndDate: string = "31-Mar-" + this._util.Year().toString();

  date: FormControl

  //Mat-slider
  // autoTicks = false;
  // disabled = false;
  // invert = false;
  // max = 15;
  // min = 0;
  // showTicks = false;
  step = 1;
  // value = 0;
  // vertical = false;

  constructor(private _util: myUtility) {

  }
  ngOnInit() {
    this.years = this._util.Years(3);
    this.emitChanges();
    //this.date = new FormControl(moment(this.dat));
  }
  DateChange() {
    if (this.selectedOption === "quarter") {
      if (this.selectedQuarter === 1) {
        this.StartDate = "1-Jan-" + this.selectedYear.toString();
        this.EndDate = "31-Mar-" + this.selectedYear.toString();
      }
      else if (this.selectedQuarter === 2) {
        this.StartDate = "1-Apr-" + this.selectedYear.toString();
        this.EndDate = "30-Jun-" + this.selectedYear.toString();
      }
      else if (this.selectedQuarter === 3) {
        this.StartDate = "1-Jul-" + this.selectedYear.toString();
        this.EndDate = "30-Sep-" + this.selectedYear.toString();
      }
      else if (this.selectedQuarter === 4) {
        this.StartDate = "1-Oct-" + this.selectedYear.toString();
        this.EndDate = "31-Dec-" + this.selectedYear.toString();
      }
    }
    else {
      this.StartDate = "1-Jan-" + this.selectedYear.toString();
      if (this.selectedQuarter === 1) {
        this.EndDate = "31-Mar-" + this.selectedYear.toString();
      }
      else if (this.selectedQuarter === 2) {
        this.EndDate = "30-Jun-" + this.selectedYear.toString();
      }
      else if (this.selectedQuarter === 3) {
        this.EndDate = "30-Sep-" + this.selectedYear.toString();
      }
      else if (this.selectedQuarter === 4) {
        this.EndDate = "31-Dec-" + this.selectedYear.toString();
      }
    }
    this.emitChanges();
  }
  formatLabel(value: number | null) {
    if (value == 0)
      return 'Q1';
    else if (value == 5)
      return 'Q2';
    else if (value == 10) {
      return 'Q3';
    }
    else if (value == 15)
      return 'Q4'
    return value;
  }
  onInputChange(event) {
    // this.value = event.value;
    // this.getTrendData()
    // this.getNPSTrendData()
    // this.getSurveyData();
  }
  emitChanges() {
    let sJSON = '{' +
      '"Option":"' + this.selectedOption + 
      '","Year":"' + this.selectedYear.toString() + 
      '", "StartDate":"' + this.StartDate + 
      '","EndDate": "' + this.EndDate + '"}'
    this.onChange.emit(sJSON);
  }
  // '", "StartDate":"' + this.StartDate.toDateString() + 
  //'","EndDate": "' + this.EndDate.toDateString() + '"}'

  @Output() onChange: EventEmitter<string> = new EventEmitter<string>();
  // chosenYearHandler(normalizedYear: Moment) {
  //   const ctrlValue = this.date.value;
  //   ctrlValue.year(normalizedYear.year());
  //   this.date.setValue(ctrlValue);
  // }

  // chosenMonthHandler(normlizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
  //   const ctrlValue = this.date.value
  //   ctrlValue.month(normlizedMonth.month());
  //   this.date.setValue(ctrlValue);
  //   datepicker.close();
  //   this.emitChanges();
  // }
  // emitChanges() {
  //   this.onChange.emit(this.date.value._d);
  //   //this.onChange.emit('{"customer": ' + this.custId + ', "project": "' + this.projId + '"}');
  // }
}
