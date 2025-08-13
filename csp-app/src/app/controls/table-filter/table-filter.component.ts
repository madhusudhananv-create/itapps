import { Component, Inject, OnInit, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FilterPreferenceModel } from '../../models/filter-preference-model';
import { myUtility } from '../../Shared/myUtility';
import { AppsService } from '../../Services/apps.service';
import { ParameterModel } from '../../models/parameter-model';
import { enumRoles } from '../../Shared/enum'
import { ActivatedRoute } from '@angular/router';
import { BestPracticesModel, GAVSService, BestPracticesModelExt } from '../../models/best-practices-model';
import { BvdDashboardService } from '../../pages/bvd-dashboard/services/bvd-dashboard.service';
import { ProjectResourceByEmpIdModel } from '../../models/emp-info-model';
import { TaskService } from '../../pages/process-model/task/task.service';
import { Subject, Subscription } from 'rxjs';
import { CloseComponentService } from '../../close-component.service';

@Component({
  selector: 'app-table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss']
})
export class TableFilterComponent implements OnInit {
  @Input('data') data: any;
  @Input('tableName') tableName: string;
  @Input('custId') custId: string
  @Input('fieldName') fielD_NAME: string;
  @Input('kpiDetail') kpiData: string;
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() OnAdd: EventEmitter<boolean> = new EventEmitter<boolean>();
  originalData: any[];
  filteredData: any[];
  filterPref: FilterPreferenceModel[] = []
  filterCriterias: FilterPreferenceModel[] = [];
  selectedFilterPref: FilterPreferenceModel = new FilterPreferenceModel('', '', true, 'string', []);
  private sub: any;
  AllBestPractices: any;

  ddServiceArea: any;
  ddProcessArea: any;
  ddreportedByList: any;
  ddreviewedByList: any;
  ddapprovedByList: any;
  ddProcess: any;

  ddEmployeeList: any;
  employeeList: ProjectResourceByEmpIdModel[] = [];
  projects: any[] = [];
  selectedCust: string;
  allcust: boolean = false;
  allproj: boolean = false;
  selectedProject: string = "All Projects";
  selectedPortfolio: string = "All Portfolios";
  serviceAreaList: ParameterModel[];
  proessAreaList: ParameterModel[];
  reportedByList: ParameterModel[];
  reviewedByList: ParameterModel[];
  approvedByList: ParameterModel[];
  processList: ParameterModel[];
  empList: ParameterModel[];
  ddProjList: any;
  projList: ParameterModel[];
  @Input('filterCriteria') filterCriteria: FilterPreferenceModel[] = [];
  TaskCategoryList: ParameterModel[];
  temp: any[];
  private subscriptionName: Subscription;

