import { Component, OnInit, Output, ViewChild, ViewChildren, EventEmitter } from '@angular/core';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { ProcessModelNew, ProcessAreaModelNew, ServiceAreaModelNew } from '../../../models/audit-checklist-based-model';
import { Idea, IdeaStatus, IdeaImprovementType, PotentialSolutionCategory } from '../../../models/bvd-entry/idea-model';
import { NgForm, FormControl } from '@angular/forms';
import { ProjectResourceByEmpIdModel } from '../../../models/emp-info-model';
import { BvdEntryService } from '../services/bvd-entry.service';
import { ActivatedRoute, Router } from '@angular/router';



@Component({
  selector: 'app-idea-entry',
  templateUrl: './idea-entry.component.html',
  styleUrls: ['./idea-entry.component.scss', '../bvd-entry-shared-css.scss']
})
export class IdeaEntryComponent implements OnInit {
  similarIdeas: Idea[] = [];
  isSubmitted: boolean = false;
  employees: ProjectResourceByEmpIdModel[] = [];
  empId: string;
  projects: any[] = [];
  customerList: any[] = [];
  categories: PotentialSolutionCategory[] = [];
  improvementS_TYPE: IdeaImprovementType[] = [];
  status = []
  processList: ProcessModelNew[] = [];
  processAreaList: ProcessAreaModelNew[] = [];
  serviceAreaList: any[] = [];
  selectedCust: string;
  customerId: string;
  identifieD_DATE: Date;
  @ViewChild('ideaForm') ideaForm: NgForm;
  sub: any;
  reset: boolean;
  @Output() setStep: EventEmitter<number> = new EventEmitter<number>();
  idea = new Idea();
  comments: string;
  projId: string;
  portfolioList: any[];
  projectList: any[] = [];
  selectedPortfolio: number;
  ideaIdentified: any = [];

  @ViewChild('appEmployeeSearch') appEmployeeSearch: any;

  constructor(private _appService: AppsService, public _util: myUtility, public _bvdEntry: BvdEntryService,
    private route: ActivatedRoute, private _router: Router) {

  }
  ngOnInit() {

    this.sub = this.route.params.subscribe(params => {
      this.customerId = params['customerid'];

    });

    this.sub = this.route.params.subscribe(params => {
      this.reset = params['reset'];
    });

    this.empId = localStorage.getItem('empid');
    this.getCustomerList();
    this.getIdeaStatus();
    this.getIdeaImprovementAndCategoryList();
    this.getPortfolio();
    if (this._bvdEntry.bvdidea && this._bvdEntry.bvdidea != null && this._bvdEntry.bvdidea.id > 0) {
      this.fillData(this._bvdEntry.bvdidea)
      this.idea = this._bvdEntry.bvdidea;
      this.ideaIdentified = this.idea.identifieD_BY;
      if (this.idea.description && this.idea.description.trim().length > 0)
        this.Service_getSimilarIdeas(this.idea);

      this.identifieD_DATE = this.idea.identifieD_DATE != null ? new Date(this.idea.identifieD_DATE) : null;
      this._bvdEntry.ideA_ID = this.idea.id;

      this._bvdEntry.projecT_ID = this.idea.projecT_ID;
      this.selectedPortfolio = this.idea.portfoliO_ID;
    }
  }

  getIdeaStatus() {
    this._bvdEntry.getIdeaStatus().subscribe(data => {
      this.status = data;
      if (!this.idea.ideA_STATUS_ID || this.idea.ideA_STATUS_ID == 0)
        this.idea.ideA_STATUS_ID = 1;
    }, (err) => { this._util.serviceError(err) })
  }

  getSimilarIdeas() {
    if (this.idea.description.trim().length > 0)
      setTimeout(() => {
        this.Service_getSimilarIdeas(this.idea)
      }, 500);
  }

