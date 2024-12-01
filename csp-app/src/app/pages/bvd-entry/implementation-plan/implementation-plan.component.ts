import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { BvdEntryService } from '../services/bvd-entry.service';
import { IdeaStatus } from '../../../models/bvd-entry/idea-model';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { ImplementationPlan } from '../../../models/bvd-entry/idea-implementation-plan-model';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-implementation-plan',
  templateUrl: './implementation-plan.component.html',
  styleUrls: ['./implementation-plan.component.scss', '../bvd-entry-shared-css.scss']
})
export class ImplementationPlanComponent implements OnInit {

  status = [];
  @Input('projectId') projectId: string = '';
  //resources: any[] = [];
  implementationPlan = new ImplementationPlan();
  isSubmitted: boolean = false;
  estStartDate: Date;
  estEndDate: Date;
  actStartDate: Date;
  actEndDate: Date;
  stages = [];
  implementationSchdules: ImplementationPlan[] = [];
  dataSource = new MatTableDataSource(this.implementationSchdules);
  @Output() setStep: EventEmitter<number> = new EventEmitter<number>();
  displayedColumns: string[] = ['milestonetask', 'description', 'efforts', 'responsible', 'comments', 'estimatedDates', 'actions'];
  @ViewChild('impForm') impForm: NgForm
  _edit: boolean = false;
  constructor(public _bvdService: BvdEntryService, private _appService: AppsService, private _util: myUtility) {
    //this.projectId = this._bvdService.projecT_ID;
  }

  ngOnInit() {
    if (this._bvdService.bvdimplementationschdules && this._bvdService.bvdimplementationschdules.length > 0) {
      this.fillDetails();
    }
  }

  ngOnChanges() {
    this.getProjectResource();
  }

  async fillDetails() {
    try {
      this._bvdService.resources = await this._appService.getProjectResourceByProjId(this.projectId).toPromise();
      this.implementationSchdules = this._bvdService.bvdimplementationschdules;
      this.refreshTable(this.implementationSchdules);
    } catch (error) {
      alert('There is an error in getting data from server');
      return;
    }
  }

  refreshTable(source) {
    this.dataSource = new MatTableDataSource(source);
  }

  getProjectResource() {
    if (!this.projectId || this.projectId == '')
      return;

    this._appService.getProjectResourceByProjId(this._bvdService.projecT_ID).subscribe(data => {
      this._bvdService.resources = data;
      console.log("resources", this._bvdService.resources)
    }, (err) => { this._util.serviceError(err) })
  }


  submitForm(status) {
    if (!this.implementationSchdules || this.implementationSchdules.length == 0) {
      alert('There are no milestones entered. Please enter one')
      return;
    }

    for (let schdule of this.implementationSchdules) {
      if (!schdule.milestone || schdule.milestone.trim().length == 0 || !schdule.estimateD_EFFORTS || !schdule.estimateD_EFFORTS ||
        !schdule.responsible || !schdule.estimateD_START_DATE || !schdule.estimateD_TARGET_DATE) {
        alert("Please enter valid values for mandatory fields of all the schdules and save");
        return;
      }
    }

    if (confirm('On clicking this, Idea will be submitted. You will not be able to edit after. Do you want to submit and send for approval?'))
      this.submitIdea();
  }

  submitIdea() {
    this._bvdService.submitIdea(this._bvdService.ideA_ID).subscribe(data => {
      alert("Idea submitted successfully");
      this._bvdService.isIdeaSubmitted = true;
      this._bvdService.bvdidea.ideA_STATUS_ID = 2;
      this._bvdService.currentStep = this._bvdService.currentStep + 1;
    })
  }

  ngOnDestroy() {
    console.log("idea-imp destroyed")
  }

  updateSchdule()
  {
    this.saveSchdule();
    this._edit = false;
  }

  cancelUpdate() {
    //this.refreshTable(this.implementationSchdules);
    //this.implementationSchdules = [];
    this._edit = false;
    this.implementationPlan = new ImplementationPlan();
    this.estStartDate= null;
    this.estEndDate = null;
    
  }
  saveSchdule() {
    if (!this.implementationPlan.milestone || this.implementationPlan.milestone.trim().length == 0) {
      alert("Please enter the milestone");
      return;
    }

    this.implementationPlan.issubmitted = false;
    this.implementationPlan.ideA_ID = this._bvdService.ideA_ID;
    this.implementationPlan.estimateD_START_DATE = this.estStartDate != null ? new Date(this.estStartDate).toDateString() : null;
    this.implementationPlan.estimateD_TARGET_DATE = this.estEndDate != null ? new Date(this.estEndDate).toDateString() : null;
    this.isSubmitted = true;

    this._bvdService.saveIdeaImplementationDetails(this.implementationPlan).subscribe(data => {
      alert('Implementation Plan Saved successfully');
      this.isSubmitted = false;
      let index = this.implementationSchdules.findIndex(x => x.id == data.id);
      if (index > -1)
        this.implementationSchdules[index] = data;
      else
        this.implementationSchdules.push(data);

      console.log("schduled", this.implementationSchdules);
      this.refreshTable(this.implementationSchdules);

      this.implementationPlan = new ImplementationPlan();
      this.estEndDate = null;
      this.estStartDate = null;
      this._bvdService.bvdimplementationschdules = this.implementationSchdules;
    }, (err) => { this._util.serviceError(err); this.isSubmitted = false; })
  }

  setBack() {
    this.setStep.emit(1);
  }

  setNext() {
    this.getIdeaStages();
  }


  getIdeaStages() {
    this._bvdService.getIdeaStages(this._bvdService.ideA_ID).subscribe(data => {
      this._bvdService.bvdstages = data;
      console.log("stages", this._bvdService.bvdstages);
      this.setStep.emit(3)
    }, (err) => { this._util.serviceError(err); })
  }

  editRow(impRec: ImplementationPlan) {
    console.log("impl rec", impRec);
    this._edit = true;
    this.implementationPlan = impRec;
    this.estStartDate = impRec.estimateD_START_DATE != null ? new Date(impRec.estimateD_START_DATE) : null;
    this.estEndDate = impRec.estimateD_TARGET_DATE != null ? new Date(impRec.estimateD_TARGET_DATE) : null;
  }

  deleteRow(impRec: ImplementationPlan) {
    this.isSubmitted = true;
    if (confirm('Are you sure you want to delete?')) {
      this._bvdService.deleteImplementationSchdule(impRec.id).subscribe(data => {
        alert('Task deleted successfully');
        this.isSubmitted = false;
        this.implementationSchdules = this.implementationSchdules.filter(x => x.id != impRec.id);
        console.log("imp sch", this.implementationSchdules)
        this.refreshTable(this.implementationSchdules);

      }, (err) => { this._util.serviceError(err); this.isSubmitted = false; })
    }
  }
}