  public constructor(private route: ActivatedRoute, private _util: myUtility, private _appservice: AppsService,
    private _taskService: TaskService, private close: CloseComponentService
  ) {

  }
  async ngOnInit() {
    let role = localStorage.getItem('role');
    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this.sub = this.route.params.subscribe(params => {
      this.selectedCust = params['custid'];
    });
    this.LoadFilterPrefernce(this.tableName);
    this.originalData = this.data;
    this.filteredData = this.data;
    if (this.tableName == 'EVENT_TASK_DETAILS')
      this.service_GetTaskCategoryListByTaskType(99);
    this.filterCriterias = this.filterCriteria != null || this.filterCriteria != undefined ? this.filterCriteria : [];
    this.subscriptionName = this.close.getUpdate().subscribe
      (() => {
        this.refreshComponent();
      });
  }
  ngOnChanges() {
    this.getBestPracticesforProject();
    this.LoadFilterPrefernce(this.tableName);
    this.originalData = this.data;
    this.filteredData = this.data;
    this.filterCriterias = this.filterCriteria != null || this.filterCriteria != undefined ? this.filterCriteria : [];
  }
  ngOnDestroy() {
    this.subscriptionName.unsubscribe();
  }
  emitChanges() {
    var obj = { data: this.filteredData, criteria: this.filterCriterias }
    this.onChange.emit(obj);
  }
  LoadFilterPrefernce(tableName) {
    this.service_GetFilterPreferences(tableName);
  }
  bestpracticeData: BestPracticesModel[] = [];
  getBestPracticesforProject() {
    return;
    this._appservice.getBestPracticesbyProjId(this.selectedProject).subscribe(data => {
      this.AllBestPractices = data;
    }, error => { this._util.serviceError(error); })
  }
  service_GetFilterPreferences(tableName: string) {
    let frequency: ParameterModel[] = [];
    frequency.push(this.NewParam(1, 'Monthly'));
    frequency.push(this.NewParam(2, 'Quarterly'));
    frequency.push(this.NewParam(3, 'Release'));

    let serviceArea: ParameterModel[] = [];
    serviceArea.push(this.NewParam(1, 'Backlog'));
    serviceArea.push(this.NewParam(2, 'Non Backlog'));

    let serviceLevel: ParameterModel[] = [];
    serviceLevel.push(this.NewParam(1, 'Key Measurement'));
    serviceLevel.push(this.NewParam(2, 'Critical Service Level'));

    let slaCategory: ParameterModel[] = [];
    slaCategory.push(this.NewParam(1, 'Backlog Devlopment'));
    slaCategory.push(this.NewParam(2, 'Backlog Execution'));
    slaCategory.push(this.NewParam(3, 'Testing'));
    slaCategory.push(this.NewParam(4, 'Delivery'));
    slaCategory.push(this.NewParam(5, 'Use'));
    slaCategory.push(this.NewParam(6, 'Availability And Usability'));
    slaCategory.push(this.NewParam(7, 'KTLO'));
    slaCategory.push(this.NewParam(8, 'Operational Effectiveness'));
    slaCategory.push(this.NewParam(9, 'Problem'));
    slaCategory.push(this.NewParam(10, 'User Experience'));

    let serviceAreaType: ParameterModel[] = [];
    serviceAreaType.push(this.NewParam(1, 'Backlog'));
    serviceAreaType.push(this.NewParam(2, 'Non Backlog'));

    let serviceLevelStatusType: ParameterModel[] = [];
    serviceLevelStatusType.push(this.NewParam(1, 'Met'));
    serviceLevelStatusType.push(this.NewParam(2, 'Not Met'));

    let serviceLevelType: ParameterModel[] = [];
    serviceLevelType.push(this.NewParam(1, 'Key Measurement'));
    serviceLevelType.push(this.NewParam(2, 'Critical Service Level'));

    let prob: ParameterModel[] = [];
    prob.push(this.NewParam(1, 'Rare'));
    prob.push(this.NewParam(2, 'Remote'));
    prob.push(this.NewParam(3, 'Moderate'));
    prob.push(this.NewParam(4, 'Likely'));
    prob.push(this.NewParam(5, 'Frequent'));

    let impact: ParameterModel[] = [];
    impact.push(this.NewParam(1, 'Insignificant'));
    impact.push(this.NewParam(2, 'Minor'));
    impact.push(this.NewParam(3, 'Significant'));
    impact.push(this.NewParam(4, 'Major'));
    impact.push(this.NewParam(5, 'Critical'));

    let riskStrategy: ParameterModel[] = [];
    riskStrategy.push(this.NewParam(1, 'Accept'));
    riskStrategy.push(this.NewParam(2, 'Avoid'));
    riskStrategy.push(this.NewParam(3, 'Reduce'));
    riskStrategy.push(this.NewParam(4, 'Transfer'));

    let riskStatus: ParameterModel[] = [];
    riskStatus.push(this.NewParam(1, 'Identified'));
    riskStatus.push(this.NewParam(2, 'Assessed'));
    riskStatus.push(this.NewParam(3, 'Planned'));
    riskStatus.push(this.NewParam(4, 'In-Process'));
    riskStatus.push(this.NewParam(5, 'Occurred'));
    riskStatus.push(this.NewParam(6, 'Not Occurred'));
    riskStatus.push(this.NewParam(7, 'Closed'));

    let issueStatus: ParameterModel[] = [];
    issueStatus.push(this.NewParam(1, 'Open'));
    issueStatus.push(this.NewParam(2, 'In-Progress'));
    issueStatus.push(this.NewParam(3, 'Closed'));
    issueStatus.push(this.NewParam(4, 'On Hold'));

    let actionItemStatus: ParameterModel[] = [];
    actionItemStatus.push(this.NewParam(1, 'In Progress'));
    //actionItemStatus.push(this.NewParam(2, 'Started'));
    actionItemStatus.push(this.NewParam(3, 'Completed'));
    actionItemStatus.push(this.NewParam(4, 'Cancelled'));
    actionItemStatus.push(this.NewParam(5, 'Suspended'));
    actionItemStatus.push(this.NewParam(6, 'Open'));
    let actionItempriority: ParameterModel[] = [];
    actionItempriority.push(this.NewParam(1, 'Critical'));
    actionItempriority.push(this.NewParam(2, 'High'));
    actionItempriority.push(this.NewParam(3, 'Medium'));
    actionItempriority.push(this.NewParam(4, 'Low'));

    let issueSeverity: ParameterModel[] = [];
    issueSeverity.push(this.NewParam(1, 'High'));
    issueSeverity.push(this.NewParam(2, 'Medium'));
    issueSeverity.push(this.NewParam(3, 'Low'));

    let eventTaskPriority: ParameterModel[] = [];
    eventTaskPriority.push(this.NewParam(1, 'High'));
    eventTaskPriority.push(this.NewParam(2, 'Medium'));
    eventTaskPriority.push(this.NewParam(3, 'Low'));

    let innovationStatus: ParameterModel[] = [];
    innovationStatus.push(this.NewParam(1, 'Identified'));
    innovationStatus.push(this.NewParam(2, 'Planning'));
    innovationStatus.push(this.NewParam(3, 'Execution'));
    innovationStatus.push(this.NewParam(4, 'Completed'));

    let issueType: ParameterModel[] = [];
    issueType.push(this.NewParam(1, 'Business'));
    issueType.push(this.NewParam(2, 'Other functions'));
    issueType.push(this.NewParam(3, 'Environment'));
    issueType.push(this.NewParam(4, 'Resource'));
    issueType.push(this.NewParam(5, 'Communication'));
    issueType.push(this.NewParam(6, 'Planning'));
    issueType.push(this.NewParam(7, 'Process'));
    issueType.push(this.NewParam(8, 'Scope'));
    issueType.push(this.NewParam(9, 'Constraint'));
    issueType.push(this.NewParam(10, 'Monitoring and Control'));
    issueType.push(this.NewParam(11, 'Hardware'));
    issueType.push(this.NewParam(12, 'Software'));
    issueType.push(this.NewParam(13, 'Server'));
    issueType.push(this.NewParam(14, 'Telecom'));
    issueType.push(this.NewParam(15, 'Desktop'));

    let practiceList: ParameterModel[] = [];
    practiceList.push(this.NewParam(1, 'Practice1'));
    practiceList.push(this.NewParam(2, 'Practice2'));

    let findingsType: ParameterModel[] = [];
    findingsType.push(this.NewParam(1, 'Strength'));
    findingsType.push(this.NewParam(2, 'Weakness'));
    findingsType.push(this.NewParam(3, 'Opportunity'));
    findingsType.push(this.NewParam(4, 'Threat'));

    let stageDescription: ParameterModel[] = [];
    stageDescription.push(this.NewParam(1, 'AUDITEE_ACCEPTANCE AND CAP SUBMISSION'));
    stageDescription.push(this.NewParam(2, 'CAP REVIEW'));
    stageDescription.push(this.NewParam(3, 'IMPLEMENT CAP'));
    stageDescription.push(this.NewParam(4, 'VERIFY CAP IMPLEMENTATION'));

    let statusFeedback: ParameterModel[] = [];
    statusFeedback.push(this.NewParam(1, 'New'));
    statusFeedback.push(this.NewParam(2, 'Submitted'));
    statusFeedback.push(this.NewParam(3, 'Work-in-Progress'));
    statusFeedback.push(this.NewParam(4, 'Resolved'));
    statusFeedback.push(this.NewParam(5, 'Closed'));

    let ideaStatus: ParameterModel[] = [];
    ideaStatus.push(this.NewParam(1, 'Draft'));
    ideaStatus.push(this.NewParam(2, 'Submitted'));
    ideaStatus.push(this.NewParam(3, 'Implemented'));
    ideaStatus.push(this.NewParam(4, 'Approved'));
    ideaStatus.push(this.NewParam(5, 'Rejected'));
    ideaStatus.push(this.NewParam(6, 'On-Hold'));
    ideaStatus.push(this.NewParam(7, 'Planned'));
    ideaStatus.push(this.NewParam(8, 'Completed'));
    //ideaStatus.push(this.NewParam(9,''));

    let ideaType: ParameterModel[] = [];
    ideaType.push(this.NewParam(1, 'Idea'));
    ideaType.push(this.NewParam(2, 'Continuous Improvement'));
    ideaType.push(this.NewParam(3, 'Release'));
    ideaType.push(this.NewParam(4, 'Service'));
    ideaType.push(this.NewParam(5, 'Service Improvement'));
    ideaType.push(this.NewParam(6, 'Innovation'));
    ideaType.push(this.NewParam(7, 'Automation'));
    ideaType.push(this.NewParam(8, 'Process Improvement'));

    let ideaBenefitType: ParameterModel[] = [];
    ideaBenefitType.push(this.NewParam(1, 'Quantitative'));
    ideaBenefitType.push(this.NewParam(2, 'Qualitative'));

    let applicability: ParameterModel[] = [];
    applicability.push(this.NewParam(1, 'Applicable'));
    applicability.push(this.NewParam(0, 'Not Applicable'));

    let fmeastatus: ParameterModel[] = [];
    fmeastatus.push(this.NewParam(1, 'Approved'));
    fmeastatus.push(this.NewParam(0, 'Rejected'));

    let fmeaseverity: ParameterModel[] = [];
    fmeaseverity.push(this.NewParam(1, 'None'));
    fmeaseverity.push(this.NewParam(2, 'Very Minor'));
    fmeaseverity.push(this.NewParam(3, 'Minor'));
    fmeaseverity.push(this.NewParam(4, 'Very Low'));
    fmeaseverity.push(this.NewParam(5, 'Low'));
    fmeaseverity.push(this.NewParam(6, 'Moderate'));
    fmeaseverity.push(this.NewParam(7, 'High'));
    fmeaseverity.push(this.NewParam(8, 'Very High'));
    fmeaseverity.push(this.NewParam(9, 'Severe'));
    fmeaseverity.push(this.NewParam(10, 'Critical'));

    let fmeaoccurence: ParameterModel[] = [];
    fmeaoccurence.push(this.NewParam(1, '1-Remote - Failure is unlikely'));
    fmeaoccurence.push(this.NewParam(2, '2-Remote - Failure is unlikely'));
    fmeaoccurence.push(this.NewParam(3, '3-Low- Relatively few failures'));
    fmeaoccurence.push(this.NewParam(4, '4-Moderate - Occasional failures'));
    fmeaoccurence.push(this.NewParam(5, '5-Moderate - Occasional failures'));
    fmeaoccurence.push(this.NewParam(6, '6-Moderate - Occasional failures'));
    fmeaoccurence.push(this.NewParam(7, '7-High :Repeated failures'));
    fmeaoccurence.push(this.NewParam(8, '8-High :Repeated failures'));
    fmeaoccurence.push(this.NewParam(9, '9-Very High : Failure is almost inevitable'));
    fmeaoccurence.push(this.NewParam(10, '10-Very High : Failure is almost inevitable'));

    let fmeadetection: ParameterModel[] = [];
    fmeadetection.push(this.NewParam(1, '1-Before failure occurs'));
    fmeadetection.push(this.NewParam(2, '2-Before failure occurs'));
    fmeadetection.push(this.NewParam(3, '3-Before failure occurs'));
    fmeadetection.push(this.NewParam(4, '4-During a failure'));
    fmeadetection.push(this.NewParam(5, '5-During a failure'));
    fmeadetection.push(this.NewParam(6, '6-During a failure'));
    fmeadetection.push(this.NewParam(7, '7-After a failure'));
    fmeadetection.push(this.NewParam(8, '8-After a failure'));
    fmeadetection.push(this.NewParam(9, '9-After a failure'));
    fmeadetection.push(this.NewParam(10, '10-Cannot detect'));

    let maturityLevelApplicable: ParameterModel[] = [];
    maturityLevelApplicable.push(this.NewParam(1, 'Yes'));
    maturityLevelApplicable.push(this.NewParam(0, 'No'));

    let WeightageLevelApplicable: ParameterModel[] = [];
    WeightageLevelApplicable.push(this.NewParam(1, 'Yes'));
    WeightageLevelApplicable.push(this.NewParam(0, 'No'));

    let eventTaskType: ParameterModel[] = [];
    eventTaskType.push(this.NewParam(1, 'Task'));
    eventTaskType.push(this.NewParam(2, 'Event'));

    let eventTaskStatus: ParameterModel[] = [];
    eventTaskStatus.push(this.NewParam(1, 'Planned'));
    eventTaskStatus.push(this.NewParam(2, 'Started'));
    eventTaskStatus.push(this.NewParam(3, 'Completed'));
    eventTaskStatus.push(this.NewParam(4, 'Cancelled'));
    eventTaskStatus.push(this.NewParam(5, 'Suspended'));

    let applicabilityList: ParameterModel[] = [];
    applicabilityList.push(this.NewParam(1, 'Account Level'));
    applicabilityList.push(this.NewParam(2, 'Service Level'));
    applicabilityList.push(this.NewParam(3, 'Process Model'));
    applicabilityList.push(this.NewParam(4, 'Process Area'));
    applicabilityList.push(this.NewParam(5, 'Process'));
    applicabilityList.push(this.NewParam(6, 'Country Level'));
    applicabilityList.push(this.NewParam(7, 'State Level'));
    applicabilityList.push(this.NewParam(8, 'Region Level'));

    let categoryList: ParameterModel[] = [];
    categoryList.push(this.NewParam(1, 'SoW'));
    categoryList.push(this.NewParam(2, 'MSA'));
    categoryList.push(this.NewParam(3, 'Security-Exhibit'));
    categoryList.push(this.NewParam(4, 'Legal'));
    categoryList.push(this.NewParam(5, 'Statutory'));


    let statusList: ParameterModel[] = [];
    statusList.push(this.NewParam(1, 'Not Planned'));
    statusList.push(this.NewParam(2, 'Planned'));
    statusList.push(this.NewParam(3, 'Implemented'));
    statusList.push(this.NewParam(4, 'Not Implemented'));
    statusList.push(this.NewParam(5, 'Partially Implemented'));
    statusList.push(this.NewParam(6, 'In-Progress'));
    statusList.push(this.NewParam(7, 'Cancelled'));
    statusList.push(this.NewParam(8, 'Deferred'));
    statusList.push(this.NewParam(9, 'On-hold'));

    let ownerList: ParameterModel[] = [];
    ownerList.push(this.NewParam(1, 'Customer Success Manager'));
    ownerList.push(this.NewParam(2, 'Project Manager'));
    ownerList.push(this.NewParam(3, 'Team Member'));
    ownerList.push(this.NewParam(4, 'BU-Head IMS'));
    ownerList.push(this.NewParam(5, 'Customer'));
    ownerList.push(this.NewParam(6, 'PMO'));
    ownerList.push(this.NewParam(7, 'Quality'));
    ownerList.push(this.NewParam(8, 'Finance'));
    ownerList.push(this.NewParam(9, 'Fuctional Manager'));
    ownerList.push(this.NewParam(10, 'HR'));
    ownerList.push(this.NewParam(11, 'Account Manager'));
    ownerList.push(this.NewParam(12, 'Marketing'));
    ownerList.push(this.NewParam(13, 'GSLab'));

    let findingAge: ParameterModel[] = [];
    findingAge.push(this.NewParam(1, '< 7 days'));
    findingAge.push(this.NewParam(2, '> 7 days'));
    findingAge.push(this.NewParam(3, '> 14 days'));
    findingAge.push(this.NewParam(4, '> 21 days'));
    findingAge.push(this.NewParam(5, '> 30 days'));

    let modeTitle: ParameterModel[] = [];
    modeTitle.push(this.NewParam(1, 'Product Devops'));
    modeTitle.push(this.NewParam(2, 'Module Devops'));
    modeTitle.push(this.NewParam(3, 'Classic Run and Maintain'));
    modeTitle.push(this.NewParam(4, 'Run/End of Life cycle support'));
    modeTitle.push(this.NewParam(5, 'Retire'));
    modeTitle.push(this.NewParam(6, 'Create & Manage Delivery Platform'));
    modeTitle.push(this.NewParam(7, 'Niche Skill Support'));
    modeTitle.push(this.NewParam(8, 'Default'));

    let serviceAreaTypeForKPIMaster: ParameterModel[] = [];
    serviceAreaTypeForKPIMaster.push(this.NewParam(1, 'Backlog'));
    serviceAreaTypeForKPIMaster.push(this.NewParam(2, 'Non-Backlog'));
    serviceAreaTypeForKPIMaster.push(this.NewParam(3, 'Both'));

    if (tableName == 'IDEA') {
      this.getIdentifiedBy();
      this.getAllProjects();

      //      this.getProjectResource();
    }
    // let service1 : ParameterModel[] = [];
    // service1.push(this.NewParam(0, 'Service Tower 1'));

    this._appservice.GetFilterPreferences(tableName).subscribe(
      data => {
        if (this.tableName != 'KPI') {
          this.filterPref = data;
        }
        else {
          if (this.fielD_NAME == "slA_STATUS") {
            this.temp = data.filter(x => x.fielD_NAME != "exclusioN_SLA_STATUS");
            this.filterPref = this.temp;
          }
          else {
            this.temp = data.filter(x => x.fielD_NAME != "slA_STATUS");
            this.filterPref = this.temp;
          }
        }
        for (let field of this.filterPref) {
          if (field.fielD_NAME == "impacT_SCALE")
            field.values = impact;
          else if (field.fielD_NAME == "probabilitY_SCALE")
            field.values = prob;

          if (tableName == 'PROJECT_RISK' && field.fielD_NAME == "status")
            field.values = riskStatus;
          else if (tableName == 'PROJECT_ISSUE' && field.fielD_NAME == "status")
            field.values = issueStatus;
          else if (tableName == 'PROJECT_ACTIONITEM' && field.fielD_NAME == "status")
            field.values = actionItemStatus;
          else if (tableName == 'PROJECT_ACTIONITEM' && field.fielD_NAME == "priority")
            field.values = actionItempriority;
          else if (tableName == 'PROJECT_ISSUE' && field.fielD_NAME == "severity")
            field.values = issueSeverity;
          else if (tableName == 'EVENT_TASK_DETAILS' && field.fielD_NAME == "priority")
            field.values = eventTaskPriority;
          else if (tableName == 'EVENT_TASK_DETAILS' && field.fielD_NAME == "taskType")
            field.values = eventTaskType;
          else if (tableName == 'EVENT_TASK_DETAILS' && field.fielD_NAME == "status")
            field.values = eventTaskStatus;
          else if (tableName == 'EVENT_TASK_DETAILS' && field.fielD_NAME == "taskCategory")
            field.values = this.TaskCategoryList;
          else if (tableName == 'PROJECT_INNOVATION' && field.fielD_NAME == "status")
            field.values = innovationStatus;
          else if (tableName == 'PROJECT_ISSUE' && field.fielD_NAME == "issuE_TYPE")
            field.values = issueType;
          else if (tableName == 'PROJECT_FINDINGS' && field.fielD_NAME == "findinG_TYPE")
            field.values = findingsType;
          else if (tableName == 'PROJECT_FINDINGS' && field.fielD_NAME == "stagE_DESCRIPTION")
            field.values = stageDescription;
          else if (tableName == 'CUSTOMER_FEEDBACK' && field.fielD_NAME == "status")
            field.values = statusFeedback;
          else if (tableName == 'CUST_REQ_REF' && field.fielD_NAME == "requirement_Applicability")
            field.values = applicabilityList;
          else if (tableName == 'CUST_REQ_REF' && field.fielD_NAME == "requirement_Category")
            field.values = categoryList;
          else if (tableName == 'CUST_REQ_REF' && field.fielD_NAME == "owner")
            field.values = ownerList;
          else if (tableName == 'CUST_REQ_REF' && field.fielD_NAME == "status")
            field.values = statusList;


          else if (tableName == 'IDEA' && field.fielD_NAME == "status")
            field.values = ideaStatus
          else if (tableName == 'IDEA' && field.fielD_NAME == "type")
            field.values = ideaType
          else if (tableName == 'IDEA' && field.fielD_NAME == "benefiT_TYPE")
            field.values = ideaBenefitType
          else if (tableName == 'IDEA' && field.fielD_NAME == 'identified_By')
            field.values = this.empList;
          else if (tableName == 'IDEA' && field.fielD_NAME == 'projecT_NAME')
            field.values = this.projList;
          else if (tableName == 'PROJECT_BEST_PRACTICES') {
            if (field.fielD_NAME != "description") {

              this.getAllBestPracticesForCustomer();

              if (field.fielD_NAME == "servicE_AREA")
                field.values = this.serviceAreaList;
              else if (field.fielD_NAME == "procesS_AREA")
                field.values = this.proessAreaList;
              else if (field.fielD_NAME == "process")
                // field.values = practiceList;
                field.values = this.processList;
              else if (field.fielD_NAME == "reporteD_BY")
                field.values = this.reportedByList;
              else if (field.fielD_NAME == "revieweD_BY")
                field.values = this.reviewedByList;
              else if (field.fielD_NAME == "approveD_BY")
                field.values = this.approvedByList;
            }
          }
          else if (tableName == 'FMEA_PROJECT') {
            if (field.fielD_NAME == "isapplicable")
              field.values = applicability;
            else if (field.fielD_NAME == "isapproved")
              field.values = fmeastatus;
            else if (field.fielD_NAME == "rF_SEVERITY_ID")
              field.values = fmeaseverity;
            else if (field.fielD_NAME == "rF_OCCURRENCE_ID")
              field.values = fmeaoccurence;
            else if (field.fielD_NAME == "rF_DETECTION_ID")
              field.values = fmeadetection;
          }
          else if (tableName == 'PM_CHECKLIST') {
            switch (field.fielD_NAME) {
              case "maturitY_LEVEL":
                field.values = maturityLevelApplicable;
                break;
              case "iS_WEIGHTAGE_APPLICABLE":
                field.values = WeightageLevelApplicable;
                break;
              default: break;
            }

            this.getChecklistList();
          }
          else if (tableName == 'KPI' && field.fielD_NAME == 'servicE_AREA_ID')
            field.values = serviceArea;
          else if (tableName == 'KPI' && field.fielD_NAME == 'servicE_LEVEL_ID')
            field.values = serviceLevel;
          else if (tableName == 'KPI' && field.fielD_NAME == 'slA_CATEGORY')
            field.values = slaCategory;
          else if (tableName == 'KPI' && field.fielD_NAME == "exclusioN_SLA_STATUS")
            field.values = serviceLevelStatusType;
          else if (tableName == 'KPI' && field.fielD_NAME == "slA_STATUS")
            field.values = serviceLevelStatusType;
          else if (tableName == 'KPI_DETAILS' && field.fielD_NAME == 'servicE_AREA_ID')
            field.values = serviceAreaType;
          else if (tableName == 'KPI_DETAILS' && field.fielD_NAME == 'servicE_LEVEL_ID')
            field.values = serviceLevelType;
          else if ((tableName == 'KPI' || tableName == 'KPI_DETAILS') && field.fielD_NAME == 'frequency')
            field.values = frequency;
          else if (tableName == 'PROJECT_FINDINGS_BY_AGE' && field.fielD_NAME == "findinG_TYPE")
            field.values = findingsType;
          else if (tableName == 'PROJECT_FINDINGS_BY_AGE' && field.fielD_NAME == "stagE_DESCRIPTION")
            field.values = stageDescription;
          else if (tableName == 'PROJECT_FINDINGS_BY_AGE' && field.fielD_NAME == "agE_OF_FINDING_IN_DAYS")
            field.values = findingAge;
          else if (tableName == 'KPI_PRODUCT' && field.fielD_NAME == "modE_TITLE")
            field.values = modeTitle;
          else if (tableName == 'KPI_PRODUCT' && field.fielD_NAME == "servicE_AREA_TYPE")
            field.values = serviceAreaType;
          else if (tableName == 'KPI_MASTER' && field.fielD_NAME == "servicE_AREA")
            field.values = serviceAreaTypeForKPIMaster;
          else if (tableName == 'KPI_MASTER' && field.fielD_NAME == "servicE_LEVEL")
            field.values = serviceLevelType;
          else if (tableName == 'KPI_MASTER' && field.fielD_NAME == "frequency")
            field.values = frequency;
          else if (tableName == 'KPI_MASTER' && field.fielD_NAME == "slA_CATEGORY")
            field.values = slaCategory;
          else if (tableName == 'RISK_REPOSITORY_MASTER' && field.fielD_NAME == "likelihood")
            field.values = prob;
          else if (tableName == 'RISK_REPOSITORY_MASTER' && field.fielD_NAME == "consequences")
            field.values = impact;
          else if (tableName == 'RISK_REPOSITORY_MASTER' && field.fielD_NAME == "risK_TREATMENT_STRATEGY")
            field.values = riskStrategy;
        }
      },
      error => { this._util.serviceError(error); }
    )
  }
  service_GetTaskCategoryListByTaskType(taskTypeId) {
    this.TaskCategoryList = [];
    this._taskService.GetTaskCategoryListByTaskType(taskTypeId, false).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.TaskCategoryList.push(this.NewParam(data[i].id, data[i].title));
      }
    }, error => { this._util.serviceError(error); });
  }
  getAllProjects() {
    this._appservice.getAllProjectsForCustomer(this.custId).subscribe(data => {
      this.projects = data;
      let newData = data.filter(t => t.proJ_ID != 0)
      this.ddProjList = newData.map(x => x.proJ_NM).filter((x, i, a) => a.indexOf(x) == i).sort();
      this.projList = [];
      for (let i = 0; i < this.ddProjList.length; i++) {

        this.projList.push(this.NewParam(i, this.ddProjList[i]));

      }
    }, error => { },
      () => { });
  }
  getIdentifiedBy() {
    this._appservice.getIdentifiedBy(this.custId).subscribe(
      data => {
        this.employeeList = data;

        let newData = data.filter(t => t.emP_ID != "0")

        this.ddEmployeeList = newData.map(x => x.frsT_NM).filter((x, i, a) => a.indexOf(x) == i).sort();

        this.empList = [];
        for (let i = 0; i < this.ddEmployeeList.length; i++) {

          this.empList.push(this.NewParam(i, this.ddEmployeeList[i]));

        }

      }, error => { },
      () => {
      });
  }

  getChecklistList() {
    this._appservice.getChecklistList().subscribe(data => {
      this.originalData = data;

      //this.refreshTable(this.checklistList);

    }, error => { this._util.serviceError(error); });
  }

  getAllBestPracticesForCustomer() {
    if (this.selectedCust == undefined)
      return;
    this._appservice.getAllBestPracticesForCustomer(this.selectedCust, this.allproj).subscribe(
      data => {
        if (data == undefined || data == null) return;
        this.AllBestPractices = data;
        let newdadta = data.filter(t => t.status != "Not Applicable");
        this.ddServiceArea = newdadta.map(x => x.servicE_AREA).filter((x, i, a) => a.indexOf(x) == i).sort();
        this.ddProcessArea = newdadta.map(x => x.procesS_AREA).filter((x, i, a) => a.indexOf(x) == i).sort();
        this.ddreportedByList = newdadta.map(x => x.reporteD_BY).filter((x, i, a) => a.indexOf(x) == i).sort();
        this.ddreviewedByList = newdadta.map(x => x.revieweD_BY).filter((x, i, a) => a.indexOf(x) == i).sort();
        this.ddapprovedByList = newdadta.map(x => x.approveD_BY).filter((x, i, a) => a.indexOf(x) == i).sort();
        this.ddProcess = newdadta.map(x => x.process).filter((x, i, a) => a.indexOf(x) == i).sort();

        this.serviceAreaList = [];
        this.proessAreaList = [];
        this.reportedByList = [];
        this.reviewedByList = [];
        this.approvedByList = [];
        this.processList = [];
        for (let i = 0; i < this.ddServiceArea.length; i++) {
          this.serviceAreaList.push(this.NewParam(i, this.ddServiceArea[i]));
        }
        for (let i = 0; i < this.ddProcessArea.length; i++) {
          this.proessAreaList.push(this.NewParam(i, this.ddProcessArea[i]));
        }
        for (let i = 0; i < this.ddreportedByList.length; i++) {
          this.reportedByList.push(this.NewParam(i, this.ddreportedByList[i]));
        }
        for (let i = 0; i < this.ddreviewedByList.length; i++) {
          this.reviewedByList.push(this.NewParam(i, this.ddreviewedByList[i]));
        }
        for (let i = 0; i < this.ddapprovedByList.length; i++) {
          this.approvedByList.push(this.NewParam(i, this.ddapprovedByList[i]));
        }
        for (let i = 0; i < this.ddProcess.length; i++) {
          this.processList.push(this.NewParam(i, this.ddProcess[i]));
        }
      },
      error => { },
      () => {
      });
  }

  NewParam(id: number, name: string) {
    let prob = new ParameterModel();
    prob.id = id;
    prob.name = name;
    return prob;
  }
  // FillColumns(data) {
  //   if (data != undefined) {
  //     if (data.length > 0) {
  //       for (var p in data[0]) {
  //         this.columns.push(p);
  //       }
  //     }
  //   }
  // }
  public tbnAddFilter_OnClick() {
    let newFilterValue = new FilterPreferenceModel('', '', true, 'string', []);
    newFilterValue = Object.assign(newFilterValue, this.selectedFilterPref)
    if (newFilterValue.displaY_NAME == undefined || newFilterValue == null || newFilterValue.displaY_NAME == "") {
      alert('Please choose the filter by Value');
      return;
    }

    this.OnAdd.emit(true);

    if (newFilterValue.datA_TYPE === 'number') {
      let vals = newFilterValue.values.filter(t => t.id === Number(newFilterValue.searchString));
      if (vals.length > 0) {
        newFilterValue.searchStringValue = vals[0].name;
      }
      //this.selectedFilterPref.searchStringValue = this.selectedFilterPref.values.filter(t => t.id.toString() === this.selectedFilterPref.searchString)[0].name;
    }
    else
      newFilterValue.searchStringValue = newFilterValue.searchString;

    this.filterCriterias.push(newFilterValue);
    //this.ApplyCriteria(newFilterValue);
    this.ApplyCriteriaRange(this.filterCriterias)
    this.selectedFilterPref = new FilterPreferenceModel('', '', true, 'string', []);
    this.emitChanges();
  }
  private refreshComponent() {
    this.selectedFilterPref = new FilterPreferenceModel('', '', true, 'string', []);
    this.filterCriterias = [];
    this.filteredData = this.originalData;
  }
  public btnClearFilter_OnClick() {
    this.selectedFilterPref = new FilterPreferenceModel('', '', true, 'string', []);
    this.filterCriterias = [];
    this.filteredData = this.originalData;
    this.emitChanges();
    this.LoadFilterPrefernce(this.tableName);
  }
  public btnRemoveFilter_OnClick(filterCriteria: FilterPreferenceModel) {
    this.filterCriterias.splice(this.filterCriterias.indexOf(filterCriteria), 1);
    this.filteredData = this.originalData;
    this.ApplyCriteriaRange(this.filterCriterias);
    // for (let criteria of this.filterCriterias) {
    //   this.ApplyCriteria(criteria);
    // }
    this.emitChanges();
  }


  ApplyCriteria(criteria) {
    try {
      this.filteredData = this.filteredData.filter(t => t[criteria.fielD_NAME].toLowerCase().search(criteria.searchStringValue.toLowerCase()) > -1);
      if (this.filteredData.length == 0) {

      }
    }
    catch (e) {
      if (e.stack.search("TypeError") > -1) {
        this.filteredData = this.filteredData.filter(t => t[criteria.fielD_NAME] == criteria.searchString);
      }
    }
  }
  ApplyCriteriaOnData(criteria, data) {
    try {
      return data[criteria.fielD_NAME].toLowerCase().search(criteria.searchStringValue.toLowerCase()) > -1;

    }
    catch (e) {
      if (e.stack.search("TypeError") > -1) {
        return data[criteria.fielD_NAME] == criteria.searchString;
      }
    }
  }

  ApplyCriteriaRange(criteria: any[]) {
    let fieldNames = criteria.map(x => x.fielD_NAME);
    this.filteredData = this.originalData;
    let fieldNamesDistinct = fieldNames.filter((n, i) => fieldNames.indexOf(n) === i);
    fieldNamesDistinct.forEach(element => {
      let filteredCriteria = criteria.filter(t => t.fielD_NAME === element);
      this.filteredData = this.filteredData.filter(
        t =>
          filteredCriteria.some(e => this.ApplyCriteriaOnData(e, t)));
    });
  }
}


