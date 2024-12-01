import { Injectable } from '@angular/core';
import { myUtility } from '../../Shared/myUtility';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(public _util: myUtility) { }

  //Customer Dashboard > Customer Success Goal > Filter Default Dates  customeR_ID
  public csG_FILTER_MONTH: string = this._util.Month();
  public csG_FILTER_YEAR: Number = this._util.Year();

  public filteR_MONTH: string = this._util.Month();
  public filteR_YEAR: Number = this._util.Year();

  public lasT_FILTERED_MONTH: string = "";
  public lasT_FILTERED_YEAR: Number = 0;

}
