import { Injectable } from '@angular/core';
import { MatStepper } from '@angular/material';
import { ChecklistModel } from './../../models/checklist-model';

@Injectable({
  providedIn: 'root'
})
export class ProcessModelService {

    stepper: MatStepper;
    checklists : ChecklistModel[] = [];

  constructor() { }
}
