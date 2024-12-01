import { myUtility } from "../Shared/myUtility";

export class DateSelectionModel {
    checkedValue: string = 'currentMonth';
    selectedStartMonth: string = this._util.Month();
    selectedStartYear: number = this._util.Year();
    selectedEndMonth: string = this._util.Month();
    selectedEndYear: number = this._util.Year();
    startDate: Date;
    endDate: Date ;
    period: string = this._util.Month() + " " + this._util.Year().toString();
    constructor(private _util: myUtility) { 
      this.startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      this.endDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth()+1, 0);
    }
  }