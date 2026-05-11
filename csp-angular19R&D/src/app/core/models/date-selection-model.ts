import { MyUtility } from "../../shared/my-utility";

export class DateSelectionModel {
  checkedValue: string = 'currentMonth';
  selectedStartMonth: string;
  selectedStartYear: number;
  selectedEndMonth: string;
  selectedEndYear: number;
  startDate: Date;
  endDate: Date;
  period: string;
  
  constructor(private _util: MyUtility) {
    this.selectedStartMonth = this._util.Month();
    this.selectedStartYear = this._util.Year();
    this.selectedEndMonth = this._util.Month();
    this.selectedEndYear = this._util.Year();
    this.period = this._util.Month() + " " + this._util.Year().toString();
    this.startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    this.endDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 1, 0);
  }
}
