import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Services
import { MyUtility } from '../../shared/my-utility';

@Component({
  selector: 'app-monthandyearpicker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatSliderModule,
    MatRadioModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './monthandyearpicker.component.html',
  styleUrls: ['./monthandyearpicker.component.scss']
})
export class MonthandyearpickerComponent implements OnInit {
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() dat?: Date;

  @Output() onChange: EventEmitter<string> = new EventEmitter<string>();

  selectedYear: number = new Date().getFullYear();
  selectedOption: string = 'range'; // "quarter" or "range"
  selectedQuarter: number = 4;
  years: number[] = [];
  QuarterSlideMin = 1;
  QuarterSlideMax = 4;
  StartDate: string = '';
  EndDate: string = '';

  date: FormControl = new FormControl();
  step = 1;

  constructor(private _util: MyUtility) { 
    // Initialize dates after constructor
    const currentYear = this._util.Year();
    this.selectedYear = currentYear;
    this.StartDate = '1-Jan-' + currentYear.toString();
    this.EndDate = '31-Mar-' + currentYear.toString();
  }

  ngOnInit(): void {
    this.years = this._util.Years(3);
    this.emitChanges();
  }

  DateChange(): void {
    if (this.selectedOption === 'quarter') {
      if (this.selectedQuarter === 1) {
        this.StartDate = '1-Jan-' + this.selectedYear.toString();
        this.EndDate = '31-Mar-' + this.selectedYear.toString();
      } else if (this.selectedQuarter === 2) {
        this.StartDate = '1-Apr-' + this.selectedYear.toString();
        this.EndDate = '30-Jun-' + this.selectedYear.toString();
      } else if (this.selectedQuarter === 3) {
        this.StartDate = '1-Jul-' + this.selectedYear.toString();
        this.EndDate = '30-Sep-' + this.selectedYear.toString();
      } else if (this.selectedQuarter === 4) {
        this.StartDate = '1-Oct-' + this.selectedYear.toString();
        this.EndDate = '31-Dec-' + this.selectedYear.toString();
      }
    } else {
      // Year to Quarter mode
      this.StartDate = '1-Jan-' + this.selectedYear.toString();
      if (this.selectedQuarter === 1) {
        this.EndDate = '31-Mar-' + this.selectedYear.toString();
      } else if (this.selectedQuarter === 2) {
        this.EndDate = '30-Jun-' + this.selectedYear.toString();
      } else if (this.selectedQuarter === 3) {
        this.EndDate = '30-Sep-' + this.selectedYear.toString();
      } else if (this.selectedQuarter === 4) {
        this.EndDate = '31-Dec-' + this.selectedYear.toString();
      }
    }
    this.emitChanges();
  }

  formatLabel(value: number | null): string {
    if (value == 0) {
      return 'Q1';
    } else if (value == 5) {
      return 'Q2';
    } else if (value == 10) {
      return 'Q3';
    } else if (value == 15) {
      return 'Q4';
    }
    return value?.toString() || '';
  }

  onInputChange(event: any): void {
    // Handle slider input change
    // Can be used for real-time updates if needed
  }

  emitChanges(): void {
    const sJSON = '{' +
      '"Option":"' + this.selectedOption +
      '","Year":"' + this.selectedYear.toString() +
      '", "StartDate":"' + this.StartDate +
      '","EndDate": "' + this.EndDate + '"}';
    this.onChange.emit(sJSON);
  }
}
