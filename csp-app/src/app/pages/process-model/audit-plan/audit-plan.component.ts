import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { EmpInfoModel } from '../../../models/emp-info-model';
import { ServiceAreaProjectMappingModel } from '../../../models/service-area-project-mapping-model';
import { ServiceAreaModelNew } from '../../../models/audit-checklist-based-model';
import { AuditScheduleModel } from '../../../models/audit-schedule-model';
import { FormGroup } from '@angular/forms';
import { ProcessModelService } from '../process-model.service';
import { MatStepper } from '@angular/material';

@Component({
  selector: 'app-audit-plan',
  templateUrl: './audit-plan.component.html',
  styleUrls: ['./audit-plan.component.scss'],
   
})
export class AuditPlanComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  allCust: boolean = false;
  allProj: boolean = false;

  @ViewChild('stepper') stepper: MatStepper;

  constructor(private _appService: AppsService, private _util: myUtility, private _processService: ProcessModelService) { }

  ngOnInit() {
    this._processService.stepper = this.stepper;
    // this._appService.GetDBConfigValue("ADDTASK_AllCustomers", -1, "").subscribe(data => {
    //   if (data.indexOf(localStorage.getItem('empid')) >= 0)
    //     this.allCust = true;
    //     this.allProj = true;
        
    // });
     
  }
}
