import { UtilityService } from "../core/services/utility.service";

/**
 * Date Selection Model
 * Used for date range filtering across assessment and other pages
 */
export class DateSelectionModel {
  checkedValue: string = 'currentMonth';
  selectedStartMonth: string;
  selectedStartYear: number;
  selectedEndMonth: string;
  selectedEndYear: number;
  startDate: Date;
  endDate: Date;
  period: string;
  months: string[] = [];
  years: number[] = [];

  constructor(private _util: UtilityService) {
    // Initialize to current month
    this.selectedStartMonth = this._util.Month();
    this.selectedStartYear = this._util.Year();
    this.selectedEndMonth = this._util.Month();
    this.selectedEndYear = this._util.Year();
    
    // Set start date to first day of current month
    this.startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    // Set end date to last day of current month
    this.endDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 1, 0);
    
    // Set period string
    this.period = this._util.Month() + " " + this._util.Year().toString();
    
    // Initialize months array
    this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize years array (current year and 5 years back)
    this.years = this._util.Years(5);
  }
}