  async fillData(idea: Idea) {
    try {
      this.selectedCust = idea.cusT_ID;
      this.selectedPortfolio = idea.portfoliO_ID;
      this.projects = await this._appService.getAllProjectsForCustomer(this.selectedCust).toPromise();
      if (this._util.IsPremier(this.selectedCust) && this.selectedPortfolio != null) {
        this.projectList = await this._bvdEntry.getprojectsNameForAPortfolioNew(this.selectedPortfolio).toPromise();
      }
      else if (this._util.IsPremier(this.selectedCust) && this.selectedPortfolio == null) {
        alert("The Project " + this.projects.filter(x => x.proJ_ID == idea.projecT_ID)[0].proJ_NM + " is not mapped to any Portfolio as of now. Please map this project to respective Portfolio to continue further.")
      }
      this.employees = await this._appService.getProjectResourceByProjId(idea.projecT_ID).toPromise();

    } catch (error) {
      console.log('error obj', error)
      alert('There is an error in getting data from Server.')
      return;
    }
  }

  getPortfolio() {
    this._appService.GetPortfolioList().subscribe(data => {
      this.portfolioList = data;
    }, error => { this._util.serviceError(error); },
    )
  }

  portfolio_OnChange() {
    this._bvdEntry.getprojectsNameForAPortfolioNew(this.selectedPortfolio).subscribe(data => {
      this.projectList = data;
    }, error => { this._util.serviceError(error); },)
  }

  getCustomerList() {
    if (!this.empId)
      return;

    this._appService.GetCustomerList(this.empId, false).subscribe(data => {
      this.customerList = data.filter(x => x.cusT_ID == this.customerId);

      if (this.customerList.length > 0) {
        this.selectedCust = this.customerList.filter(x => x.cusT_ID == this.customerId)[0].cusT_ID;
        this.getProjects();
      }
    }, (err) => { this._util.serviceError(err) })
  }

  getProjects() {
    if (this.selectedCust == null || this.selectedCust == undefined)
      return;

    this._appService.getAllProjectsForCustomer(this.selectedCust).subscribe(data => {
      this.projects = data;
    }, (err) => { this._util.serviceError(err) })
  }

  Service_GetServiceAreaProjectMapping(projId) {
    if (!projId || projId == null || projId == undefined)
      return;

    this._appService.getServiceAreasForProject(projId).subscribe(data => {
      this.serviceAreaList = data;
    }, error => { this._util.serviceError(error); });
  }

  getRequiredData(projId) {
    if (projId != undefined || projId != "") {
      this.getEmpIds(projId);
      this.Service_GetServiceAreaProjectMapping(projId);
    }
  }

  getIdeaImprovementAndCategoryList() {
    this._bvdEntry.getIdeaImprovementAndCategoryList().subscribe(data => {
      this.improvementS_TYPE = data.improvements;
      this.categories = data.categories;
    }, (err) => { this._util.serviceError(err) })
  }

  getProcessAreas(serviceAreaId) {
    if (serviceAreaId == null || serviceAreaId == undefined)
      return;

    this._appService.GetProcessAreaByServiceAreaIdNew(serviceAreaId).subscribe(
      (data) => {
        this.processAreaList = data;
      },
      (error) => { this._util.serviceError(error) }
    )
  }

  getProcesses(processAreaId) {
    if (processAreaId == null || processAreaId == undefined)
      return;

    this._appService.GetProcessByProcessArea(processAreaId).subscribe(data => {
      this.processList = data;
    }, error => { this._util.serviceError(error); });
  }

  getEmpIds(projid) {
    if (projid == null || projid == undefined)
      return;

    this._appService.getProjectResourceByProjId(projid).subscribe(data => {
      this.employees = data;
    }, error => { this._util.serviceError(error); })
  }

