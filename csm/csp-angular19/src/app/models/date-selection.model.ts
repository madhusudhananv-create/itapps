import { MyUtility } from "../shared/my-utility";

/**
 * Date Selection Model
 * Used for managing date range selection in various components
 * Migrated from legacy DateSelection-model.ts
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
