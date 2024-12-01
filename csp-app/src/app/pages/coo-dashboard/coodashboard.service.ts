import { Injectable } from '@angular/core';
import { myUtility } from '../../Shared/myUtility';

@Injectable({
  providedIn: 'root'
})
export class COODashboardService {

  constructor(public _util: myUtility) { }
  public CSG_FilterMonth: string = this._util.Month();
  public CSG_FilterYear: Number = this._util.Year();
}