  submitForm() {
    if (this._bvdEntry.isIdeaSubmitted == true) {
      this.setNextStep()
      return;
    }
    if (!this.ideaForm.valid) {
      alert('Please enter values for all the required fields');
      return;
    }
    if (this.idea.description.trim().length < 10) {
      alert('Please enter atleast 10 Characters for Problem Description');
      return;
    }
    if (this.idea.potentiaL_SOLUTION_DESCRIPTION.trim().length < 10) {
      alert('Please enter atleast 10 Characters for Potential Solution Description');
      return;
    }
    if (!this.identifieD_DATE || this.identifieD_DATE == null) {
      alert('Please choose Identified Date');
      return;
    }

    this.saveIdea('Submit');
  }

  Service_getSimilarIdeas(idea: Idea) {
    this._bvdEntry.getSimilarIdeas(idea).subscribe(data => {
      this.similarIdeas = data;
    }, error => { this._util.serviceError(error); this.isSubmitted = false; })
    return this.similarIdeas;
  }

  saveForm() {
    if (!this.idea.projecT_ID || this.idea.projecT_ID == null) {
      alert('Please choose customer and project');
      return;
    }
    if (!this.idea.description || this.idea.description == null || this.idea.description.trim().length == 0) {
      alert('Please enter idea description');
      return;
    }
    if (!this.idea.potentiaL_SOLUTION_DESCRIPTION || this.idea.potentiaL_SOLUTION_DESCRIPTION == null || this.idea.potentiaL_SOLUTION_DESCRIPTION.trim().length == 0) {
      alert('Please enter Potential Solution description');
      return;
    }
    if (!this.identifieD_DATE || this.identifieD_DATE == null) {
      alert('Please choose Identified Date');
      return;
    }

    this.saveIdea('Save');
  }

  saveIdea(status) {
    this.isSubmitted = true
    this.idea.stagE_ID = 1;
    this.idea.ideA_STATUS_ID = 1;
    this.idea.identifieD_BY = this.ideaIdentified;
    this.idea.identifieD_DATE = this.identifieD_DATE != null ? new Date(this.identifieD_DATE).toDateString() : null;
    this.idea.portfoliO_ID = this.selectedPortfolio;
    this._bvdEntry.saveIdeaDetails(this.idea).subscribe(idea => {
      this.isSubmitted = false;
      idea.cusT_ID = this.selectedCust;
      this.idea = idea;
      alert('Data saved successfully');
      this._bvdEntry.bvdidea = idea;
      this.setValues(idea, status);
    }, error => { this._util.serviceError(error); this.isSubmitted = false; })
  }

  updateIdeaComment(Id) {
    this.isSubmitted = true;
    this.comments = this.idea.comments;
    this._bvdEntry.updateIdeaDetails(Id, this.comments).subscribe(idea => {
      this.isSubmitted = false;
      alert('Data Updated Successfully');
    }, error => { this._util.serviceError(error); this.isSubmitted = false; })
  }

  setValues(idea, status) {
    this._bvdEntry.ideA_ID = idea.id;
    this._bvdEntry.projecT_ID = idea.projecT_ID;
    if (status == 'Submit') {
      this.setNextStep();
    }
  }

  setNextStep() {
    this.setStep.emit(1);
  }

  ngOnDestroy() {
    console.log("idea-entry destroyed")
  }

  employeeSearch_onChange($event) {
    this.ideaIdentified = $event;
  }

  btnlistView(customerId) {
    let isFromAddNewIdea = Boolean(window.localStorage.getItem('isFromAddNewIdea'));
    if (isFromAddNewIdea) {
      if (this._util.IsPremier(this.selectedCust)) {
        this._router.navigate(['/serviceleveldashboard/cust', this.selectedCust, true])
      }
      else {
        this._router.navigate(['/newdashboard/cust', this.selectedCust, false])
      }
    }

    else {
      if (this._util.IsPremier(customerId)) {
        this._router.navigate(['/serviceleveldashboard/cust', customerId, true, 'listview'])
      }
      else {
        this._util.previousPage(customerId);
      }
    }
    window.localStorage.setItem('isFromAddNewIdea', '')

  }
}

