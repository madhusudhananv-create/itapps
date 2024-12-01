import { Injectable } from '@angular/core';
import { KpiGoalModel } from '../../models/kpi-goal-model';

@Injectable({
  providedIn: 'root'
})
export class KpiSharedService {
  goals: KpiGoalModel[] = [];
  goal: KpiGoalModel = new KpiGoalModel();
  selectedGoal: KpiGoalModel = new KpiGoalModel();

  constructor() { }


}
