import { Injectable } from '@angular/core';

export class KpiGoalModel {
  id: number = 0;
  description: string = '';
  starT_DATE: Date = new Date();
  enD_DATE: Date = new Date();
  displaY_ORDER: number = 1;
  isinternal: boolean = false;
  customeR_ID: string = '';
  projecT_ID: string = '';
  createD_BY: string = '';
  createD_DATE: Date = new Date();
  updateD_BY: string = '';
  updateD_DATE: Date = new Date();
  isactive: boolean = true;
  isExpired: boolean = false;
}

/**
 * KpiSharedService
 *
 * ROOT CAUSE NOTE:
 * Angular template-driven forms (ngModel) bind to an object reference
 * at the time the template renders. If you replace that reference
 * (this._kpiService.goal = someNewObject), ngModel keeps pointing at
 * the OLD object — reads/writes go to the stale reference, the form
 * controls show wrong values, and form.valid stays false.
 *
 * FIX: The `goal` property is protected via a getter/setter that uses
 * Object.assign to MUTATE the existing object instead of replacing it.
 * ngModel's binding stays valid because the reference never changes.
 */
@Injectable({
  providedIn: 'root'
})
export class KpiSharedService {
  goals: any[] = [];
  selectedGoal: any = {};

  // The single stable reference that ngModel binds to — NEVER replaced
  private _goal: KpiGoalModel = new KpiGoalModel();

  get goal(): KpiGoalModel {
    return this._goal;
  }

  // Assigning a new object mutates _goal in-place so ngModel binding holds
  set goal(val: KpiGoalModel) {
    Object.assign(this._goal, val);
  }

  constructor() {}
}