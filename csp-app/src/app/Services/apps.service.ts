import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient, HttpEvent, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { ScopeModel, modelRow, projectScopes } from "../models/scope-Model";
import { Observable } from "rxjs/Observable";
import { myUtility } from "../Shared/myUtility";
import { RagsModel } from "../models/rags-model";
import { ActionitemModel } from "../models/actionitem-model";
import { ValueaddModel } from "../models/valueadd-model";
import { RiskModel, RiskModelExt } from "../models/risk-model";
import { IssueModel, IssueModelExt } from "../models/issue-model";
import { CustomerModel } from "../models/customer-model";
import { ProjectDetailsModel } from "../models/project-details-model";
import { ClientDetailsModel } from "../models/client-details-model";
import {
  CustomerProjectsModel,
  CustomerProjectsListModel,
  GlobalKPIRequest,
} from "../models/customer-projects-model";
import { DeliveryModel, DeliveryDetailsModel } from "../models/delivery-model";
import { enumDateRange } from "../Shared/enum";
import {
  EmpInfoModel,
  ProjectResourceByEmpIdModel,
  ProjectResourceModel,
  EmpInfoDetailedModel,
  projResourceExtended,
} from "../models/emp-info-model";
import { FeedbackModel } from "../models/feedback-model";
import { ContactsModel } from "../models/contacts-model";
import { InnovationModel } from "../models/innovation-model";
import { kpi_kpiDetails, kpi } from "../models/kpi";
import { ReportDetailsModel } from "../models/report-details-model";
import { HighlightsModel } from "../models/highlights-model";
import { ProcessModel, ProcessDataModel } from "../models/process-model";
import { ChartsModel } from "../models/charts-model";
import { SuccessModel } from "../models/success-model";
import { ResourceModel } from "../models/resource-model";
import { UserstoryModel } from "../models/userstory-model";
import { KpiGoalModel } from "../models/kpi-goal-model";
import { kpidetails } from "../models/kpi-details";
import { CrispCategoryModel } from "../models/crisp-category-model";
import { CrispCriteriaModel } from "../models/crisp-criteria-model";
import { CrispValidationsModel } from "../models/crisp-validations-model";
import {
  CrispProjectsModel,
  CrispDataModel,
} from "../models/crisp-projects-model";
import { ProjectIssuesEWS } from "../models/projectissue_ews";
import { ProjectComplainceHeaderModel } from "../models/project_complaince_header";
import { CrispCategorySummaryModel } from "../models/crisp-category-summary-model";
import { CrispProjectSummaryModel } from "../models/crisp-project-summary-model";
import { ProjectsModel, AddProjectsModel } from "../models/projects-model";
import { ProjectStatusRAGCount } from "../controls/crisp/crisp-project-status-chart/crisp-project-status-chart.component";
import {
  AccessRequestModel,
  AppAccessControlsModel,
  AppControlFeaturesModel,
} from "../models/access-control-model";
import { ProjectRolesModel } from "../models/project-roles-model";
import { MOM_DETAIL, MOM } from "../models/mom-details-model";
import {
  SqaProjectReportsModel,
  SqaChartParamsModel,
  SqaChartParamsWithFilterModel,
  SqaChartFilterModel,
} from "../models/sqa-project-reports-model";
import { DataTableStructureModel } from "../models/data-table-structure-model";
import {
  TimesheetModel,
  TimesheetProjectModel,
  TimesheetProjectEmpModel,
} from "../models/timesheet-model";
import { BestPracticesModel } from "../models/best-practices-model";
import { LessonLearntModel } from "../models/lesson-learnt-model";
import { SqaChartGroupsModel } from "../models/sqa-chart-groups-model";
import { SubProjectTaskModel } from "../models/subproject-task-model";
import { SubProjectModel } from "../models/subproject-model";
import { GlobalKpiCategoryModel } from "../models/global-kpi-category-model";
import {
  KpiDetailsExtendedModel,
  TreeHealthReportCustomer,
} from "../models/kpi-details-extended-model";
import { ParameterModel } from "../models/parameter-model";
import { CssBatchModel } from "../models/css-batch-model";
import {
  CssBatchCustomersModel,
  CssBatchCustomersExtendedModel,
} from "../models/css-batch-customers-model";
import {
  CssQuestionMasterModel,
  BatchCustomerAndQuestions,
} from "../models/css-question-master-model";
import { observeOn, timeout } from "rxjs/operators";
import { AuditFindingCappa } from "../models/audit-finding-capa";
import { AuditFindingCapaExt, AuditFindingStage } from "../models/audit-finding-stage";
import { CheckListExecutionModel } from "../models/checklist-execution";
import { DateRangeModel, TimesheetTypeModel } from "../models/date-range-model";
import {
  ChecklistQuestionsModel,
  QuestionsModel,
} from "../models/checklist-questions-model";
import { TimesheetProjectEmpModelGroupBydate } from "../models/timesheet-model";
import { FilterPreferenceModel } from "../models/filter-preference-model";
import {
  ProcessAreaModelNew,
  ProcessModelNew,
  ProcessModelProcessMapping,
  ServiceAreaModelNew,
  ProcessServiceAreaMapping,
  ObjectiveNew,
  ProcessObjectiveMapping,
  AuditChecklistModelNew,
  ChecklistNew,
  ChecklistExecutionViewModel,
  ChecklisExecutionDetails
} from "../models/audit-checklist-based-model";
import {
  FMEAModel, FMEAStage2Model, FMEARatingFactorsModel, FMEAStage3Model, failurE_MODE_MASTER
} from "../models/fmea-model";

import { CITrackerModel } from "../models/ci_tracker";

import {
  ProcessSQAObjectiveNew,
  RiskCategory,
  RiskCategory2,
  RiskOwner,
  ProcessModelRisksNew,
  RiskObjectiveMappingData,
  ControlCategory,
  ControlReference,
  ProcessModelControlnew,
  ControlRisksMappingModel,
  Classify,
  ProcessModelTestsNew,
  TestControlsMapping,
  TestViewModel,
} from "../models/process-sqa-model";
import { AuditExecutionModel } from "../models/audit-execution-model";
import {
  ServiceAreaProjectMappingModel, ServiceTowersProjectMappingModel,
  ProcessByServiceAreaModel,
} from "../models/service-area-project-mapping-model";
import { ProcessModelModel } from "../models/process-sqa-model";
import { ProjectServiceAreaProcessMappingModel } from "../models/project-service-area-process-mapping-model";
import {
  ChecklistModel,
  ChecklistQuestionsModelNew,
  ProcessChecklistMappingModel,
  PM_MATURITYLEVEL_MAPPING,
  AuditCheckListWeightage,
  ProcessChecklistQuestionsMappingModel,
} from "../models/checklist-model";
import { AuditScheduleModel } from "../models/audit-schedule-model";
import {
  TaskModel,
  TaskGroupsModel,
  TaskTypeModel,
  TaskCategoryModel,
} from "../models/task-model";
import { ReportsSPParamsModel, ServiceParams } from "../models/report-model";
import {
  DashboardDetailsModel,
  AllPortfolioDetails,
  SuccessGoalsScoresModel,
  CSMDashboardDetailsModel, TasksEventsSummary, TasksEventsDetails
} from "../models/dashboard-details-model";
import {
  PortfolioModel,
  PortfoliosModel,
  PortfoliosOwnersProjectModel,
  ProjectModelNew,
} from "../models/portfolio-model";
import { ProjectModel } from "../models/ras/project-model";
import { cusT_GROUP } from "../models/customer-portfolio-project-model";
import { ReleaseModel } from "../models/projmgt/release-model";
import { IterationModel } from "../models/projmgt/iteration-model";
import { Headers } from "@angular/http";
import { InnovationModelExt } from "./../models/innovation-model";
import { promise } from "protractor";
import { auditeE_ACCEPTANCE } from "../models/auditee-acceptance";
import { findingDetails, findingByType } from './../models/qaassesmentdetails-model';
import { GetRequirementRefModel, Req_LevelModel, Req_CategoryModel, Project, Req_StatusModel, Req_Stage_Status_Model } from "../models/requirement-reference.model";
import { AssessmentModel } from "../pages/layout/assessmentstatus/assessmentstatus.component";
import { CITrackerParamerterModel } from "../pages/ci-tracker-page/ci-tracker-page.component";
import { checklistquestionInput } from "../pages/process-model/process-checklist-mapping/process-checklist-mapping.component";
import { ProjectMasterConfigurationModel } from "../models/project-master-configuration-model";
import { CITrackerParamerterModelNew } from "../pages/ci-leaderboard-page/ci-leaderboard-page.component";
import { ContactsRolesModel } from "../models/contacts-roles-model";
import { PremierProductsListModel } from "../models/premier-portfolio-products";
import { AppreciationModel, AppreciationModelExt } from "../models/appreciation-model";
import { EWSDetailsModel } from '../models//ews-details-model';
import { AuditQualifiedStandardModel } from "../pages/auditqualitystandards/auditqualitystandards.component";
import { ProductResponsibleModel } from "../pages/product-responsible/product-responsible.component";
import { observable } from "rxjs";

@Injectable()
export class AppsService {
  apiurl: string = "";
  apiurl_auth: string = "";

  KpiCalledFromNewDashboard: boolean = false;
  constructor(private _http: HttpClient, private _util: myUtility) {
    this.apiurl = environment.webapiuri;
    this.apiurl_auth = environment.webapiuri_auth;
  }
  //General
  // GetAuthHeader() {
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'token': this._util.AppSettings.token
  //     })
  //   };
  //   return httpOptions;
  // }
  //Authentication
  forgotPassword(emailid) {
    return this._http.get(
      this.apiurl_auth + "/PasswordForgot?EmailId=" + emailid
    );
  }
  authenticatewithtoken(token) {
    return this._http.get(
      this.apiurl_auth + "/AuthenticateToken?Token=" + token
    );
  }
  setPassword(authdata) {
    return this._http.post(this.apiurl_auth + "/SetPassword", authdata);
  }
  VerifyActivationCode(authdata) {
    return this._http.post(
      this.apiurl_auth + "/VeriftyActivationCode",
      authdata
    );
  }
  Logout(): Observable<any> {
    let token = this._util.AppSettings.token;
    this._util.empid("");
    this._util.displayname("");
    this._util.token("");
    let header = new HttpHeaders({ Accept: "application/json", token: token });
    return this._http.post<any>(this.apiurl + "/Logout", "", {
      headers: header,
    });
  }
  //AccessControls
  GetAccessControls(): Observable<AppAccessControlsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<AppAccessControlsModel[]>(
      this.apiurl + "/GetAccessControls",
      { headers: header }
    );
  }
  GetAppControlFeatures(): Observable<AppControlFeaturesModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<AppControlFeaturesModel[]>(
      this.apiurl + "/GetControlFeatures",
      { headers: header }
    );
  }
  GetAccessControlsByRoleId(
    roleId: number
  ): Observable<AppAccessControlsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<AppAccessControlsModel[]>(
      this.apiurl + "/GetAccessControlsByRoleId?RoleId=" + roleId,
      { headers: header }
    );
  }
  GetAccessControlsByEmpId(empId): Observable<AppAccessControlsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<AppAccessControlsModel[]>(
      this.apiurl + "/GetAccessControlsByEmpId?EmpId=" + empId,
      { headers: header }
    );
  }
  GetCustomerAccessControls(
    emailId,
    projid
  ): Observable<AppAccessControlsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<AppAccessControlsModel[]>(
      this.apiurl +
      "/GetCustomerAccessControls?EmailId=" +
      emailId +
      "&ProjId=" +
      projid,
      { headers: header }
    );
  }
  UpdateAccessControl(
    accessControl: AppAccessControlsModel
  ): Observable<AppAccessControlsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<AppAccessControlsModel>(
      this.apiurl + "/UpdateAccessControl",
      accessControl,
      { headers: header }
    );
  }
  UpdateAccessControls(
    accessControls: AppAccessControlsModel[]
  ): Observable<AppAccessControlsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<AppAccessControlsModel[]>(
      this.apiurl + "/UpdateAccessControls",
      accessControls,
      { headers: header }
    );
  }
  DeleteAccessControls(
    accessControls: AppAccessControlsModel[]
  ): Observable<AppAccessControlsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<AppAccessControlsModel[]>(
      this.apiurl + "/DeleteAccessControls",
      accessControls,
      { headers: header }
    );
  }
  GetProjectRoles(): Observable<ProjectRolesModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProjectRolesModel[]>(this.apiurl + "/GetCSMTitles", {
      headers: header,
    });
  }
  //RAS
  GetRASCustomerList(): Observable<CustomerModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<CustomerModel[]>(this.apiurl + "/GetCustomerList", {
      headers: header,
    });
  }
  GetRASProjectList(customerid): Observable<ProjectsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProjectsModel[]>(
      this.apiurl + "/GetProjectList?CustomerId=" + customerid,
      { headers: header }
    );
  }
  //SQA
  GetSQAFileStructure(filename): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetSQAFileStructure?FileName=" + filename,
      { headers: header }
    );
  }

  GetReportTypeStructure(reportTypeId): Observable<DataTableStructureModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<DataTableStructureModel[]>(
      this.apiurl + "/GetSQAReportStructure?ReportId=" + reportTypeId,
      { headers: header }
    );
  }

  GetGlobalKPICategoryDetailsAcrossProject(reqobj): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetGlobalKPICategoryDetailsAcrossProject",
      reqobj,
      { headers: header }
    );
  }
  GetConsolidatedProjectWiseKPIDetails(reqobj): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetConsolidatedProjectWiseKPIDetails",
      reqobj,
      { headers: header }
    );
  }

  UpdateReportTypeStructure(
    structures: DataTableStructureModel[]
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/UpdateSQAReportStructure",
      structures,
      { headers: header }
    );
  }

  AddSQAReportStructure(reportStruct): Observable<DataTableStructureModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<DataTableStructureModel[]>(
      this.apiurl + "/AddSQAReportStructure",
      reportStruct,
      { headers: header }
    );
  }
  GetSQAReportTypes(projectid): Observable<SqaProjectReportsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<SqaProjectReportsModel[]>(
      this.apiurl + "/GetSQAReportTypes?ProjectId=" + projectid,
      { headers: header }
    );
  }
  GetProjectCharts(projectid): Observable<SqaChartParamsWithFilterModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<SqaChartParamsWithFilterModel[]>(
      this.apiurl + "/GetProjectCharts?ProjectId=" + projectid,
      { headers: header }
    );
  }

  GetSQAProjectChart(params: SqaChartParamsModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/GetSQAProjectChart", params, {
      headers: header,
    });
  }
  GetSQAProjectCharts(projectId: SqaChartParamsModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetSQAProjectCharts?ProjectId=" + projectId,
      { headers: header }
    );
  }
  GetSQAGroupCharts(
    group: SqaChartGroupsModel,
    projectid: string
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      ProjectId: projectid,
    });
    return this._http.post<any>(this.apiurl + "/GetSQAGroupCharts", group, {
      headers: header,
    });
  }
  GetSQAGroupChartsForProject(
    projectid: string,
    startdate: Date,
    enddate: Date,
    chartUser: string,
    category: string,
    subcategory: string
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      ProjectId: projectid,
      startdate: startdate.toLocaleDateString(),
      enddate: enddate.toLocaleDateString(),
      chartUser: chartUser,
      category: category,
      subcategory: subcategory,
    });
    return this._http.post<any>(
      this.apiurl + "/GetSQAGroupChartsForProject",
      "",
      { headers: header }
    );
  }
  GetSQAChartsParams(
    projectid: string,
    startdate: Date,
    enddate: Date,
    chartUser: string,
    category: string,
    subcategory: string
  ): Observable<SqaChartParamsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      ProjectId: projectid,
      startdate: startdate.toLocaleDateString(),
      enddate: enddate.toLocaleDateString(),
      chartUser: chartUser,
      category: category,
      subcategory: subcategory,
    });
    return this._http.post<SqaChartParamsModel[]>(
      this.apiurl + "/GetSQAChartsParams",
      "",
      { headers: header }
    );
  }

  //RequirementReference_GetCategories

  getCategories(): Observable<Req_CategoryModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<Req_CategoryModel[]>(this.apiurl + "/GetCategories", {
      headers: header,
    });
  }

  //RequirementReference_GetReqReference

  getReqReference(RequirementModel): Observable<GetRequirementRefModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<GetRequirementRefModel[]>(
      this.apiurl + "/GetReqReference",
      RequirementModel,
      { headers: header }
    );
  }

  getApplicabilityLevels(): Observable<Req_LevelModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<Req_LevelModel[]>(
      this.apiurl + "/GetApplicabilityLevels",
      { headers: header }
    );
  }
  getReqStages(req_Id): Observable<Req_Stage_Status_Model[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<Req_Stage_Status_Model[]>(
      this.apiurl + "GetReqStageStatus?reqID=" + req_Id,
      { headers: header }
    );
  }

  GetSQAChartFromParams(params: SqaChartParamsModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetSQAChartFromParams",
      params,
      { headers: header }
    );
  }

  AddSQAProjectChart(params: SqaChartParamsModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/AddProjectChart", params, {
      headers: header,
    });
  }
  DeleteSQAChartFilter(filter: SqaChartFilterModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/DeleteSQAChartFilter", filter, {
      headers: header,
    });
  }
  UpdateSQAProjectChart(params: SqaChartParamsModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/UpdateProjectChart", params, {
      headers: header,
    });
  }
  DeleteSQAProjectChart(params: SqaChartParamsModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/DeleteProjectChart", params, {
      headers: header,
    });
  }
  //CRISP > Category
  MailsToCSM_CRISP(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/MailToCSM_CRISP", {
      headers: header,
    });
  }
  MailsToMGT_CRISP(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/MailToMGT_CRISP", {
      headers: header,
    });
  }
  GetCrispProjects(empid, month, year): Observable<CrispDataModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<CrispDataModel>(
      this.apiurl +
      "/GetCrispProjects?EmpId=" +
      empid +
      "&month=" +
      month +
      "&year=" +
      year,
      { headers: header }
    );
  }
  UpdateCrispProjects(
    crispProjects: CrispProjectsModel[]
  ): Observable<CrispProjectsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    // let data = {'projects' : crispProjects , 'month' : month, 'year' : year};
    return this._http.post<CrispProjectsModel[]>(
      this.apiurl + "/UpdateCrispProjects",
      crispProjects,
      { headers: header }
    );
  }
  PublishCrispProjects(
    crispProjects: CrispProjectsModel[]
  ): Observable<CrispProjectsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    // let data = {'projects' : crispProjects , 'month' : month, 'year' : year};
    return this._http.post<CrispProjectsModel[]>(
      this.apiurl + "/PublishCrispProjects",
      crispProjects,
      { headers: header }
    );
  }

  GetCrispCategory(): Observable<CrispCategoryModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<CrispCategoryModel[]>(
      this.apiurl + "/GetCrispCategory",
      { headers: header }
    );
  }
  AddCrispCategory(category): Observable<CrispCategoryModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<CrispCategoryModel>(
      this.apiurl + "/AddCrispCategory",
      category,
      { headers: header }
    );
  }
  UpdateCrispCategory(category): Observable<CrispCategoryModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<CrispCategoryModel>(
      this.apiurl + "/UpdateCrispCategory",
      category,
      { headers: header }
    );
  }
  DeleteCrispCategory(category): Observable<CrispCategoryModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<CrispCategoryModel>(
      this.apiurl + "/DeleteCrispCategory",
      category,
      { headers: header }
    );
  }

  //CRISP > Criteria
  GetCrispCriteria(): Observable<CrispCriteriaModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<CrispCriteriaModel[]>(
      this.apiurl + "/GetCrispCriteria",
      { headers: header }
    );
  }
  AddCrispCriteria(criteria): Observable<CrispCriteriaModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<CrispCriteriaModel>(
      this.apiurl + "/AddCrispCriteria",
      criteria,
      { headers: header }
    );
  }
  UpdateCrispCriteria(criteria): Observable<CrispCriteriaModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<CrispCriteriaModel>(
      this.apiurl + "/UpdateCrispCriteria",
      criteria,
      { headers: header }
    );
  }
  DeleteCrispCriteria(criteria): Observable<CrispCriteriaModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<CrispCriteriaModel>(
      this.apiurl + "/DeleteCrispCriteria",
      criteria,
      { headers: header }
    );
  }
  GetCrispCriteriasByCategory(categoryid): Observable<CrispCriteriaModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<CrispCriteriaModel[]>(
      this.apiurl + "/GetCrispCriteriasByCategory?CategoryId=" + categoryid,
      { headers: header }
    );
  }
  //TIME SHEET
  GetTimesheetType(custid): Observable<TimesheetTypeModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<TimesheetTypeModel>(
      this.apiurl + "/GetTimesheetType?CustId=" + custid,
      { headers: header }
    );
  }

  GetTimesheetDetailsByEmpId(
    custid,
    startDate,
    endDate
  ): Observable<TimesheetProjectModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      custId: custid.toString(),
      startDate: startDate,
      endDate: endDate,
    });
    return this._http.get<TimesheetProjectModel[]>(
      this.apiurl + "/GetTimesheetDetailsByEmpId",
      { headers: header }
    );
  }
  GetProjectTasks(taskId: string): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      taskId: taskId,
    });
    return this._http.get<any[]>(this.apiurl + "/GetProjectTasks", {
      headers: header,
    });
  }
  GetCalendarDateRange(
    timesheetType: TimesheetTypeModel
  ): Observable<TimesheetTypeModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<TimesheetTypeModel>(
      this.apiurl + "/GetCalendarDateRange",
      timesheetType,
      { headers: header }
    );
  }

  GetCalendarDateRangeForReports(
    timesheetType: TimesheetTypeModel
  ): Observable<TimesheetTypeModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<TimesheetTypeModel>(
      this.apiurl + "/GetCalendarDateRangeForReports",
      timesheetType,
      { headers: header }
    );
  }

  GetTimesheetDetailsByProjectId(
    projectid,
    periodType,
    startDate,
    endDate,
    status
  ): Observable<TimesheetProjectEmpModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      projectId: projectid,
      periodType: periodType.toString(),
      startDate: startDate,
      endDate: endDate,
      status: status,
    });
    return this._http.get<TimesheetProjectEmpModel>(
      this.apiurl + "/GetTimesheetDetailsByProjectId",
      { headers: header }
    );
  }
  GetTimesheetReportByProjectId(
    projectid,
    periodType,
    startDate,
    endDate,
    status
  ): Observable<TimesheetProjectEmpModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      projectId: projectid,
      periodType: periodType.toString(),
      startDate: startDate,
      endDate: endDate,
      status: status,
    });
    return this._http.get<TimesheetProjectEmpModel[]>(
      this.apiurl + "/GetTimesheetReportByProjectId",
      { headers: header }
    );
  }
  GetTimesheetDetailsByProjectIdPMO(
    projectid,
    periodType,
    startDate,
    endDate,
    status
  ): Observable<TimesheetProjectEmpModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      projectId: projectid,
      periodType: periodType.toString(),
      startDate: startDate,
      endDate: endDate,
      status: status,
    });
    return this._http.get<TimesheetProjectEmpModel>(
      this.apiurl + "/GetTimesheetDetailsByProjectIdPMO",
      { headers: header }
    );
  }
  getOldestTimesheetdateForApproval(custid, email): Observable<Date> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<Date>(
      this.apiurl +
      "/getOldestTimesheetdateForApproval?CustomerId=" +
      custid +
      "&EmailId=" +
      email,
      { headers: header }
    );
  }
  GetTimesheetDetailsByProjectIds(
    projectids,
    periodType,
    startDate,
    endDate,
    status
  ): Observable<TimesheetProjectEmpModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      periodType: periodType.toString(),
      startDate: startDate,
      enddate: endDate,
      status: status,
    });
    return this._http.post<TimesheetProjectEmpModel[]>(
      this.apiurl + "/GetTimesheetDetailsByProjectIds",
      projectids,
      { headers: header }
    );
  }

  GetTimesheetDetailedReportByTask(
    projectid,
    periodType,
    startDate,
    endDate,
    status
  ): Observable<TimesheetProjectEmpModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      projectId: projectid,
      periodType: periodType.toString(),
      startDate: startDate,
      endDate: endDate,
      status: status,
    });
    return this._http.get<TimesheetProjectEmpModel[]>(
      this.apiurl + "/GetTimesheetDetailedReportByTask",
      { headers: header }
    );
  }

  UpdateTimesheetDetailsMonthly(
    timesheet
  ): Observable<TimesheetProjectModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<TimesheetProjectModel[]>(
      this.apiurl + "/UpdateTimesheetDetailsMonthly",
      timesheet,
      { headers: header }
    );
  }
  UpdateTimesheetDetailsMonthlyEmp(
    timesheet,
    period: enumDateRange,
    startDate,
    endDate,
    comments
  ): Observable<TimesheetProjectEmpModel[]> {
    comments = "";
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      role: localStorage.getItem("role"),
      period: period.toString(),
      startDate: startDate,
      endDate: endDate,
      comments: comments,
    });
    return this._http.post<TimesheetProjectEmpModel[]>(
      this.apiurl + "/UpdateTimesheetDetailsMonthlyEmp",
      timesheet,
      { headers: header }
    );
  }
  ApproveMultipleProjectTimesheets(
    timesheet,
    period: enumDateRange,
    startDate,
    endDate
  ): Observable<TimesheetProjectEmpModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      period: period.toString(),
      startDate: startDate,
      endDate: endDate,
    });
    return this._http.post<TimesheetProjectEmpModel[]>(
      this.apiurl + "/ApproveMultipleProjectTimesheets",
      timesheet,
      { headers: header }
    );
  }

  ApproveMultipleProjectTimesheetsMultipleRange(
    timesheet,
    period: enumDateRange,
    startDate,
    endDate
  ): Observable<TimesheetProjectEmpModelGroupBydate[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      period: period.toString(),
      startDate: startDate,
      endDate: endDate,
    });
    return this._http.post<TimesheetProjectEmpModelGroupBydate[]>(
      this.apiurl + "/ApproveMultipleProjectTimesheetsMultipleRange",
      timesheet,
      { headers: header }
    );
  }

  //CRISP > Validations
  GetCrispValidations(): Observable<CrispValidationsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<CrispValidationsModel[]>(
      this.apiurl + "/GetCrispValidations",
      { headers: header }
    );
  }
  AddCrispValidations(criteria): Observable<CrispValidationsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<CrispValidationsModel>(
      this.apiurl + "/AddCrispValidations",
      criteria,
      { headers: header }
    );
  }
  UpdateCrispValidations(criteria): Observable<CrispValidationsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<CrispValidationsModel>(
      this.apiurl + "/UpdateCrispValidations",
      criteria,
      { headers: header }
    );
  }
  DeleteCrispValidations(criteria): Observable<CrispValidationsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<CrispValidationsModel>(
      this.apiurl + "/DeleteCrispValidations",
      criteria,
      { headers: header }
    );
  }
  GetCrispValidationsByCriteria(
    criteriaid
  ): Observable<CrispValidationsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<CrispValidationsModel[]>(
      this.apiurl + "/GetCrispValidationsByCriteria?CriteriaId=" + criteriaid,
      { headers: header }
    );
  }
  //CRISP > Summary
  GetCrispSummary(
    projectIds,
    month,
    year
  ): Observable<CrispCategorySummaryModel[]> {
    let empid = "100365";
    //let month='jun';
    //let year = "2018";
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      projectIds: projectIds,
    });
    return this._http.get<CrispCategorySummaryModel[]>(
      this.apiurl +
      "/GetCrispSummary?EmpId=" +
      empid +
      "&month=" +
      month +
      "&year=" +
      year,
      { headers: header }
    );
  }

  GetCrispProjectStatus(
    projectIds,
    month,
    year
  ): Observable<ProjectStatusRAGCount> {
    let empid = "100365";
    // let month='jun';
    // let year = "2018";
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      projectIds: projectIds,
    });
    return this._http.get<ProjectStatusRAGCount>(
      this.apiurl +
      "/GetCrispProjectStatus?EmpId=" +
      empid +
      "&month=" +
      month +
      "&year=" +
      year,
      { headers: header }
    );
  }

  GetCrispDetails(
    projectIds,
    month,
    year
  ): Observable<CrispCategorySummaryModel[]> {
    // let month='jun';
    // let year = "2018";
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      projectIds: projectIds,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<CrispCategorySummaryModel[]>(
      this.apiurl + "/GetCrispDetails?month=" + month + "&year=" + year,
      { headers: header }
    );
  }

  GetCrispDetailsNew(
    projectIds,
    month,
    year
  ): Observable<CrispProjectSummaryModel[]> {
    // let month='jun';
    // let year = "2018";
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      projectIds: projectIds,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<CrispProjectSummaryModel[]>(
      this.apiurl + "/GetCrispDetails?month=" + month + "&year=" + year,
      { headers: header }
    );
  }

  GetCrispProjectSummary(
    projectIds,
    month,
    year
  ): Observable<CrispProjectSummaryModel[]> {
    let empid = "100365";
    // let month='jun';
    // let year = "2018";
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      projectIds: projectIds,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<CrispProjectSummaryModel[]>(
      this.apiurl +
      "/GetCrispProjectSummary?EmpId=" +
      empid +
      "&month=" +
      month +
      "&year=" +
      year,
      { headers: header }
    );
  }

  //KPI
  GetKpiDetailsTable(
    custId,
    projId,
    startDate,
    enddate,
    perspective,
    color
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      custId: custId.toString(),
      projId: projId,
      startdate: startDate,
      EndDate: enddate,
      perspective: perspective,
      color: color,
    });
    return this._http.post<any[]>(this.apiurl + "/GetKpiDetailsTable", "", {
      headers: header,
    });
  }

  getKPI(customerid): Observable<kpi_kpiDetails> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<kpi_kpiDetails>(
      this.apiurl + "/GetKPI?CustomerId=" + customerid,
      { headers: header }
    );
  }
  GetGlobalKpiCategories(): Observable<GlobalKpiCategoryModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<GlobalKpiCategoryModel[]>(
      this.apiurl + "/GetGlobalKPICategories",
      { headers: header }
    );
  }
  GetKpiGoals(customerid, projectId): Observable<KpiGoalModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<KpiGoalModel[]>(
      this.apiurl +
      "/GetKPIGoals?CustomerId=" +
      customerid +
      "&ProjectId=" +
      projectId,
      // "&IncludeInternal=" +
      // includeInternal,
      { headers: header }
    );
  }
  AddKpiGoal(goal): Observable<KpiGoalModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<KpiGoalModel>(this.apiurl + "/AddKPIGoal", goal, {
      headers: header,
    });
  }
  UpdateKpiGoal(goal): Observable<KpiGoalModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<KpiGoalModel>(this.apiurl + "/UpdateKPIGoal", goal, {
      headers: header,
    });
  }
  DeleteKpiGoal(goal): Observable<KpiGoalModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<KpiGoalModel>(this.apiurl + "/DeleteKPIGoal", goal, {
      headers: header,
    });
  }

  GetAuthHeader() {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return header;
  }

  GetKpiDefinitions(customerid, projectId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetKPIDefinitions?CustomerId=" +
      customerid +
      "&ProjectId=" +
      projectId,
      // "&IncludeInternal=" +
      // includeInternal,
      { headers: header }
    );
  }
  GetKpiDefinitionsByGoal(customerid, projectId, goalId): Observable<kpi[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<kpi[]>(
      this.apiurl +
      "/GetKPIDefinitionsByGoal?CustomerId=" +
      customerid +
      "&ProjectId=" +
      projectId +
      "&GoalId=" +
      goalId,
      { headers: header }
    );
  }
  AddKpiDefinition(definition): Observable<KpiGoalModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<KpiGoalModel>(this.apiurl + "/AddKPI", definition, {
      headers: header,
    });
  }
  UpdateKpiDefinition(definition): Observable<KpiGoalModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<KpiGoalModel>(
      this.apiurl + "/UpdateKPI",
      definition,
      { headers: header }
    );
  }
  UpdateProdKpiDefinition(definition): Observable<KpiGoalModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<KpiGoalModel>(
      this.apiurl + "/UpdateProductKPI",
      definition,
      { headers: header }
    );
  }
  DeleteKpiDefinition(definition): Observable<KpiGoalModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<KpiGoalModel>(
      this.apiurl + "/DeleteKPI",
      definition,
      { headers: header }
    );
  }
  DeleteKpiTarget(kpitarget): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/DeleteKPITarget", kpitarget, {
      headers: header,
    });
  }
  GetKpiDetailsByKpiId(kpiid): Observable<kpidetails[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<kpidetails[]>(
      this.apiurl + "/GetKpiDetailsByKPIId?KPIId=" + kpiid,
      { headers: header }
    );
  }
  AddKpiDetails(detail): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/AddKPIDetails", detail, {
      headers: header,
    });
  }

  getColorforKPI(kpiActual, kpiTarget): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetColorforKPI?kpiActual=" +
      kpiActual +
      "&kpiId=" +
      kpiTarget,
      {
        headers: header,
      }
    );
  }

  UpdateKpiDetails(detail): Observable<kpidetails> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<kpidetails>(
      this.apiurl + "/UpdateKPIDetails",
      detail,
      { headers: header }
    );
  }
  DeleteKpiDetails(detail): Observable<kpidetails> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<kpidetails>(
      this.apiurl + "/DeleteKPIDetails",
      detail,
      { headers: header }
    );
  }

  getAllPortfolioDetails(
    portfolios: PortfolioModel[],
    dashboarddetails: DashboardDetailsModel[]
  ): Observable<AllPortfolioDetails[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = { portfolios: portfolios, dashboarddetails: dashboarddetails };
    return this._http.post<AllPortfolioDetails[]>(
      this.apiurl + "/GetAllPortfolioDetails",
      data,
      { headers: header }
    );
  }

  //Customer projects
  GetClientProjects(clientId): Observable<ProjectsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProjectsModel[]>(
      this.apiurl + "/GetClientProjects?ClientId=" + clientId,
      { headers: header }
    );
  }

  GetCustomerList(empid, isToFindSLA): Observable<any[]> {
    empid = localStorage.getItem("empid");
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    var custIds = localStorage.getItem('CustomerIds');
    if (custIds != undefined && custIds != null && custIds != '') {
      const raw = JSON.parse(custIds);
      return new Observable<any[]>(a => a.next(raw));
    }
    else
      return this._http.get<any[]>(
        this.apiurl + "/GetCustomerIds?EmpId=" + empid + "&istoFindSLA=" + isToFindSLA,
        { headers: header }
      );
  }

  GetAuditsByStatus(AssessmentModel: AssessmentModel): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    //return this._http.get<any[]>(this.apiurl + '/GetCustomerList?EmpId=' + empid, { headers: header });
    return this._http.post<any[]>(
      this.apiurl + "/GetAuditsByStatus",
      AssessmentModel,
      { headers: header }
    );
  }

  GetDashboardDetailsbyCustomerId(
    customerId
  ): Observable<DashboardDetailsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<DashboardDetailsModel[]>(
      this.apiurl + "/GetDashboardDetails?CustomerId=" + customerId,
      { headers: header }
    );
  }

  GetAssessmentDetails(custId, month, year): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetAssessmentDetails?customerId=" + custId + "&month=" + month + "&year=" + year,
      { headers: header }
    );

  }


  getTaggedCustomerIds(empid): Observable<string[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<string[]>(
      this.apiurl + "/GetTaggedCustomerIds?EmpId=" + empid,
      { headers: header }
    );
  }
  getKPITrendByMonthLine(
    custId,
    projids,
    startdate,
    enddate
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = {
      cust_id: custId,
      proj_ids: projids,
      start_date: startdate,
      end_date: enddate,
    };
    return this._http.post<any[]>(
      this.apiurl + "/GetKPITrendByMonthLine",
      data,
      { headers: header }
    );
  }

  GetAchievementTrendByMonthLine(
    custId,
    projid,
    startdate,
    enddate
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = {
      cust_id: custId,
      proj_id: projid,
      start_date: startdate,
      end_date: enddate,
    };
    return this._http.post<any[]>(
      this.apiurl + "/GetAchievementTrendByMonthLine",
      data,
      { headers: header }
    );
  }

  // getTaggedCustomerIds(empid) : Observable<number[]>{
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token });
  //   return this._http.get<number[]>(this.apiurl + '/GetTaggedCustomerIds?EmpId='+ empid, { headers: header });
  // }

  getCustomerId(empid): Observable<string[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<string[]>(
      this.apiurl + "/GetCustomerIdOfACustomer?EmpId=" + empid,
      { headers: header }
    );
  }

  getAllCustomerIds(): Observable<string[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<string[]>(this.apiurl + "/GetAllCustomerIds", {
      headers: header,
    });
  }

  getOpenEscalationsForWeekByCustomer(
    custids,
    startDate: Date,
    endDate: Date,
    status: string
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = {
      CustIds: custids,
      StartDate: startDate,
      EndDate: endDate,
      Status: status,
    };
    return this._http.post<any[]>(
      this.apiurl + "/GetOpenEscalationsForWeekByCustomer",
      data,
      { headers: header }
    );
  }

  GetAllCustomerLevelProjectStatus(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetAllCustomerLevelProjectStatus",
      { headers: header }
    );
  }

  GetAllCustomerLevelIdeasDetails(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetAllCustomerLevelIdeasDetails",
      { headers: header }
    );
  }

  GetDashboardDetailsByCustomerIds(
    customerIds: string[]
  ): Observable<DashboardDetailsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<DashboardDetailsModel[]>(
      this.apiurl + "/GetDashboardDetails",
      customerIds,
      { headers: header }
    );
  }

  RefreshDashboardDetails(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/RefreshDashboardDetails", {
      headers: header,
    });
  }

  RefreshDashboardDetailsAuto(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/RefreshDashboardDetailsAuto", {
      headers: header,
    });
  }

  GetRagFromScore(score): Observable<string> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<string>(
      this.apiurl + "/GetRagFromScore?score=" + score,
      { headers: header }
    );
  }

  GetProjectName(projId: string): Observable<string> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<string>(
      this.apiurl + "/GetProjectName?ProjId=" + projId,
      { headers: header }
    );
  }
  GetProductName(prodId): Observable<string> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<string>(
      this.apiurl + "/GetProductName?prodId=" + prodId,
      { headers: header }
    );
  }
  GetSuccessGoalScoresForProject(
    customerId
  ): Observable<SuccessGoalsScoresModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<SuccessGoalsScoresModel[]>(
      this.apiurl + "/GetSuccessGoalScoresForProject?CustomerId=" + customerId,
      { headers: header }
    );
  }
  GetTasksEventsSummary(customerId, empId): Observable<TasksEventsSummary[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<TasksEventsSummary[]>(
      this.apiurl +
      "/GetTasksEventsSummary?customerId=" +
      customerId +
      "&empId=" +
      empId,
      { headers: header }
    );
  }
  getProjectPortfolioMapping(custid, allproj): Observable<ProjectModelNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProjectModelNew[]>(
      this.apiurl +
      "/GetAllPortfolioProjectList?custid=" +
      custid +
      "&AllProjects=" +
      allproj,
      { headers: header }
    );
  }

  GetPortfolioList(): Observable<PortfolioModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<PortfolioModel[]>(this.apiurl + "/GetPortfolioList", {
      headers: header,
    });
  }

  getProjectsCount(portfolioid): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetProjectsCountByPortfolioId?PortfolioId=" + portfolioid,
      { headers: header }
    );
  }

  getSuccessGoalScoreForAPeriod(
    custid,
    month,
    year,
    bLastUpdated: boolean
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetSuccessGoalScoreForAPeriod?CustomerId=" +
      custid +
      "&Month=" +
      month +
      "&Year=" +
      year +
      "&bLastUpdated=" +
      bLastUpdated,
      { headers: header }
    );
  }

  getSuccessGoalScoreForAPeriodNew(
    custid,
    fromDate,
    toDate,
    bLastUpdated: boolean
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetSuccessGoalScoreForAPeriodNew?CustomerId=" +
      custid +
      "&fromDate=" +
      fromDate +
      "&toDate=" +
      toDate +
      "&bLastUpdated=" +
      bLastUpdated,
      { headers: header }
    );
  }

  GetMultipleCustomersProjectNames(custid: any, allproj): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      custid: custid,
    });
    //return this._http.get<any[]>(this.apiurl + '/GetMultipleCustomersProjectNames?EmpId=' + localStorage.getItem('empid'), { headers: header });
    if (allproj)
      return this._http.get<any[]>(
        this.apiurl + "/GetMultipleCustomersProjectNames",
        { headers: header }
      );
    else
      return this._http.get<any[]>(
        this.apiurl +
        "/GetMultipleCustomersProjectNames?EmpId=" +
        localStorage.getItem("empid"),
        { headers: header }
      );
  }
  GetMultipleCustomersProjectNamesSingle(
    custid: string,
    allproj
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    //return this._http.get<any[]>(this.apiurl + '/GetMultipleCustomersProjectNames?EmpId=' + localStorage.getItem('empid'), { headers: header });
    if (allproj)
      return this._http.get<any[]>(
        this.apiurl +
        "/GetMultipleCustomersProjectNamesSingle?CustId=" +
        custid,
        { headers: header }
      );
    else
      return this._http.get<any[]>(
        this.apiurl +
        "/GetMultipleCustomersProjectNamesSingle?EmpId=" +
        localStorage.getItem("empid") +
        "&CustId=" +
        custid,
        { headers: header }
      );
  }

  GetProjectNamesByCustomerIds(custids: string[], allproj): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/GetProjectNamesByCustomerIds",
      { CUST_ID: custids, ALL_PROJECTS: allproj },
      { headers: header }
    );
  }

  GetCustomerProjectsNameWithCustNM(custid, empid): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetCustomerProjectsName?CustomerId=" +
      custid +
      "&EmpId=" +
      empid,
      { headers: header }
    );
  }

  GetProjectsNameForCustomer(custid) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetCustomerProjectsName?CustomerId=" + custid,
      { headers: header }
    );
  }

  GetDistinctTimesheetStatus(custid, empid): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetTimesheetStatus?CustomerId=" +
      custid +
      "&EmpId=" +
      empid,
      { headers: header }
    );
  }

  GetCustomerProjectsName(custid: string, allproj: boolean): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    if (allproj)
      return this._http.get<any[]>(
        this.apiurl + "/GetCustomerProjectsName?CustomerId=" + custid,
        { headers: header }
      );
    else
      return this._http.get<any[]>(
        this.apiurl +
        "/GetCustomerProjectsName?CustomerId=" +
        custid +
        "&EmpId=" +
        localStorage.getItem("empid") +
        "&AllProj=" +
        allproj,
        { headers: header }
      );
  }
  GetProjectDataConfigurationValues(settingVal, custid, projId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetProjectDataConfigurationValues?settingVal=" +
      settingVal +
      "&custid=" +
      custid +
      "&projId=" +
      projId,
      { headers: header }
    );
  }
  GetCustomerProjectsNameForClient(custid, email): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetCustomerProjectsNameForClient?CustomerId=" +
      custid +
      "&EmailId=" +
      email,
      { headers: header }
    );
  }
  //Success Journey calls
  GetTimelineChart(custid, projid, startdate, enddate): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetTimelineChart?CustId=" +
      custid +
      "&ProjId=" +
      projid +
      "&StartDate=" +
      startdate +
      "&EndDate=" +
      enddate,
      { headers: header }
    );
  }
  //SubProjects
  getProjectTask(projId): Observable<SubProjectTaskModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<SubProjectTaskModel[]>(
      this.apiurl + "/GetProjectTask?ProjId=" + projId,
      { headers: header }
    );
  }
  getSubProjectTaskResponsibilityList(custId, projId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<SubProjectTaskModel[]>(
      this.apiurl +
      "/GetSubProjectTaskResponsibilityList?custId=" +
      custId +
      "&projId=" +
      projId,
      { headers: header }
    );
  }

  GetSubProjects(projectid): Observable<SubProjectModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<SubProjectModel[]>(
      this.apiurl + "/GetSubProjects?ProjectId=" + projectid,
      { headers: header }
    );
  }
  AddSubProject(subproject: SubProjectModel): Observable<SubProjectModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<SubProjectModel>(
      this.apiurl + "/AddSubProject",
      subproject,
      { headers: header }
    );
  }
  updateProjectTask(
    tasks: SubProjectTaskModel
  ): Observable<SubProjectTaskModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<SubProjectTaskModel>(
      this.apiurl + "/UpdateProjectTasks",
      tasks,
      { headers: header }
    );
  }
  //employees
  GetCustomerProjectsList(empid): Observable<CustomerProjectsListModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<CustomerProjectsListModel[]>(
      this.apiurl + "/GetCustomerProjectList?EmpId=" + empid,
      { headers: header }
    );
  }
  GetCustomerProjectListForProjIds(projIds: string): Observable<CustomerProjectsListModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/GetCustomerProjectListForProjIds", projIds, { headers: header });
  }
  getCustomerPortfolioProjectsList(
    empid,
    allproj: boolean = false
  ): Observable<cusT_GROUP[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetCustomerPortfolioProjectList?EmpId=" +
      empid +
      "&ProjFlag=" +
      allproj,
      { headers: header }
    );
  }
  getEmployees(managerid): Observable<EmpInfoModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<EmpInfoModel[]>(
      this.apiurl + "/EmpInfo?ManagerId=" + managerid,
      { headers: header }
    );
  }
  getProjectResourceByEmpId(
    empid: string
  ): Observable<ProjectResourceByEmpIdModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProjectResourceByEmpIdModel[]>(
      this.apiurl + "/GetProjectResourceByEmpId?EmpId=" + empid,
      { headers: header }
    );
  }
  getProjectResourceByProjId(
    projid: string
  ): Observable<ProjectResourceByEmpIdModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProjectResourceByEmpIdModel[]>(
      this.apiurl + "/GetProjectResourceByProjectId?ProjId=" + projid,
      { headers: header }
    );
  }

  getProjectSpocsByProjId(projid: string): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetProjectSpocsByProjectId?ProjId=" + projid,
      { headers: header }
    );
  }

  addProjectResource(pr: ProjectResourceModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/AddProjectResource", pr, {
      headers: header,
    });
  }
  deleteProjectResource(pr: ProjectResourceByEmpIdModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/DeleteProjectResource", pr, {
      headers: header,
    });
  }
  getAllCustomerNamesEmpNames(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetAllCustomerNamesEmpNames", {
      headers: header,
    });
  }
  getEmpInfo(): Observable<EmpInfoModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<EmpInfoModel[]>(this.apiurl + "/EmpInfo", {
      headers: header,
    });
  }
  GetQASpocDetails(): Observable<EmpInfoModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<EmpInfoModel[]>(this.apiurl + "/GetQASpocDetails", {
      headers: header,
    });
  }
  getProjectResourcebyProjIds(projIds: string[]): Observable<EmpInfoModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      projIds: projIds,
    });
    return this._http.get<EmpInfoModel[]>(
      this.apiurl + "/GetProjectResourceByProjIds",
      { headers: header }
    );
  }

  getCustomerInfo(managerid): Observable<CustomerProjectsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<CustomerProjectsModel[]>(
      this.apiurl + "/GetCustomerInfo?ManagerId=" + managerid,
      { headers: header }
    );
  }
  saveEmployees(employees): Observable<EmpInfoModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<EmpInfoModel[]>(
      this.apiurl + "/EmpInfo",
      employees,
      { headers: header }
    );
  }
  // getMomsWithDate(date: Date): Observable<MOM_DETAIL[]> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token });
  //   return this._http.get<MOM_DETAIL[]>(this.apiurl + '/GetMoMsWithDate?Date=' + date + '&EmpId=' + localStorage.getItem('empid'), { headers: header });
  // }
  getMomsWithDate(date: Date, custId: string): Observable<MOM_DETAIL[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<MOM_DETAIL[]>(
      this.apiurl + "/GetMoMsWithDate?Date=" + date + "&CustId=" + custId,
      { headers: header }
    );
  }
  //Contacts
  getContacts(customerid): Observable<ContactsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ContactsModel[]>(
      this.apiurl + "/Contacts?CustomerId=" + customerid,
      { headers: header }
    );
  }
  addContacts(contacts): Observable<ContactsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ContactsModel>(this.apiurl + "/Contacts", contacts, {
      headers: header,
    });
  }
  deleteContacts(contacts): Observable<ContactsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ContactsModel>(
      this.apiurl + "/DeleteContacts",
      contacts,
      { headers: header }
    );
  }
  //Feedback
  getFeedbacks(customerid): Observable<FeedbackModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<FeedbackModel[]>(
      this.apiurl + "/Feedback?CustomerId=" + customerid,
      { headers: header }
    );
  }
  updateFeedback(feedback): Observable<FeedbackModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<FeedbackModel>(this.apiurl + "/Feedback", feedback, {
      headers: header,
    });
  }
  addFeedback(feedback): Observable<FeedbackModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<FeedbackModel>(
      this.apiurl + "/AddFeedback",
      feedback,
      { headers: header }
    );
  }
  //Innovation
  addInnovation(innovation): Observable<InnovationModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<InnovationModel>(
      this.apiurl + "/AddInnovation",
      innovation,
      { headers: header }
    );
  }
  updateInnovation(innovation): Observable<InnovationModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<InnovationModel>(
      this.apiurl + "/UpdateInnovation",
      innovation,
      { headers: header }
    );
  }
  deleteInnovation(innovation: InnovationModel): Observable<InnovationModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<InnovationModel>(
      this.apiurl + "/DeleteInnovation",
      innovation,
      { headers: header }
    );
  }
  //Users
  getCustomerProjectsByCustomerId(
    custid,
    empid,
    date
  ): Observable<ProjectDetailsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProjectDetailsModel[]>(
      this.apiurl +
      "/GetCustomerProjects?CustomerId=" +
      custid +
      "&EmpId=" +
      empid +
      "&CurrentDate=" +
      date.toDateString(),
      { headers: header }
    );
  }

  getCustomerProjects(empid): Observable<CustomerProjectsModel[]> {
    // let header = new HttpHeaders({
    //   Accept: "application/json",
    //   token: this._util.AppSettings.token,
    // });
    // return this._http.get<CustomerProjectsModel>(
    //   this.apiurl + "/CustomerProjects?EmpId=" + empid,
    //   { headers: header }
    // );
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<CustomerProjectsModel[]>(
      this.apiurl + "/CustomerProjects?EmpId=" + empid,
      { headers: header }
    );
  }
  addCustomerProjects(newCust): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/CustomerProjects", newCust, {
      headers: header,
    });
  }

  getCustomerContactsForAccount(custid: string): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetCustomerContacts?customerId=" + custid, {
      headers: header,
    });
  }


  inviteUser(email, empid): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let url = this.apiurl + "/InviteUser?email=" + email + "&empid=" + empid;
    return this._http.get<any>(url, { headers: header });
  }
  deleteCustomerProjects(email, custid, empid): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let url =
      this.apiurl +
      "/DeleteCustomerProjects?CustomerEmailid=" +
      email +
      "&CustomerId=" +
      custid +
      "&Empid=" +
      empid;
    return this._http.post<any>(url, null, { headers: header });
  }
  //Dashboard
  getGetCSPDetails_Customer(
    CustomerEmailid,
    date
  ): Observable<ClientDetailsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ClientDetailsModel[]>(
      this.apiurl +
      "/GetCCSPDetails?CustomerEmailid=" +
      CustomerEmailid +
      "&CurrentDate=" +
      date.toDateString(),
      { headers: header }
    );
  }
  getGetCSPDetails_Employee(empid, date, clientId): Observable<ClientDetailsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ClientDetailsModel[]>(
      this.apiurl +
      "/GetCSPDetails?EmpId=" +
      empid +
      "&CurrentDate=" +
      date.toDateString()
      +
      "&customerId=" +
      clientId,
      { headers: header }
    );
  }
  getGetCSPDetails_EmployeeShort(empid, date, clientId): Observable<ClientDetailsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ClientDetailsModel[]>(
      this.apiurl +
      "/GetCSPDetailsShort?EmpId=" +
      empid +
      "&CurrentDate=" +
      date.toDateString()
      +
      "&customerId=" +
      clientId,
      { headers: header }
    );
  }
  //Project

  //ActionItem Calls
  deleteActionItem(actionitem: ActionitemModel): Observable<ActionitemModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ActionitemModel>(
      this.apiurl + "/Actionitem",
      actionitem,
      { headers: header }
    );
  }

  deleteActionItemforRisk(
    actionitem: ActionitemModel
  ): Observable<ActionitemModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ActionitemModel>(
      this.apiurl + "/DeleteActionitemforRisk",
      actionitem,
      { headers: header }
    );
  }

  getActionItem(): Observable<ActionitemModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ActionitemModel[]>(this.apiurl + "/Actionitem", {
      headers: header,
    });
  }
  getAreaActionItem(projid): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(this.apiurl + "/GetActionitemArea", projid, {
      headers: header,
    });
  }

  getRiskAreaItem(projid): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(this.apiurl + "/GetRiskAreaChart", projid, {
      headers: header,
    });
  }

  getIssueAreaItem(projid): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(this.apiurl + "/GetIssueAreaChart", projid, {
      headers: header,
    });
  }

  getProjectTeamCount(projid): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/GetProjectTeamCount",
      projid,
      {
        headers: header,
      }
    );
  }
  //CustomerobjectivesNew _ Scope Start

  getProjectScopeByProjId(projid: string): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetProjectScope?ProjectId=" + projid,
      { headers: header }
    );
  }
  GetProjectInScope(projectId: string): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetProjectInScope?ProjectId=" + projectId,
      { headers: header }
    );
  }

  DeleteInScope(r: modelRow): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/DeleteInScope", r, {
      headers: header,
    });
  }

  getProjectScopeAdditionalByProjId(projid: string): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetProjectScopeAdditionalInfo?ProjectId=" + projid,
      { headers: header }
    );
  }

  //CustomerObjectivesNew_Scope End

  //People-Page _ GetPeople Start

  getProjectPeopleByProjId(projid: string): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetProjectPeople?ProjectId=" + projid,
      { headers: header }
    );
  }

  //People-Page _ GetPeople End

  //GetProjectRags with ProjectID Start

  getProjectRagsByProjId(projid: string): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetProjectRags?ProjectId=" + projid,
      { headers: header }
    );
  }

  //GetProjectRags with ProjectID End

  //GetProjectProcess with ProjectID Start

  getProjectProcessByProjId(projid: string): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetProjectProcess?ProjectId=" + projid,
      { headers: header }
    );
  }

  //GetProjectProcess with ProjectID End

  //Delivery
  getDelivery(
    projectid,
    publishdate,
    range: enumDateRange
  ): Observable<DeliveryDetailsModel> {
    let deliveryheader = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      PROJ_ID: projectid,
      PUBLISH_DATE: publishdate,
      DATE_RANGE: range.toString(),
    });

    return this._http.get<DeliveryDetailsModel>(
      this.apiurl +
      "/Delivery?projId=" +
      projectid +
      "&publishDate=" +
      publishdate +
      "&range=" +
      range.toString(),
      {
        headers: deliveryheader,
      }
    );
  }
  //Issue Calls
  deleteIssue(issue: IssueModelExt): Observable<IssueModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<IssueModelExt>(this.apiurl + "/Issue", issue, {
      headers: header,
    });
  }
  //Project Calls
  updatePublishedOn(rag: RagsModel): Observable<RagsModel> {
    let updatedrag: RagsModel;
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<RagsModel>(this.apiurl + "/Rags", rag, {
      headers: header,
    });
  }
  //Risk Calls
  GetRiskDetailsByProject(projid: string): Observable<RiskModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<RiskModel[]>(
      this.apiurl + "/GetRiskDetailsByProject?ProjectId=" + projid,
      { headers: header }
    );
  }
  GetRiskDetailsByCustomerId(
    custid: string,
    allproj: boolean
  ): Observable<RiskModelExt[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<RiskModelExt[]>(
      this.apiurl +
      "/GetRiskDetailsByCustomerId?customerId=" +
      custid +
      "&allproj=" +
      allproj,
      { headers: header }
    );
  }
  deleteRisk(risk: RiskModel): Observable<RiskModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<RiskModel>(this.apiurl + "/Risk", risk, {
      headers: header,
    });
  }
  getRisk(
    customerId: string,
    probability: number,
    impact: number
  ): Observable<RiskModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<RiskModel[]>(
      this.apiurl +
      "/GetRisk?CustomerId=" +
      customerId +
      "&Impact=" +
      impact +
      "&Probability=" +
      probability,
      { headers: header }
    );
  }
  getRiskByCustomerId(customerId: string): Observable<RiskModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<RiskModel[]>(
      this.apiurl + "/GetRiskByCustomerId?CustomerId=" + customerId,
      { headers: header }
    );
  }

  getIssuesByCustomerId(customerId: string): Observable<IssueModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<IssueModel[]>(
      this.apiurl + "/GetIssuesByCustomerId?CustomerId=" + customerId,
      { headers: header }
    );
  }

  getAllIssuesForCustomer(
    customerId: string,
    allproj: boolean
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetAllIssuesForCustomerId?CustomerId=" +
      customerId +
      "&ProjFlag=" +
      allproj,
      { headers: header }
    );
  }

  GetTasksEventsDetails(
    customerId: string,
    allproj: boolean,
    period: string
  ): Observable<TasksEventsDetails[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<TasksEventsDetails[]>(
      this.apiurl +
      "/GetTasksEventsDetails?customerId=" +
      customerId +
      "&empId=" +
      localStorage.getItem("empid") +
      "&projectId=proj" +
      "&eventTypeId=0" +
      "&period=" +
      period,
      { headers: header }
    );
  }

  getAllFindingsForCustomer(findingmodel): Observable<findingByType[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<findingByType[]>(
      this.apiurl + "/GetAllFindingsForCustomer",
      findingmodel,
      { headers: header }
    );
  }

  getActionItemsDetails(customerId: string, allproj: boolean, viewBy): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetActionItemsDetails?CustomerId=" +
      customerId +
      "&Projflag=" +
      allproj +
      "&viewBy=" +
      viewBy,
      { headers: header }
    );
  }

  getActionItemsforRisk(projectId: string, riskId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetActionItemsDetailsforRisk?projectId=" +
      projectId +
      "&riskId=" +
      riskId,
      { headers: header }
    );
  }
  getEntityGeneralInfo(entity: any, entityType: string): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/GetEntityGeneralInfo?entityType=" + entityType, entity, {
      headers: header,
    });
  }
  getPortfolioName(ProjId: string): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetPortfolioName?ProjId=" + ProjId,
      { headers: header }
    );
  }

  getAllPortfolioName(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetAllPortfolioName", {
      headers: header,
    });
  }

  getIdeasDetails(customerId: string, allproj: boolean): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetIdeasDetails?CustomerId=" +
      customerId +
      "&Projflag=" +
      allproj,
      { headers: header }
    );
  }

  getIdeasDetailsByUser(): Observable<InnovationModelExt[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<InnovationModelExt[]>(
      this.apiurl + "/GetIdeasDetailsByUser",
      { headers: header }
    );
  }
  //scope Calls
  updateScope(scope: projectScopes): Observable<projectScopes> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<projectScopes>(this.apiurl + "/UpdateScope", scope, {
      headers: header,
    });
  }
  //Valueadd Calls
  addValueadd(valueadd: ValueaddModel): Observable<ValueaddModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ValueaddModel>(
      this.apiurl + "/AddValueadds",
      valueadd,
      { headers: header }
    );
  }
  deleteValueadd(valueadd: ValueaddModel): Observable<ValueaddModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ValueaddModel>(this.apiurl + "/Valueadd", valueadd, {
      headers: header,
    });
  }

  getneedFocusCountData(projId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetCountDataForNeedFocus?projId=" + projId,
      { headers: header }
    );
  }
  getNeedFocusDetail(projId, div) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetDetailForNeedFocus?projId=" + projId + "&Div=" + div,
      { headers: header }
    );
  }
  ////ALL SYS
  getProjectIssueById(projId): Observable<IssueModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<IssueModel[]>(
      this.apiurl + "/GetProjectIssueForEWSbyId?projId=" + projId,
      { headers: header }
    );
  }
  getNeedFocus(projId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetProjectNeedFocus?projId=" + projId,
      { headers: header }
    );
  }

  getCustomer(): Observable<CustomerModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<CustomerModel[]>(this.apiurl + "/CustomerList", {
      headers: header,
    });
  }
  getProjectIssueEWS(projectIds, date): Observable<ProjectIssuesEWS[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      projectIds: projectIds,
    });
    return this._http.get<ProjectIssuesEWS[]>(
      this.apiurl + "/GetProjectIssueForEWS?Date=" + date.toDateString(),
      { headers: header }
    );
  }
  getProjectForecast(empId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetProjectForeCast?EmpId=" + empId,
      { headers: header }
    );
  }

  getProjectForeCastForCustomer(custid): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetProjectForeCastForCustomer?CustomerId=" + custid,
      { headers: header }
    );
  }
  getProjectComplainceCount(projectIds): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      projectIds: projectIds,
    });
    return this._http.get<any>(this.apiurl + "/GetComplainceProjectCount", {
      headers: header,
    });
  }
  getProjectComplainceInfoFail(projectIds): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      projectIds: projectIds,
    });
    return this._http.get<any>(this.apiurl + "/GetProjectComplainceInfoFail", {
      headers: header,
    });
  }
  getProjectComplainceInfoPass(projectIds): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      projectIds: projectIds,
    });
    return this._http.get<any>(this.apiurl + "/GetProjectComplainceInfoPass", {
      headers: header,
    });
  }
  getCSATData(projectIds, month, year): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      projectIds: projectIds,
    });
    return this._http.get<any>(
      this.apiurl + "/GetCSATData?month=" + month + "&year=" + year,
      { headers: header }
    );
  }
  deleteReport(report: ReportDetailsModel): Observable<ReportDetailsModel> {
    let apiurl: string = environment.webapiuri + "/DeleteEngagementReport";
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.post<ReportDetailsModel>(apiurl, report, {
      headers: header,
    });
  }
  deleteProcess(report: ProcessModel): Observable<ProcessModel> {
    let apiurl: string = environment.webapiuri + "/DeleteProcessReport";
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ProcessModel>(apiurl, report, { headers: header });
  }
  deleteSucess(report: SuccessModel): Observable<SuccessModel> {
    let apiurl: string = environment.webapiuri + "/DeleteSucessFile";
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<SuccessModel>(apiurl, report, { headers: header });
  }
  updateResourceTitle(emp: EmpInfoModel): Observable<EmpInfoModel> {
    let apiuri: string = environment.webapiuri + "/UpdateResourceTitle";
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<EmpInfoModel>(apiuri, emp, { headers: header });
  }

  getNewResource(projectid): Observable<EmpInfoModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<EmpInfoModel[]>(
      this.apiurl + "/GetNewResource?ProjectId=" + projectid,
      { headers: header }
    );
  }
  getCustomerName(custid): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      custId: custid,
    });
    return this._http.get<any[]>(this.apiurl + "/GetCustomerName", {
      headers: header,
    });
  }

  getNotesForCustomer(custid): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetNotesForCustomer?CustomerId=" + custid,
      { headers: header }
    );
  }

  addHighlight(highlights): Observable<HighlightsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<HighlightsModel>(
      this.apiurl + "/Highlights",
      highlights,
      { headers: header }
    );
  }
  addNote(notes): Observable<HighlightsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<HighlightsModel>(this.apiurl + "/AddNotes", notes, {
      headers: header,
    });
  }

  updateNote(notes): Observable<HighlightsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<HighlightsModel>(
      this.apiurl + "/UpdateNotes",
      notes,
      { headers: header }
    );
  }

  deleteNotes(notes): Observable<HighlightsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<HighlightsModel>(
      this.apiurl + "/DeleteNotes",
      notes,
      { headers: header }
    );
  }

  getCustomerProjectsName(empid, custid): Observable<ProjectDetailsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProjectDetailsModel[]>(
      this.apiurl +
      "/GetCustomerProjectsName?CustomerId=" +
      custid +
      "&EmpId=" +
      empid,
      { headers: header }
    );
  }
  deleteHighlights(highlight: HighlightsModel): Observable<HighlightsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<HighlightsModel>(
      this.apiurl + "/Highlight",
      highlight,
      { headers: header }
    );
  }
  updateContacts(contacts): Observable<ContactsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ContactsModel>(
      this.apiurl + "/UpdateContacts",
      contacts,
      { headers: header }
    );
  }
  getCustomerContacts(custid, empid): Observable<ContactsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ContactsModel[]>(
      this.apiurl +
      "/GetCustomerContacts?CustomerId=" +
      custid +
      "&EmpId=" +
      empid,
      { headers: header }
    );
  }
  getKPIDetailsMonthlyandWeekly(custid, projId, date): Observable<any[]> {
    if (date != "Invalid Date") {
      let header = new HttpHeaders({
        Accept: "application/json",
        token: this._util.AppSettings.token,
        empId: localStorage.getItem("empid"),
      });
      return this._http.get<any[]>(
        this.apiurl +
        "/GetKPIDetailsMonthlyAndWeekly?CustomerId=" +
        custid +
        "&ProjectId=" +
        projId +
        "&date=" +
        date,
        // "&IncludeInternal=" +
        // includeInternal,
        { headers: header }
      );
    } else {
      return Observable.of([]);
    }
  }
  getColorforKPIDetails(custid, projId, date): Observable<any[]> {
    if (date != "Invalid Date") {
      let header = new HttpHeaders({
        Accept: "application/json",
        token: this._util.AppSettings.token,
        empId: localStorage.getItem("empid"),
      });
      return this._http.get<any[]>(
        this.apiurl +
        "/GetColorforSavedKPI?CustomerId=" +
        custid +
        "&ProjectId=" +
        projId +
        "&date=" +
        date,
        { headers: header }
      );
    } else {
      return Observable.of([]);
    }
  }

  addMOMDetails(data): Observable<MOM_DETAIL> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      data: data,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<MOM_DETAIL>(this.apiurl + "/AddMOMDetails", {
      headers: header,
    });
  }
  GetMoMbyMoMId(momId, projId, bool): Observable<MOM> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<MOM>(
      this.apiurl +
      "/GetMOMDetailsbyMOMId?MOMId=" +
      momId +
      "&ProjId=" +
      projId +
      "&IsGAVS=" +
      bool,
      { headers: header }
    );
  }
  getLastUpdatedDate(projId): Observable<Date> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<Date>(
      this.apiurl + "/GetLastUpdatedDate?ProjId=" + projId,
      { headers: header }
    );
  }
  getProcessNew(projId): Observable<ProcessDataModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProcessDataModel>(
      this.apiurl + "/GetProcessNew?ProjId=" + projId,
      { headers: header }
    );
  }
  updateDummy(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/UpdateDummyData", {
      headers: header,
    });
  }
  //Bestpractices
  getBestPracticesbyProjId(projId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetBestPractices?ProjId=" + projId,
      { headers: header }
    );
  }

  getAllBestPracticesForCustomer(CustId, allproj): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    if (CustId == undefined) {
      return;
    }
    return this._http.get<any>(
      this.apiurl +
      "/GetAllBestPracticesForCustomer?Custid=" +
      CustId +
      "&ProjFlag=" +
      allproj,
      { headers: header }
    );
  }
  getLessonLearntbyProjId(projId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetLessonLearnt?ProjId=" + projId,
      { headers: header }
    );
  }
  deleteBestPractices(element): Observable<BestPracticesModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<BestPracticesModel>(
      this.apiurl + "/DeleteBestPractice",
      element,
      { headers: header }
    );
  }
  deleteLessonLearnt(element): Observable<LessonLearntModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<LessonLearntModel>(
      this.apiurl + "/DeleteLessonLearnt",
      element,
      { headers: header }
    );
  }
  getAnalyzedScore(projId, month, year): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetAnalyzedScoreForProject?ProjId=" +
      projId +
      "&Month=" +
      month +
      "&Year=" +
      year,
      { headers: header }
    );
  }
  getEmpNameById(empId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetEmpNameById?EmpId=" + empId, {
      headers: header,
    });
  }
  getBestPracticesFromDescription(processArea) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetBestPracticesByDescription?ProcessArea=" + processArea,
      { headers: header }
    );
  }
  getIdeasFromProcessArea(processArea) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetIdeasByProcessArea?ProcessArea=" + processArea,
      { headers: header }
    );
  }
  getBestPracticeMatrix(status, serviceArea, processArea, deptId, start, end) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetBestPracticeMatrix?Status=" +
      status +
      "&ServiceArea=" +
      serviceArea +
      "&ProcessArea=" +
      processArea +
      "&DeptId=" +
      deptId +
      "&StartDate=" +
      start +
      "&EndDate=" +
      end,
      { headers: header }
    );
  }
  getAllIdeasInnovations(processarea, deptId, startDate, endDate, type) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetAllIdeasInnovations?ProcessArea=" +
      processarea +
      "&DeptId=" +
      deptId +
      "&StartDate=" +
      startDate.toDateString() +
      "&EndDate=" +
      endDate.toDateString() +
      "&IdeaType=" +
      type,
      { headers: header }
    );
  }
  getAllProjectsName() {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetAllProjsName", {
      headers: header,
    });
  }
  getAllProjectsForCustomer(custid): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      custid: custid,
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetAllProjectsForCustomer?CustomerId=" + custid,
      { headers: header }
    );
  }
  getIdentifiedBy(custid): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      custid: custid,
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetIdentifiedBy?custId=" + custid,
      { headers: header }
    );
  }

  getprojectsNameForAPortfolio(portfolio, allproj: boolean): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetprojectsNameForAPortfolio?Portfolio=" +
      portfolio +
      "&Projflag=" +
      allproj,
      { headers: header }
    );
  }

  addBestPracticesByMattrix(matrixdata, statusChange): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      status: statusChange,
    });
    return this._http.post<any[]>(
      this.apiurl + "/AddBestPracticeByMatrix",
      matrixdata,
      { headers: header }
    );
  }

  getTestsStatus(custid, projid, tests): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = { customeR_ID: custid, projecT_ID: projid, testsarray: tests };
    return this._http.post<any[]>(this.apiurl + "/GetTestsStatus", data, {
      headers: header,
    });
  }

  getProcessArea(projId): Observable<string[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetProcessArea?ProjId=" + projId,
      { headers: header }
    );
  }
  getProcessList(): Observable<ProcessModelNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProcessModelNew[]>(this.apiurl + "/GetProcessList", {
      headers: header,
    });
  }

  getAllProcessList(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetAllProcessList", {
      headers: header,
    });
  }

  getAllProcessListByServiceArea(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetAllProcessListByServiceArea",
      { headers: header }
    );
  }

  getProjectLevel(): Observable<Project[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<Project[]>(this.apiurl + "/GetProject", {
      headers: header,
    });
  }

  getServiceAreaList(): Observable<ServiceAreaModelNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ServiceAreaModelNew[]>(
      this.apiurl + "/GetServiceAreaList",
      { headers: header }
    );
  }

  getServiceTowersProjectMapping(
    projectId: string
  ): Observable<ServiceTowersProjectMappingModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ServiceTowersProjectMappingModel[]>(
      this.apiurl +
      "/GetServiceTowersProjectMappingList?ProjectId=" +
      projectId,
      { headers: header }
    );
  }

  getServiceTowersInscopeMappingList(
    projectId: string
  ): Observable<ServiceTowersProjectMappingModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ServiceTowersProjectMappingModel[]>(
      this.apiurl +
      "/GetServiceTowersInscopeMappingList?ProjectId=" +
      projectId,
      { headers: header }
    );
  }


  getServiceAreaProjectMapping(
    projectId: string
  ): Observable<ServiceAreaProjectMappingModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ServiceAreaProjectMappingModel[]>(
      this.apiurl + "/GetServiceAreaProjectMappingList?ProjectId=" + projectId,
      { headers: header }
    );
  }
  Service_UpdateProjectServiceAreaProcessMapping(
    mapping: ProjectServiceAreaProcessMappingModel[]
  ): Observable<ServiceAreaProjectMappingModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ServiceAreaProjectMappingModel[]>(
      this.apiurl + "/UpdateProjectServiceAreaProcessMapping",
      mapping,
      { headers: header }
    );
  }
  UpdateProcessChecklistMapping(
    mapping: ProcessChecklistMappingModel[]
  ): Observable<ServiceAreaProjectMappingModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ServiceAreaProjectMappingModel[]>(
      this.apiurl + "/UpdateProcessChecklistMapping",
      mapping,
      { headers: header }
    );
  }

  UpdateProcessChecklistQuestionsMapping(
    mapping: ProcessChecklistQuestionsMappingModel[]
  ): Observable<ProcessChecklistQuestionsMappingModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ProcessChecklistQuestionsMappingModel[]>(
      this.apiurl + "/UpdateProcessChecklistQuestionsMapping",
      mapping,
      { headers: header }
    );
  }

  GetProcessChecklistMappingList(
    processId: number
  ): Observable<ProcessChecklistMappingModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProcessChecklistMappingModel[]>(
      this.apiurl + "/GetProcessChecklistMappingList?ProcessId=" + processId,
      { headers: header }
    );
  }
  GetProcessChecklistQuestionsMappingList(
    checklistId: number,
    processId: number,
    processAreaId,
    serviceAreaId
  ): Observable<ChecklistQuestionsModelNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ChecklistQuestionsModelNew[]>(
      this.apiurl +
      "/GetProcessChecklistQuestionsMappingList?ChecklistId=" +
      checklistId +
      "&ProcessId=" +
      processId +
      "&ProcessAreaId=" +
      processAreaId +
      "&ServiceAreaId=" +
      serviceAreaId,
      { headers: header }
    );
  }

  GetProjectServiceAreaProcessMapping(
    projId,
    serviceAreaId
  ): Observable<ProjectServiceAreaProcessMappingModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProjectServiceAreaProcessMappingModel[]>(
      this.apiurl +
      "/GetProjectServiceAreaProcessMapping?ProjectId=" +
      projId +
      "&ServiceAreaId=" +
      serviceAreaId,
      { headers: header }
    );
  }
  addAuditSchedule(
    auditSchedule: AuditScheduleModel
  ): Observable<AuditScheduleModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<AuditScheduleModel>(
      this.apiurl + "/AddAuditSchedule",
      auditSchedule,
      { headers: header }
    );
  }
  addServiceAreaProjectMapping(
    mapping
  ): Observable<ServiceAreaProjectMappingModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ServiceAreaProjectMappingModel>(
      this.apiurl + "/AddServiceAreaProjectMapping",
      mapping,
      { headers: header }
    );
  }

  addSQARisk(riskModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/AddSQARisk", riskModel, {
      headers: header,
    });
  }

  updateSQARisk(riskModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/UpdateSQARisk", riskModel, {
      headers: header,
    });
  }

  getProcessAreaList(): Observable<ProcessAreaModelNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProcessAreaModelNew[]>(
      this.apiurl + "/GetProcessAreaList",
      { headers: header }
    );
  }

  getServiceAreaProcessMapping(): Observable<ProcessServiceAreaMapping[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProcessServiceAreaMapping[]>(
      this.apiurl + "/GetServiceAreaProcessMapping",
      { headers: header }
    );
  }

  getObjectivesList(): Observable<ObjectiveNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ObjectiveNew[]>(this.apiurl + "/GetObjectivesList", {
      headers: header,
    });
  }

  GetProcessModelRisksNew(): Observable<ProcessModelRisksNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProcessModelRisksNew[]>(
      this.apiurl + "/GetProcessModelRisksNew",
      { headers: header }
    );
  }

  GetProcessByProcessModel(processModelId) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http
      .get<ProcessModelProcessMapping[]>(
        this.apiurl +
        "/GetProcessByProcessModel?ProcessModelId=" +
        processModelId,
        { headers: header }
      )
      .toPromise();
  }

  GetRiskObjectivesMappingData(): Observable<RiskObjectiveMappingData[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<RiskObjectiveMappingData[]>(
      this.apiurl + "/GetRiskObjectivesMappingData",
      { headers: header }
    );
  }

  getObjectivesbyId(id): Observable<ObjectiveNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ObjectiveNew[]>(
      this.apiurl + "/GetObjectivesbyRiskId?RiskId=" + id,
      { headers: header }
    );
  }

  getRisk2ById(id): Observable<string> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<string>(this.apiurl + "/GetRisk2ById?RiskId=" + id, {
      headers: header,
    });
  }

  GetObjectivesByServiceAreaId(id): Observable<ObjectiveNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ObjectiveNew[]>(
      this.apiurl + "/GetObjectivesByServiceAreaId?ServiceAreaId=" + id,
      { headers: header }
    );
  }

  getControlRisksMappingData(): Observable<ControlRisksMappingModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ControlRisksMappingModel[]>(
      this.apiurl + "/GetControlRisksMappingData",
      { headers: header }
    );
  }

  getClassifications(): Observable<Classify[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<Classify[]>(this.apiurl + "/GetClassifications", {
      headers: header,
    });
  }

  getServiceAreasForProject(projid): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetServiceAreasForProject?projId=" + projid,
      { headers: header }
    );
  }

  GetProcessByServiceArea(
    serviceAreaId
  ): Observable<ProcessServiceAreaMapping[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetProcessByServiceArea?ServiceAreaId=" + serviceAreaId,
      { headers: header }
    );
  }

  GetAllProcessesByServiceArea(
    serviceAreaId
  ): Observable<ProcessServiceAreaMapping[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetAllProcessessForServiceArea?ServiceAreaId=" +
      serviceAreaId,
      { headers: header }
    );
  }

  GetProcessAreaByServiceAreaIdNew(
    serviceAreaId
  ): Observable<ProcessAreaModelNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProcessAreaModelNew[]>(
      this.apiurl +
      "/GetProcessAreafromServiceIdNew?ServiceAreaId=" +
      serviceAreaId,
      { headers: header }
    );
  }

  GetProcessByServiceAreaGrouped(
    serviceAreaId
  ): Observable<ProcessByServiceAreaModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ProcessByServiceAreaModel[]>(
      this.apiurl + "/GetProcessByServiceArea",
      serviceAreaId,
      { headers: header }
    );
  }

  GetProcessByObjective(objectiveId): Observable<ProcessObjectiveMapping[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProcessObjectiveMapping[]>(
      this.apiurl + "/GetProcessByObjective?ObjectiveId=" + objectiveId,
      { headers: header }
    );
  }
  GetProcessByProcessArea(processId): Observable<ProcessModelNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ProcessModelNew[]>(
      this.apiurl + "/GetProcessByProcessArea",
      processId,
      { headers: header }
    );
  }

  getStatusOfRisk(riskId): Observable<boolean> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<boolean>(this.apiurl + "/GetStatusOfRisk", riskId, {
      headers: header,
    });
  }

  getStatusOfControl(controlId): Observable<boolean> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<boolean>(
      this.apiurl + "/GetStatusOfControl",
      controlId,
      { headers: header }
    );
  }

  UpdateProcessMapping(
    processModel: ProcessModelNew,
    processList: ProcessModelNew[]
  ): Observable<ProcessModelNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = { process: processList, procesS_MODEL: processModel };

    return this._http.post<ProcessModelNew[]>(
      this.apiurl + "/UpdateProcessMapping",
      data,
      { headers: header }
    );
  }
  UpdateProcessServiceAreaMapping(
    serviceArea: ServiceAreaModelNew,
    processList: ProcessModelNew[]
  ): Observable<ProcessModelNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = { process: processList, procesS_SERVICE_AREA_NEW: serviceArea };

    return this._http.post<ProcessModelNew[]>(
      this.apiurl + "/UpdateProcessServiceAreaMapping",
      data,
      { headers: header }
    );
  }

  UpdateRiskAndRiskObjMapping(
    objectivesList: ObjectiveNew[],
    riskmodel: ProcessModelRisksNew
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = {
      PROCESS_MODEL_OBJECTIVES_NEW: objectivesList,
      PROCESS_MODEL_RISKS_NEW: riskmodel,
    };

    return this._http.post<any[]>(
      this.apiurl + "/UpdateRiskAndRiskObjMapping",
      data,
      { headers: header }
    );
  }

  UpdateProcessObjectiveMapping(
    objective: ObjectiveNew,
    processList: ProcessModelNew[]
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = {
      process: processList,
      procesS_MODEL_OBJECTIVES_NEW: objective,
    };

    return this._http.post<any>(
      this.apiurl + "/UpdateProcessObjectiveMapping",
      data,
      { headers: header }
    );
  }

  AddServiceAreaNew(
    serviceArea: ServiceAreaModelNew
  ): Observable<ServiceAreaModelNew> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ServiceAreaModelNew>(
      this.apiurl + "/AddServiceAreaNew",
      serviceArea,
      { headers: header }
    );
  }

  UpdateServiceAreaNew(
    serviceArea: ServiceAreaModelNew
  ): Observable<ServiceAreaModelNew> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ServiceAreaModelNew>(
      this.apiurl + "/UpdateServiceAreaNew",
      serviceArea,
      { headers: header }
    );
  }

  DeleteServiceAreaNew(
    serviceArea: ServiceAreaModelNew
  ): Observable<ServiceAreaModelNew> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ServiceAreaModelNew>(
      this.apiurl + "/DeleteServiceAreaNew",
      serviceArea,
      { headers: header }
    );
  }

  DeleteServiceAreaProjectMapping(
    serviceArea: ProjectServiceAreaProcessMappingModel
  ): Observable<ProjectServiceAreaProcessMappingModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ProjectServiceAreaProcessMappingModel>(
      this.apiurl + "/DeleteServiceAreaProjectMapping",
      serviceArea,
      { headers: header }
    );
  }

  AddObjectiveNew(objective: ObjectiveNew): Observable<ObjectiveNew> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ObjectiveNew>(
      this.apiurl + "/AddObjectiveNew",
      objective,
      { headers: header }
    );
  }

  GetRiskCategory1List(): Observable<RiskCategory[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<RiskCategory[]>(
      this.apiurl + "/GetRiskCategory1List",
      { headers: header }
    );
  }

  GetRiskCategory2List(risk1Id: number): Observable<RiskCategory2[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<RiskCategory2[]>(
      this.apiurl + "/GetRiskCategory2List?RiskId1=" + risk1Id,
      { headers: header }
    );
  }

  GetAllRiskCategory2List(): Observable<RiskCategory2[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<RiskCategory2[]>(
      this.apiurl + "/GetAllRiskCategory2List",
      { headers: header }
    );
  }

  GetAllRiskCategory3List(): Observable<RiskCategory2[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<RiskCategory2[]>(
      this.apiurl + "/GetAllRiskCategory3List",
      { headers: header }
    );
  }

  GetRiskCategory3List(risk2Id: number): Observable<RiskCategory2[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<RiskCategory2[]>(
      this.apiurl + "/GetRiskCategory3List?RiskId2=" + risk2Id,
      { headers: header }
    );
  }

  GetRiskOwnersList(): Observable<RiskOwner[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<RiskOwner[]>(this.apiurl + "/GetRiskOwnersList", {
      headers: header,
    });
  }

  UpdateProcessArea(
    processArea: ProcessAreaModelNew
  ): Observable<ProcessAreaModelNew> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ProcessAreaModelNew>(
      this.apiurl + "/UpdateProcessAreaNew",
      processArea,
      { headers: header }
    );
  }
  AddProcessAreaNew(
    processArea: ProcessAreaModelNew
  ): Observable<ProcessAreaModelNew> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ProcessAreaModelNew>(
      this.apiurl + "/AddProcessAreaNew",
      processArea,
      { headers: header }
    );
  }

  DeleteProcessArea(
    processArea: ProcessAreaModelNew
  ): Observable<ProcessAreaModelNew> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ProcessAreaModelNew>(
      this.apiurl + "/DeleteProcessAreaNew",
      processArea,
      { headers: header }
    );
  }

  UpdateProcess(processArea: ProcessModelNew): Observable<ProcessModelNew> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ProcessModelNew>(
      this.apiurl + "/UpdateProcessNew",
      processArea,
      { headers: header }
    );
  }
  DeleteProcess(process: ProcessModelNew): Observable<ProcessModelNew> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ProcessModelNew>(
      this.apiurl + "/DeleteProcessNew",
      process,
      { headers: header }
    );
  }
  getProcessAreaIMS(): Observable<string[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetProcessAreaIMS", {
      headers: header,
    });
  }
  getProcessAreaADM(): Observable<string[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetProcessAreaADM", {
      headers: header,
    });
  }
  getIdeatype(): Observable<string[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetIdeaType", {
      headers: header,
    });
  }
  addInnovationsByMattrix(matrixdata, statusChange): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      status: statusChange,
    });
    return this._http.post<any[]>(
      this.apiurl + "/AddInnovationsByMatrix",
      matrixdata,
      { headers: header }
    );
  }
  getSpocDetails(): Observable<EmpInfoModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<EmpInfoModel[]>(this.apiurl + "/GetQSpocDetail", {
      headers: header,
    });
  }
  // getEmpProjList(empId: number): Observable<any> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<any>(this.apiurl + '/GetEmployeeProjectList?EmpId=' + empId, { headers: header });
  // }
  // getKPIDetailsWeekly(custid, projId,date): Observable<any[]>
  // {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token });
  //   return this._http.get<any[]>(this.apiurl + '/GetKPIDetailsWeekly?CustomerId=' + custid + '&ProjectId=' + projId +'&date=' + date.toDateString(), { headers: header });
  // }
  getPieDataforCSAT(quarter, year): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetCSATForQuarter?Quarter=" + quarter + "&Year=" + year,
      { headers: header }
    );
  }
  // getTrendChartforCSAT(number, year): Observable<any> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<any>(this.apiurl + '/GetCSATForMultipleQuarter?Slider=' + number + '&Year=' + year, { headers: header });
  // }
  // getTrendChartforNPS(number, year): Observable<any> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<any>(this.apiurl + '/GetNPSForMultipleQuarter?Slider=' + number + '&Year=' + year, { headers: header });
  // }
  // getCSATforProj(year): Observable<any> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<any>(this.apiurl + '/GetCSATProjWise?Year=' + year, { headers: header });
  // }
  // getCSATHeatMap(quart, year): Observable<any> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<any>(this.apiurl + '/GetHeatMapForCSAT?Year=' + year + '&Quarter=' + quart, { headers: header });
  // }
  // getprojNMbyId(): Observable<any> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<any>(this.apiurl + '/GetProjName', { headers: header });
  // }
  // getSurveyData(number, year): Observable<any> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<any>(this.apiurl + '/GetCSATSurveyResponse?Slider=' + number + '&Year=' + year, { headers: header });
  // }
  // getAuditorList(): Observable<EmpInfoModel> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<EmpInfoModel>(this.apiurl + '/GetAuditorList', { headers: header });
  // }
  // getFrequencyAudit(): Observable<EmpInfoModel> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<EmpInfoModel>(this.apiurl + '/GetFrequencyAudit', { headers: header });
  // }
  // getAuditType(): Observable<any> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<any>(this.apiurl + '/GetAuditType', { headers: header });
  // }
  // getAuditSupportFunctions(): Observable<any> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<any>(this.apiurl + '/GetAuditSupportFunctions', { headers: header });
  // }
  // getScopeofAudit(): Observable<any> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<any>(this.apiurl + '/GetScopeOfAudit', { headers: header });
  // }
  // getStatusofAudit(): Observable<any> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<any>(this.apiurl + '/GetStatusOfAudit', { headers: header });
  // }
  // getInnovationsForProject(custId, projIds, year, quarter, radioOption): Observable<any> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<any>(this.apiurl + '/GetInnovationsForProject?CustomerId=' + custId + '&ProjIds=' + projIds + '&Year=' + year + '&Quarter=' + quarter + '&RadioOption=' + radioOption, { headers: header });
  // }
  // getGavsServices(): Observable<any> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<any>(this.apiurl + '/GetGavsServices', { headers: header });
  // }
  // GetAnalyzedInsights(custId, projId, dumpType, startDate, endDate): Observable<any> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<any>(this.apiurl + '/GetAnalyzedInsights?CustomerId=' + custId + '&ProjectId=' + projId + '&ReportType=' + dumpType + '&StartDate=' + startDate.toDateString() + '&EndDate=' + endDate.toDateString(), { headers: header });
  // }
  // getInsightDetails(element): Observable<any> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.post<any>(this.apiurl + '/GetComplianceDetailsforInsights', element, { headers: header });
  // }

  getTrendChartforCSAT(number, year): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetCSATForMultipleQuarter?Slider=" +
      number +
      "&Year=" +
      year,
      { headers: header }
    );
  }
  getTrendChartforNPS(number, year): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetNPSForMultipleQuarter?Slider=" +
      number +
      "&Year=" +
      year,
      { headers: header }
    );
  }
  getCSATforProj(year): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetCSATProjWise?Year=" + year, {
      headers: header,
    });
  }
  getCSATHeatMap(quart, year): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetHeatMapForCSAT?Year=" + year + "&Quarter=" + quart,
      { headers: header }
    );
  }

  getNPScoreData(quart): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetNPScoreData?Quarter=" + quart,
      { headers: header }
    );
  }

  getNPScoreDataDetails(quart, pQuarter, cQuarter, custIds): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/getNPScoreDataDetails?Quarter=" +
      quart +
      "&pQuarter=" +
      pQuarter +
      "&cQuarter=" +
      cQuarter +
      "&custIds=" +
      custIds,
      { headers: header }
    );
  }

  getNPSScoreDataRange(quart, pQuarter, cQuarter, custIds): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetNPSScoreDataRange?Quarter=" +
      quart +
      "&pQuarter=" +
      pQuarter +
      "&cQuarter=" +
      cQuarter +
      "&custIds=" +
      custIds,
      { headers: header }
    );
  }

  getprojNMbyId(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetProjName", {
      headers: header,
    });
  }
  getSurveyData(number, year): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetCSATSurveyResponse?Slider=" + number + "&Year=" + year,
      { headers: header }
    );
  }

  getFrequencyAudit(): Observable<EmpInfoModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<EmpInfoModel>(this.apiurl + "/GetFrequencyAudit", {
      headers: header,
    });
  }
  getAuditType(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetAuditType", {
      headers: header,
    });
  }
  getAuditSupportFunctions(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetAuditSupportFunctions", {
      headers: header,
    });
  }
  getScopeofAudit(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetScopeOfAudit", {
      headers: header,
    });
  }
  getStatusofAudit(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetStatusOfAudit", {
      headers: header,
    });
  }
  getAllAccountHealth(custId, projId, month, year): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetAccountHealth?customerId=" +
      custId +
      "&projectIds=" +
      projId +
      "&month=" +
      month +
      "&year=" +
      year,
      {
        headers: header,
      }
    );
  }
  getInnovationsForProject(
    custId,
    projIds,
    year,
    quarter,
    radioOption
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetInnovationsForProject?CustomerId=" +
      custId +
      "&ProjIds=" +
      projIds +
      "&Year=" +
      year +
      "&Quarter=" +
      quarter +
      "&RadioOption=" +
      radioOption,
      { headers: header }
    );
  }
  getGavsServices(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetGavsServices", {
      headers: header,
    });
  }
  GetAnalyzedInsights(
    custId,
    projId,
    dumpType,
    startDate,
    endDate
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetAnalyzedInsights?CustomerId=" +
      custId +
      "&ProjectId=" +
      projId +
      "&ReportType=" +
      dumpType +
      "&StartDate=" +
      startDate.toDateString() +
      "&EndDate=" +
      endDate.toDateString(),
      { headers: header }
    );
  }
  getInsightDetails(element): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetComplianceDetailsforInsights",
      element,
      { headers: header }
    );
  }
  getProcessModel(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetProcessModel", {
      headers: header,
    });
  }

  getProcessModelList(): Observable<ProcessModelModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProcessModelModel[]>(
      this.apiurl + "/GetProcessModelList",
      { headers: header }
    );
  }

  getStatusList(): Observable<Req_StatusModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<Req_StatusModel[]>(
      this.apiurl + "/GetRequirementReferenceStatusList",
      { headers: header }
    );
  }

  GetAllProcessProcessModelMapping(): Observable<ProcessModelProcessMapping[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProcessModelProcessMapping[]>(
      this.apiurl + "/GetAllProcessProcessModelMapping",
      { headers: header }
    );
  }

  getAllProcessObjectiveMapping(): Observable<ProcessObjectiveMapping[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProcessObjectiveMapping[]>(
      this.apiurl + "/GetAllProcessObjectiveMapping",
      { headers: header }
    );
  }

  getControlCategoryByModelId(id): Observable<ControlCategory[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ControlCategory[]>(
      this.apiurl + "/GetControlCategoryByModelId?ModelId=" + id,
      { headers: header }
    );
  }

  GetControlReferenceByCategoryId(id): Observable<ControlReference[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ControlReference[]>(
      this.apiurl + "/GetControlReferenceByCategoryId?CategoryId=" + id,
      { headers: header }
    );
  }

  getAuditStatusList() {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetAuditStatusList", {
      headers: header,
    });
  }

  getFindingsTypeList() {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetFindingsTypeList", {
      headers: header,
    });
  }

  addStatusValues(
    statusTitle,
    metstatusValues,
    nmetstatusValues,
    nastatusValues
  ) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = {
      Statusheader: statusTitle,
      MetStatusValues: metstatusValues,
      NotMetStatusValues: nmetstatusValues,
      NAStatusValues: nastatusValues,
    };

    return this._http.post<any>(this.apiurl + "/AddChecklistStatusList", data, {
      headers: header,
    });
  }

  addNewWeightage(weightageModel: AuditCheckListWeightage) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/AddNewWeightage",
      weightageModel,
      { headers: header }
    );
  }

  GetProcessModelObjectives(): Observable<ProcessSQAObjectiveNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProcessSQAObjectiveNew[]>(
      this.apiurl + "/GetProcessModelObjectives",
      { headers: header }
    );
  }

  getServiceArea(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetServiceArea", {
      headers: header,
    });
  }
  getServiceAreaforModel(models): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetServiceAreaForModel",
      models,
      { headers: header }
    );
  }
  getProcessModelDescription(
    customerId,
    projectId,
    serviceArea
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      customerid: customerId.toString(),
      projectId: projectId,
    });
    return this._http.post<any>(
      this.apiurl + "/GetProcessDescription",
      serviceArea,
      { headers: header }
    );
  }
  getProcessModelandServiceAreaDD(customerId, projectId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      customerid: customerId.toString(),
      projectId: projectId,
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetAuditExecutionModelandCatalogDD?CustomerId=" +
      customerId +
      "&ProjectId=" +
      projectId,
      { headers: header }
    );
  }
  getTestsReport(customerId, projectId, audittitle): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      customerid: customerId.toString(),
      projectId: projectId,
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetTestsReport?CustomerId=" +
      customerId +
      "&ProjectId=" +
      projectId +
      "&AuditTitle=" +
      audittitle,
      { headers: header }
    );
  }

  sendMailToCSM(
    ProjectId: string,
    CustomerId: string,
    BestPractice: BestPracticesModel
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = {
      projecT_ID: ProjectId,
      customeR_ID: CustomerId,
      besT_PRACTICE: BestPractice,
    };
    return this._http.post<any>(
      this.apiurl + "/SendMailToCSMForBestPractice",
      data,
      { headers: header }
    );
  }

  getProcessTests(customerId, projectId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      customerid: customerId.toString(),
      projectId: projectId,
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetAuditProcessTests?CustomerId=" +
      customerId +
      "&ProjectId=" +
      projectId,
      { headers: header }
    );
  }

  getTestsData(
    customerId: string,
    projectId: string,
    serviceareas: string[]
  ): Observable<TestViewModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = {
      custid: customerId,
      projid: projectId,
      servicearea: serviceareas,
    };
    return this._http.post<TestViewModel[]>(
      this.apiurl + "/GetTestsData",
      data,
      { headers: header }
    );
  }
  getAuditControlandTestCountReport(
    projectId,
    startDate,
    custid,
    title
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetAuditControlandTestCountReport?ProjectId=" +
      projectId +
      "&StartDate=" +
      startDate.toDateString() +
      "&CustomerId=" +
      custid +
      "&AuditTitle=" +
      title,
      { headers: header }
    );
  }

  getProcessModelSummary(
    projectId,
    startDate,
    audittitle,
    custid
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetProcessModelSummary?ProjectId=" +
      projectId +
      "&StartDate=" +
      startDate.toDateString() +
      "&AuditTitle=" +
      audittitle +
      "&CustomerId=" +
      custid,
      { headers: header }
    );
  }

  checkIsEvaluated(auditdata: AuditExecutionModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/CheckIsEvaluated", auditdata, {
      headers: header,
    });
  }
  getAuditExecutionReport(projectId, startDate): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetAuditExecutionReport?ProjectId=" +
      projectId +
      "&StartDate=" +
      startDate.toString(),
      { headers: header }
    );
  }

  getSavedAudits(customerId, projectId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetSavedAudits?CustomerId=" +
      customerId +
      "&ProjectId=" +
      projectId,
      { headers: header }
    );
  }
  getSavedCheckListAudits(customerId, projectId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetSavedCheckListAudits?CustomerId=" +
      customerId +
      "&ProjectId=" +
      projectId,
      { headers: header }
    );
  }
  getCheckListById(auditId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/LoadSavedCheckListAudits?AuditId=" + auditId,
      { headers: header }
    );
  }
  getPieDataForPortfolio(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetPieDataForPortFolio", {
      headers: header,
    });
  }
  // GetHealthReportDetailed(startdate, enddate): Observable<TreeHealthReportCustomer[]> {
  //   let header = new HttpHeaders({ 'Accept': 'application/json', 'token': this._util.AppSettings.token, 'empId': localStorage.getItem('empid') });
  //   return this._http.get<TreeHealthReportCustomer[]>(this.apiurl + '/GetHealthReportDetailed?StartDate=' + startdate + '&EndDate=' + enddate, { headers: header });
  // }
  GetHealthReportDetailedProject(
    custId,
    projId,
    startdate,
    enddate
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      custId: custId,
      projId: projId,
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetHealthReportDetailedProject?StartDate=" +
      startdate +
      "&EndDate=" +
      enddate,
      { headers: header }
    );
  }
  GetHealthReportDetailedPie(
    custId,
    projId,
    startdate,
    enddate
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      custId: custId,
      projId: projId,
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetHealthReportDetailedPie?StartDate=" +
      startdate +
      "&EndDate=" +
      enddate,
      { headers: header }
    );
  }
  GetHealthReportMonthlyLine(
    custId,
    projId,
    startdate,
    enddate
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      custId: custId,
      projId: projId,
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetHealthReportMonthlyLine?StartDate=" +
      startdate +
      "&EndDate=" +
      enddate,
      { headers: header }
    );
  }
  SendCheckListMailToAuditee(checklistData: any) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/SendCheckListMailToAuditee",
      checklistData,
      { headers: header }
    );
  }
  SendCheckListFindingCAPtoAuditor(checklistData: any) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/SendCheckListFindingCAPtoAuditor",
      checklistData,
      { headers: header }
    );
  }
  GetLineReportMonthly(custId, projId, startdate, enddate): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      custId: custId,
      projId: projId,
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetLineReportMonthly?StartDate=" +
      startdate +
      "&EndDate=" +
      enddate,
      { headers: header }
    );
  }
  getStageColor(checkpoints: ChecklisExecutionDetails[]) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(this.apiurl + "/GetStageColor", checkpoints, {
      headers: header,
    });
  }
  GetHealthReportOverallLine(
    custId,
    projId,
    startdate,
    enddate
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      custId: custId,
      projId: projId,
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetHealthReportOverallLine?StartDate=" +
      startdate +
      "&EndDate=" +
      enddate,
      { headers: header }
    );
  }
  GetHealthReportOverallPie(
    custId,
    projId,
    startdate,
    enddate
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      custId: custId,
      projId: projId,
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetHealthReportOverallPie?StartDate=" +
      startdate +
      "&EndDate=" +
      enddate,
      { headers: header }
    );
  }
  //Parameters
  GetParametersByTypes(types: string[]): Observable<ParameterModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ParameterModel[]>(
      this.apiurl + "/GetParametersByTypes",
      types,
      { headers: header }
    );
  }
  GetParametersByType(type: string): Observable<ParameterModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ParameterModel[]>(
      this.apiurl + "/GetParametersByType?type=" + type,
      { headers: header }
    );
  }
  //Customer Success Survey

  GetCSSSurveyQuestions(code: string, showQualitativeFeedback: boolean, showCSSFields: boolean): Observable<BatchCustomerAndQuestions> {
    let header = new HttpHeaders({
      Accept: "application/json",
      //token: this._util.AppSettings.token,
      //empId: localStorage.getItem("empid"),
    });
    return this._http.get<BatchCustomerAndQuestions>(
      this.apiurl_auth + "GetCSSSurveyQuestions?Code=" + code +
      "&showQualitativeFeedback=" + showQualitativeFeedback + "&showCSSFields=" + showCSSFields,
      { headers: header }
    );
  }

  SaveCSSSurveyAnswers(replies: BatchCustomerAndQuestions, empId: string, saveAsDraft: boolean, meetingDate: Date, isCSMNotified: boolean): Observable<BatchCustomerAndQuestions> {
    let header = new HttpHeaders({ Accept: "application/json" });
    let formattedMeetingDate;
    if (meetingDate != null && meetingDate != undefined) {
      formattedMeetingDate = meetingDate.toISOString();
    }

    return this._http.post<BatchCustomerAndQuestions>(
      this.apiurl_auth + "SaveCSSSurveyAnswers?empId=" + empId +
      "&saveAsDraft=" + saveAsDraft +
      "&isCSMNotified=" + isCSMNotified + "&meetingDate=" + formattedMeetingDate,
      replies,
      { headers: header }
    );
  }

  getAuditorListNew(custid, projid): Observable<EmpInfoModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<EmpInfoModel[]>(
      this.apiurl +
      "/GetAuditorListByCertifiedStandards?CustomerId=" +
      custid +
      "&ProjectId=" +
      projid,
      {
        headers: header,
      }
    );
  }

  getAuditorList(): Observable<EmpInfoModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<EmpInfoModel[]>(this.apiurl + "/GetAuditorList", {
      headers: header,
    });
  }

  getAuditeeDetails(
    customerId,
    projectId,
    includeCustomer: boolean = true
  ): Observable<EmpInfoModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<EmpInfoModel[]>(
      this.apiurl +
      "/GetAuditeeDetails?CustomerId=" +
      customerId +
      "&ProjectId=" +
      projectId +
      "&includeCustomer=" +
      includeCustomer,
      { headers: header }
    );
  }

  getCCListForChecklist(projectId): Observable<EmpInfoModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<EmpInfoModel[]>(
      this.apiurl + "/GetCCListForChecklist?&custId=" + projectId,
      { headers: header }
    );
  }
  getCustomerIdForChecklist(customerId): Observable<EmpInfoModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetCustomerListForChecklist?&customerId=" + customerId,
      {
        headers: header,
      }
    );
  }

  getPlannedAudits(customerId, projectId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetPlannedAudits?CustomerId=" +
      customerId +
      "&ProjectId=" +
      projectId,
      { headers: header }
    );
  }
  getTasksForFMEA(customerId, projectId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetTasksForFMEA?CustomerId=" +
      customerId +
      "&ProjectId=" +
      projectId,
      { headers: header }
    );
  }

  ApproveFailureModeMaster(fmeaModel: any[]): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/ApproveFailureModeMaster",
      fmeaModel,
      { headers: header }
    );
  }

  UpdateStatusofFailures(fmeaData: any[]): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/UpdateStatusofFailures",
      fmeaData,
      { headers: header }
    );
  }

  RejectFailureModeMaster(fmeaModel: any[]): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/RejectFailureModeMaster",
      fmeaModel,
      { headers: header }
    );
  }

  getFMEAStage2DataByTask(taskId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetFMEAStage2DataByTask?TaskId=" + taskId,
      { headers: header }
    );
  }

  SaveAuditChecklistDetails(
    checklistDatanew: ChecklistExecutionViewModel
  ): Observable<ChecklistExecutionViewModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ChecklistExecutionViewModel>(
      this.apiurl + "/SaveAuditChecklistDetails",
      checklistDatanew,
      { headers: header }
    );
  }

  getAuditDetails(
    customerId,
    projectId,
    serviceareas,
    title,
    startdate,
    enddate,
    auditorname,
    auditeenames
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = {
      custid: customerId,
      projid: projectId,
      serviceareas: serviceareas,
      audittitle: title,
      startdate: startdate,
      enddate: enddate,
      auditorname: auditorname,
      auditessname: auditeenames,
    };
    return this._http.post<any>(this.apiurl + "/GetAuditDetails", data, {
      headers: header,
    });
  }

  getCheckListDataForProj(customerId, projectId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetCheckListAuditforProject?CustomerId=" +
      customerId +
      "&ProjectId=" +
      projectId,
      { headers: header }
    );
  }

  getCheckListDataForProjNew(auditData): Observable<ChecklistNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ChecklistNew[]>(
      this.apiurl + "/GetCheckPointsByAudit",
      auditData,
      { headers: header }
    );
  }
  getApplicableProcessAreaforServiceId(serviceaAreaId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      serviceArea: serviceaAreaId,
    });
    return this._http.get<any>(this.apiurl + "/GetProcessAreafromServiceId", {
      headers: header,
    });
  }
  getGavsServiceArea(areaId) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      serviceArea: areaId,
    });
    return this._http.get<any>(this.apiurl + "/GetGavsServiceArea", {
      headers: header,
    });
  }
  getFindingStatus(checkList): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetFindingStatusDetails",
      checkList,
      { headers: header }
    );
  }
  saveAuditeeAcceptanceStatus(
    auditeeStatus: auditeE_ACCEPTANCE[]
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/SaveAuditeeAcceptanceStatus",
      auditeeStatus,
      { headers: header }
    );
  }

  saveAuditorAcceptanceStatus(
    auditorStatus: auditeE_ACCEPTANCE[]
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/SaveAuditorAcceptanceStatus",
      auditorStatus,
      { headers: header }
    );
  }

  getAuditCauses(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetAuditCauses", {
      headers: header,
    });
  }
  getAllAuditeeResponses(assessmentId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetAllAuditeeResponses?assessmentId=" +
      assessmentId.toString(),
      {
        headers: header,
      }
    );
  }
  enableChecklistStatus(checklist): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/EnableChecklistStatus",
      checklist,
      {
        headers: header,
      }
    );
  }
  getAuditFindingsCappa(auditcapa, causeIds, isFromFinding): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      causeIds: causeIds,
      isFromFinding: isFromFinding.toString(),
    });
    return this._http.post<any>(
      this.apiurl + "/GetAuditFindingCappas",
      auditcapa,
      { headers: header }
    );
  }
  //addprocessmodel
  addProcessModel(auditModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/AddProcessModel", auditModel, {
      headers: header,
    });
  }

  addControlCategory(category): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/AddControlCategory", category, {
      headers: header,
    });
  }

  getAllControlCategories(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetAllControlCategories", {
      headers: header,
    });
  }

  getAllControlReferences(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetAllControlReferences", {
      headers: header,
    });
  }

  addControlReference(reference): Observable<ControlReference[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ControlReference[]>(
      this.apiurl + "/AddControlReference",
      reference,
      { headers: header }
    );
  }

  addControlAndRisksMapping(
    controlnew: ProcessModelControlnew,
    risks: ProcessModelRisksNew[]
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let data = {
      procesS_MODEL_CONTROL_NEW: controlnew,
      procesS_MODEL_RISKS_NEW: risks,
    };
    return this._http.post<any>(
      this.apiurl + "/AddControlAndRisksMapping",
      data,
      { headers: header }
    );
  }

  addProcessModelObjective(auditModel): Observable<ProcessSQAObjectiveNew> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ProcessSQAObjectiveNew>(
      this.apiurl + "/AddProcessModelObjectives",
      auditModel,
      { headers: header }
    );
  }
  deleteProcessModel(auditModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/DeleteProcessModel",
      auditModel,
      { headers: header }
    );
  }

  deleteRiskObjectiveMapping(riskobjmodel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/DeleteRiskObjectiveMapping",
      riskobjmodel,
      { headers: header }
    );
  }

  deleteControlRisksmapping(controlRiskModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/DeleteControlRisksmapping",
      controlRiskModel,
      { headers: header }
    );
  }

  deleteRiskControlMappingByRiskId(riskid): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/DeleteRiskControlMappingByRiskId",
      riskid,
      { headers: header }
    );
  }

  deleteControlTestMappingByControlId(controlid): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/DeleteControlTestMappingByControlId",
      controlid,
      { headers: header }
    );
  }

  deleteProcessModelObjective(auditModel): Observable<ProcessSQAObjectiveNew> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ProcessSQAObjectiveNew>(
      this.apiurl + "/DeleteProcessModelObjective",
      auditModel,
      { headers: header }
    );
  }
  updateProcessModel(auditModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/UpdateProcessModel",
      auditModel,
      { headers: header }
    );
  }
  addProcessArea(auditModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/AddProcessArea", auditModel, {
      headers: header,
    });
  }
  deleteProcessArea(auditModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/DeleteProcessArea",
      auditModel,
      { headers: header }
    );
  }

  deleteProcessModelProcessMapping(modelid): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/DeleteProcessModelProcessMapping",
      modelid,
      { headers: header }
    );
  }

  updateProcessArea(auditModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/UpdateProcessArea",
      auditModel,
      { headers: header }
    );
  }

  addTestControls(testcontroldata: TestControlsMapping): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/AddTestControls",
      testcontroldata,
      { headers: header }
    );
  }

  updateTestControls(testcontroldata: TestControlsMapping): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/UpdateTestControls",
      testcontroldata,
      { headers: header }
    );
  }

  updateControlAndRisksMapping(
    controlriskData: ControlRisksMappingModel
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/UpdateControlAndRisksMapping",
      controlriskData,
      { headers: header }
    );
  }

  addProcesses(auditModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/AddSQAProcess", auditModel, {
      headers: header,
    });
  }
  deleteProcesses(auditModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/DeleteSQAProcess", auditModel, {
      headers: header,
    });
  }
  deleteTestControls(deletedata): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/DeleteTestControls",
      deletedata,
      { headers: header }
    );
  }
  updateProcesses(auditModel): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/UpdateSQAProcess", auditModel, {
      headers: header,
    });
  }
  getProcessAreaForModelandSA(modelId, serviceAreaId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetProcessAreaforSA?ModelId=" +
      modelId +
      "&ServiceAreaId=" +
      serviceAreaId,
      { headers: header }
    );
  }
  getProcessAreaandProcessForSA(
    custId,
    projId,
    modelId,
    serviceAreaId
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetProcessAreaandProcessforSA?CustomerId=" +
      custId +
      "&ProjectId=" +
      projId +
      "&ModelId=" +
      modelId +
      "&ServiceAreaId=" +
      serviceAreaId,
      { headers: header }
    );
  }
  getProcessSQA(areaId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetProcessforAreaId?AreaId=" + areaId,
      { headers: header }
    );
  }
  //getprocessmodel
  GetProcessModel(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetProcessModel", {
      headers: header,
    });
  }
  getControlList(): Observable<ProcessModelControlnew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProcessModelControlnew[]>(
      this.apiurl + "/GetControlList",
      { headers: header }
    );
  }

  getTestsControlData(): Observable<TestControlsMapping[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<TestControlsMapping[]>(
      this.apiurl + "/GetTestsControlData",
      { headers: header }
    );
  }

  getQuestionWeightage(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetQuestionWeightage", {
      headers: header,
    });
  }
  getQuestionCategory(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetQuestionCategory", {
      headers: header,
    });
  }
  getModelClauses(modelId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetModelClauses?ProcessModelId=" + modelId,
      { headers: header }
    );
  }

  GetPreviewChecklist(ChecklistId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetPreviewChecklist?ChecklistId=" + ChecklistId,
      { headers: header }
    );
  }

  saveCheckListQuestions(checklistSetup) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/SaveCheckListQuestions",
      checklistSetup,
      { headers: header }
    );
  }
  getSavedCheckListQuestions(checklist): Observable<ChecklistQuestionsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ChecklistQuestionsModel>(
      this.apiurl + "/GetSavedQuestions",
      checklist,
      { headers: header }
    );
  }
  getApplicableProcess(custId, projId): Observable<ChecklistQuestionsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ChecklistQuestionsModel>(
      this.apiurl +
      "/GetApplicableProcessForProject?CustomerId=" +
      custId +
      "&ProjectId=" +
      projId,
      { headers: header }
    );
  }
  getModelListFromPSPD(custId, projId) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ChecklistQuestionsModel>(
      this.apiurl +
      "/GetModelListFromPSPD?CustomerId=" +
      custId +
      "&ProjectId=" +
      projId,
      { headers: header }
    );
  }
  getSAListFromPSPD(custId, projId, modelId) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ChecklistQuestionsModel>(
      this.apiurl +
      "/GetServiceAreaListfromModel?CustomerId=" +
      custId +
      "&ProjectId=" +
      projId +
      "&ModelId=" +
      modelId,
      { headers: header }
    );
  }
  getCheckPointHistory(custId, projId): Observable<ChecklistQuestionsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ChecklistQuestionsModel[]>(
      this.apiurl +
      "/GetCheckPointHistory?CustomerId=" +
      custId +
      "&ProjectId=" +
      projId,
      { headers: header }
    );
  }
  getChecklistQuestionList(
    checklistid
  ): Observable<ChecklistQuestionsModelNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ChecklistQuestionsModelNew[]>(
      this.apiurl + "/GetChecklistQuestionList",
      checklistid,
      { headers: header }
    );
  }

  VerifyChecklistInAudit(checklistid) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/VerifyChecklistInAudit?checklistid=" + checklistid,
      { headers: header }
    );
  }

  AddChecklistQuestion(
    question: ChecklistQuestionsModelNew,
    processId: number,
    processAreaId: number,
    serviceAreaId: number
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    let data = {
      procesS_ID: processId,
      servicE_AREA_ID: serviceAreaId,
      procesS_AREA_ID: processAreaId,
      question: question,
    };
    return this._http.post<any>(this.apiurl + "/AddChecklistQuestion", data, {
      headers: header,
    });
  }
  UpdateChecklistQuestion(
    question: ChecklistQuestionsModelNew,
    processId: number,
    processAreaId: number,
    serviceAreaId: number
  ): Observable<ChecklistQuestionsModelNew> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    let data = {
      procesS_ID: processId,
      servicE_AREA_ID: serviceAreaId,
      procesS_AREA_ID: processAreaId,
      question: question,
    };
    return this._http.post<ChecklistQuestionsModelNew>(
      this.apiurl + "/UpdateChecklistQuestion",
      data,
      { headers: header }
    );
  }
  DeleteChecklistQuestion(
    question: checklistquestionInput
  ): Observable<ChecklistQuestionsModelNew> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ChecklistQuestionsModelNew>(
      this.apiurl + "/DeleteChecklistQuestion",
      question,
      { headers: header }
    );
  }
  getChecklistList(): Observable<ChecklistModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ChecklistModel[]>(this.apiurl + "/GetChecklistList", {
      headers: header,
    });
  }

  getMaturityLevel() {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<PM_MATURITYLEVEL_MAPPING[]>(
      this.apiurl + "/GetMaturityLevel",
      { headers: header }
    );
  }
  getChecklistApproversList() {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetChecklistApproversList", {
      headers: header,
    });
  }

  addChecklist(checklist: ChecklistModel): Observable<ChecklistModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ChecklistModel>(
      this.apiurl + "/AddChecklist",
      checklist,
      { headers: header }
    );
  }

  updateChecklist(checklist: ChecklistModel): Observable<ChecklistModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ChecklistModel>(
      this.apiurl + "/UpdateChecklist",
      checklist,
      { headers: header }
    );
  }

  approveChecklist(checklists: ChecklistModel[]): Observable<ChecklistModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ChecklistModel[]>(
      this.apiurl + "/ApproveChecklist",
      checklists,
      { headers: header }
    );
  }

  deleteChecklist(checklist: ChecklistModel): Observable<ChecklistModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ChecklistModel>(
      this.apiurl + "/DeleteChecklist",
      checklist,
      { headers: header }
    );
  }

  reviseChecklist(
    checklist: ChecklistModel,
    oldchecklistid: number
  ): Observable<ChecklistModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ChecklistModel>(
      this.apiurl + "/ReviseChecklist?ChecklistId=" + oldchecklistid,
      checklist,
      { headers: header }
    );
  }

  saveNewCheckListVersion(checklist): Observable<ChecklistQuestionsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ChecklistQuestionsModel>(
      this.apiurl + "/SaveNewChecklistVersion",
      checklist,
      { headers: header }
    );
  }
  updateProjectAliasName(projectId, projectAliasname): Observable<boolean> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      projectId: projectId,
      projectAliasname: projectAliasname,
    });
    return this._http.get<boolean>(this.apiurl + "/updateProjectAliasName", {
      headers: header,
    });
  }
  GetTimesheetDetailsByCustomerId(
    custid
  ): Observable<TimesheetProjectEmpModelGroupBydate[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      CustId: custid.toString(),
    });
    return this._http.get<TimesheetProjectEmpModelGroupBydate[]>(
      this.apiurl + "/GetTimesheetDetailsByCustomerId",
      { headers: header }
    );
  }

  GetTimesheetDetailsForApproval(
    custid,
    params: ServiceParams
  ): Observable<TimesheetProjectEmpModelGroupBydate[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      CustId: custid.toString(),
    });
    return this._http.post<TimesheetProjectEmpModelGroupBydate[]>(
      this.apiurl + "/GetTimesheetDetailsForApproval",
      params,
      { headers: header }
    );
  }

  GetTimesheetNewDetailsForApproval(
    custid,
    //dateRange:any[],
    params: ServiceParams
  ): Observable<any[]> {
    const rows = [];
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      CustId: custid.toString(),
      projectId: params.paraM_VALUE,
      //DateRange: dateRange
    });
    return this._http.post<TimesheetProjectEmpModelGroupBydate[]>(
      this.apiurl + "/GetTimesheetNewDetailsForApproval",
      params,
      { headers: header }
    );
    // .map(res => {
    //   res.forEach(d => rows.push(d.multipleProjectTimesheets));
    //   return rows;
    // })
  }

  ApproveOrRejectMultipleProjectTimesheetsNew(
    periodType,
    projects: TimesheetProjectEmpModelGroupBydate[]
  ): Observable<boolean> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      period: periodType.toString(),
    });

    return this._http.post<boolean>(
      this.apiurl + "/ApproveMultipleProjectTimesheetsMultipleRangeNew",
      projects,
      { headers: header }
    );
  }

  UpdateMultipleProjectTimesheetsMultipleRange(
    periodType,
    projects: TimesheetProjectEmpModelGroupBydate[]
  ): Observable<boolean> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      period: periodType.toString(),
    });

    return this._http.post<boolean>(
      this.apiurl + "/UpdateMultipleProjectTimesheetsMultipleRange",
      projects,
      { headers: header }
    );
  }

  GetFilterPreferences(tableName: string): Observable<FilterPreferenceModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<FilterPreferenceModel[]>(
      this.apiurl + "/GetFilterPreferences",
      tableName,
      { headers: header }
    );
  }
  addEmployee(
    employee: EmpInfoDetailedModel
  ): Observable<EmpInfoDetailedModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<EmpInfoDetailedModel>(
      this.apiurl + "/AddEmployee",
      employee,
      { headers: header }
    );
  }

  addNewProject(newProject: AddProjectsModel): Observable<AddProjectsModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<AddProjectsModel>(
      this.apiurl + "/AddNewProject",
      newProject,
      { headers: header }
    );
  }

  getAllSps(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetAllSps", { headers: header });
  }

  getSpParams(sid: number): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetSpParams?SpId=" + sid, {
      headers: header,
    });
  }

  displaySpData(params: ReportsSPParamsModel[], spname): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      spname: spname,
    });
    header.append("spname", spname);
    return this._http.post<any[]>(this.apiurl + "/GetSpData", params, {
      headers: header,
    });
  }

  GetResponseCheck(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetResponse", {
      headers: header,
    });
  }

  GetProjEndDateByProjId(projectid: string): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetProjEndDate?projectid=" + projectid,
      { headers: header }
    );
  }

  checkIfResourceAlreadyExistsByDates(
    projectid,
    empid,
    start_date,
    end_date
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      projectid: projectid,
      empid: empid.toString(),
      startDate: start_date,
      endDate: end_date,
    });

    return this._http.get<any>(
      this.apiurl + "/checkIfResourceAlreadyExistsByDates",
      { headers: header }
    );
  }

  getResourceStartEndDateByProjIdEmpId(projectid, empid): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetResourceStartEndDateByProjIdEmpId?projectid=" +
      projectid +
      "&empid=" +
      empid,
      { headers: header }
    );
  }

  GetProjectDetailForEdit(projectId): Observable<ProjectsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProjectsModel[]>(
      this.apiurl + "/GetProjectDetailForEdit?projectId=" + projectId,
      { headers: header }
    );
  }

  UpdateExistingProject(project1: ProjectModel): Observable<ProjectModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ProjectModel>(
      this.apiurl + "/UpdateExistingProject",
      project1,
      { headers: header }
    );
  }

  validateTimesheetClockedHrs(
    timesheet,
    daylimit
  ): Observable<TimesheetProjectModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empid: localStorage.getItem("empid").toString(),
      dayLimit: daylimit.toString(),
    });
    return this._http.post<TimesheetProjectModel[]>(
      this.apiurl + "/validateTimesheetClockedHrs",
      timesheet,
      { headers: header }
    );
  }

  AddNewPortfolio(portfolioData: PortfoliosModel): Observable<PortfoliosModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<PortfoliosModel>(
      this.apiurl + "/AddNewPortfolio",
      portfolioData,
      { headers: header }
    );
  }

  GetPortfoliosList(): Observable<PortfoliosModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<PortfoliosModel[]>(
      this.apiurl + "/GetPortfoliosList",
      { headers: header }
    );
  }

  getAllCustomerContacts(): Observable<ContactsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ContactsModel[]>(
      this.apiurl + "/GetAllCustomerContacts",
      { headers: header }
    );
  }

  TimeSheetRemainderEmail(
    startDate,
    endDate,
    customerId: string,
    projectId: string
  ): Observable<TimesheetProjectEmpModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      endDate: endDate,
      startDate: startDate,
      customerId: customerId,
      projectId: projectId,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<TimesheetProjectEmpModel>(
      this.apiurl + "/TimeSheetRemainderEmail",
      { headers: header }
    );
  }

  ProcessPSARequests(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/ProcessPSARequests", "", {
      headers: header,
    });
  }
  CheckProjectAllocationExpiry(): Observable<string> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<string>(
      this.apiurl + "/CheckProjectAllocationExpiry",
      "",
      { headers: header }
    );
  }

  GetDBConfigValue(key, cust_id, proj_id): Observable<string> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<string>(
      this.apiurl +
      "/GetDBConfig?key=" +
      key +
      "&custId=" +
      cust_id +
      "&projId=" +
      proj_id,
      { headers: header }
    );
  }

  GetDBConfigValueFields(key, cust_id, proj_id): Observable<string> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<string>(
      this.apiurl +
      "/GetDBConfigArrayValues?key=" +
      key +
      "&custId=" +
      cust_id +
      "&projId=" +
      proj_id,
      { headers: header }
    );
  }

  MigrateProjectData(oldProjectId, newProjectId): Observable<string> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<string>(
      this.apiurl +
      "/MigrateProjectData?oldProjectId=" +
      oldProjectId +
      "&newProjectId=" +
      newProjectId,
      { headers: header }
    );
  }

  GetCustomerProjectsForMigration(customerId, needClosed): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<any[]>(
      this.apiurl +
      "/GetCustomerProjectsForMigration?customerId=" +
      customerId +
      "&needClosed=" +
      needClosed,
      { headers: header }
    );
  }

  ProcessCrispScoresForPeriod(Month, Year, regenerate): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<any[]>(
      this.apiurl +
      "/ProcessCrispScoresForPeriod?Month=" +
      Month +
      "&Year=" +
      Year +
      "&regenerate=" +
      regenerate,
      { headers: header }
    );
  }

  ProcessCScoreForPeriod(Month, Year, regenerate): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<any[]>(
      this.apiurl + "/ProcessCScoreForPeriod?Month=" + Month + "&Year=" + Year,
      { headers: header }
    );
  }
  ProcessExternalKPI(Month, Year): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<any[]>(
      this.apiurl + "/ProcessExternalKPI?Month=" + Month + "&Year=" + Year,
      { headers: header }
    );

  }

  GeneralMethod(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    //  return this._http.get<any[]>(this.apiurl_auth + "/GetSPData?spName=reports_CSAT_Consolidated&startDate=2024-7-1&endDate=2024-9-30", {
    //  headers: header,
    //  });
    // let emp = '{"EMP_ID":"200388","BASE_CNTRY_ID":1,"MANAGER_EMP_ID":101908,"REVIEWER_EMP_ID":104951,"EMPL_TYPE":"Employee","FRST_NM":"Kaviya  S","MIDDLE_NM":null,"LAST_NM":"Sivakumar","GENDER":null,"DOB":"2002-12-09T00:00:00","DOJ":"2023-08-16T00:00:00","DOR":null,"LEVEL":"R","TITLE":"Retainer","EXPERIENCE":"0.03","EMAIL_ID":"kaviya.sivakumar@gavstech.com","MOBILE_NBR":"9786140350","NAME_IN_US_FORMAT":null,"CREATED_BY":"100373","CREATED_DATE":"2023-08-22T16:41:32+05:30","UPDATED_BY":"100373","UPDATED_DATE":"2023-08-28T06:06:02+05:30"}';
    // let proj = '{"PROJ_ID":"202P000782","CUST_ADDR_ID":1,"BILL_CRNCY_ID":2,"BILL_CRNCY":"USD","PROJ_NM":"AgFirst - Account Access - Offshore BA","proJ_ALIAS_NM":"AgFirst - Account Access - Offshore BA","START_DATE":"2021-09-17T00:00:00","END_DATE":"2023-07-15T00:00:00","BILL_TYPE":true,"PROC_TYPE":"Billable","PROJ_BUHEAD_EMP_ID":"101955","PROJ_DM_EMP_ID":"106170","PROJ_PM_EMP_ID":"104689","PROJ_AM_EMP_ID":"101369","CREATED_BY":"104689","CREATED_DATE":"2021-09-22T22:53:23+05:30","UPDATED_BY":"104689","UPDATED_DATE":"2023-09-25T13:16:08+05:30","DEPT_ID":null,"DEPT":"APPSER","CUST_ID":"202100065","CUST_ID_S":"202-100065","BU_ID":null,"BU":"ENTSOL","PROJ_STATUS":"Complete","PROJECT_GROUP":"Time & Material – Onsite","BUSINESS_UNIT":"ENTSOL","PROJECT_TYPE":"Time and Material","DEPARTMENT":"APPSER","CONTRACTING_UNIT":"GAVS USA","COUNTRY":"United States","METHODOLOGY":null}';
    return this._http.get<any[]>(this.apiurl + "/GeneralMethod", {
      headers: header,
    });


    // return this._http.post<any[]>(this.apiurl + "/UpdateProject", proj, {
    //   headers: header,
    //});

  }

  ProcessCrispScoresForPeriodPM(Month, Year): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<any[]>(
      this.apiurl +
      "/ProcessCrispScoresForPeriodForPM?Month=" +
      Month +
      "&Year=" +
      Year,
      { headers: header }
    );
  }

  ProcessCrispScoresForProject(CustId, ProjId, Month, Year): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.post<any[]>(
      this.apiurl +
      "/ProcessCrispScoresForProject?custId=" +
      CustId +

      "&Month=" +
      Month +
      "&Year=" +
      Year,
      ProjId,
      { headers: header }
    );
  }

  GetProjectCsatURL(ProjId, Month, Year): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<any[]>(
      this.apiurl +
      "/GetProjectCsatURL?projId=" +
      ProjId +
      "&Month=" +
      Month +
      "&Year=" +
      Year,
      { headers: header }
    );
  }

  AddServiceLevelIdentifier(
    identifier,
    title,
    serviceAreaId
  ): Observable<string> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    var empId = localStorage.getItem("empid");

    return this._http.get<string>(
      this.apiurl +
      "/AddServiceLevelIdentifier?identifier=" +
      identifier +
      "&title=" +
      title +
      "&serviceAreaId=" +
      serviceAreaId +
      "&empid=" +
      empId,
      { headers: header }
    );
  }

  GetServiceLevelIdentifier(serviceAreaId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<any[]>(
      this.apiurl + "/GetServiceLevelIdentifier?serviceAreaId=" + serviceAreaId,
      { headers: header }
    );
  }

  AddFMEATask(
    serviceAreaId,
    processId,
    serviceIdentifierId,
    taskTitle,
    taskCategoryId
  ): Observable<string> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    var empId = localStorage.getItem("empid");

    return this._http.get<string>(
      this.apiurl +
      "/AddFMEATask?serviceAreaId=" +
      serviceAreaId +
      "&processId=" +
      processId +
      "&serviceIdentifierId=" +
      serviceIdentifierId +
      "&taskTitle=" +
      taskTitle +
      "&taskCategoryId=" +
      taskCategoryId,
      { headers: header }
    );
  }

  GetFMEATasks(
    serviceAreaId,
    processId,
    serviceIdentifierId
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<any[]>(
      this.apiurl +
      "/GetFMEATasks?serviceAreaId=" +
      serviceAreaId +
      "&serviceAreaId=" +
      serviceAreaId +
      "&processId=" +
      processId +
      "&serviceIdentifierId=" +
      serviceIdentifierId,
      { headers: header }
    );
  }

  GetFailureModeMasterData(
    fmeaTypeId,
    serviceAreaId,
    processId,
    serviceIdentifierId,
    taskId
  ): Observable<FMEAModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<FMEAModel[]>(
      this.apiurl +
      "/GetFailureModeMasterData?fmeaTypeId=" +
      fmeaTypeId +
      "&serviceAreaId=" +
      serviceAreaId +
      "&processId=" +
      processId +
      "&serviceIdentifierId=" +
      serviceIdentifierId +
      "&taskId=" +
      taskId,
      { headers: header }
    );
  }

  GetFMEADATAStage2(
    fmeaTypeId,
    serviceAreaId,
    processId,
    serviceIdentifierId,
    taskId
  ): Observable<FMEAStage2Model[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<FMEAStage2Model[]>(
      this.apiurl +
      "/GetFMEADATAStage2?fmeaTypeId=" +
      fmeaTypeId +
      "&serviceAreaId=" +
      serviceAreaId +
      "&processId=" +
      processId +
      "&serviceIdentifierId=" +
      serviceIdentifierId +
      "&taskId=" +
      taskId,
      { headers: header }
    );
  }

  GetFMEADATAStage3(
    fmeaTypeId,
    serviceAreaId,
    processId,
    serviceIdentifierId,
    taskId
  ): Observable<FMEAStage3Model[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<FMEAStage3Model[]>(
      this.apiurl +
      "/GetFMEADATAStage3?fmeaTypeId=" +
      fmeaTypeId +
      "&serviceAreaId=" +
      serviceAreaId +
      "&processId=" +
      processId +
      "&serviceIdentifierId=" +
      serviceIdentifierId +
      "&taskId=" +
      taskId,
      { headers: header }
    );
  }

  addFailureModeMaster(failurE_MODE_MASTER): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/AddFailureModeMaster",
      failurE_MODE_MASTER,
      {
        headers: header,
      }
    );
  }

  updateFailureModeMaster(failurE_MODE_MASTER): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/UpdateFailureModeMaster",
      failurE_MODE_MASTER,
      {
        headers: header,
      }
    );
  }

  GetRatingFactors(ratingType): Observable<FMEARatingFactorsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<FMEARatingFactorsModel[]>(
      this.apiurl + "/GetRatingFactors?ratingType=" + ratingType,
      { headers: header }
    );
  }

  updateFMEADataModelStage2(FMEAStage2Model): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/UpdateFMEADataStage2Model",
      FMEAStage2Model,
      {
        headers: header,
      }
    );
  }

  updateFMEADataModelStage3(FMEAStage3Model): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/UpdateFMEADataStage3Model",
      FMEAStage3Model,
      {
        headers: header,
      }
    );
  }

  UpdateApproval(
    fmeaDataId,
    fmeaStatus,
    rejectionComments
  ): Observable<string> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<string>(
      this.apiurl +
      "/UpdateApproval?fmeaDataId=" +
      fmeaDataId +
      "&fmeaStatus=" +
      fmeaStatus +
      "&rejectionComments=" +
      rejectionComments,
      { headers: header }
    );
  }

  UpdateApprovalStage2(
    fmeaDataId,
    fmeaStatus,
    rejectionComments
  ): Observable<string> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<string>(
      this.apiurl +
      "/UpdateApprovalStage2?fmeaDataId=" +
      fmeaDataId +
      "&fmeaStatus=" +
      fmeaStatus +
      "&rejectionComments=" +
      rejectionComments,
      { headers: header }
    );
  }

  UpdateApprovalStage3(
    fmeaDataId,
    fmeaStatus,
    rejectionComments
  ): Observable<string> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<string>(
      this.apiurl +
      "/UpdateApprovalStage3?fmeaDataId=" +
      fmeaDataId +
      "&fmeaStatus=" +
      fmeaStatus +
      "&rejectionComments=" +
      rejectionComments,
      { headers: header }
    );
  }

  AddFMEADataStage2Model(FMEAStage2Model): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/AddFMEADataStage2Model",
      FMEAStage2Model,
      {
        headers: header,
      }
    );
  }

  deleteFMEADataModel(fmeaDataId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/DeleteFMEADataModel?fmeaDataId=" + fmeaDataId,
      null,
      { headers: header }
    );
  }

  UpdateApplicable(id, status): Observable<string> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<string>(
      this.apiurl + "/UpdateApplicable?id=" + id + "&status=" + status,
      { headers: header }
    );
  }

  //New CIL
  GetCITrackerNew(
    ciTrackerParameterModel: CITrackerParamerterModelNew
  ): Observable<CITrackerModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.post<CITrackerModel[]>(
      this.apiurl + "/GetCITracker",
      ciTrackerParameterModel,
      { headers: header }
    );
  }

  GetCITracker(
    ciTrackerParameterModel: CITrackerParamerterModel
  ): Observable<CITrackerModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.post<CITrackerModel[]>(
      this.apiurl + "/GetCITracker",
      ciTrackerParameterModel,
      { headers: header }
    );
  }

  //Project Configuration

  getProjectSettings(): Observable<ProjectMasterConfigurationModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProjectMasterConfigurationModel[]>(
      this.apiurl + "/GetAllProjectConfigurationSettings",
      { headers: header }
    );
  }

  getProjectConfigurationData(projectId: string): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetProjectConfigurationData?projID=" + projectId,
      { headers: header }
    );
  }

  GetMandatoryTrainingDetails(
    startDate,
    endDate,
    custId,
    projId
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetMandatoryTrainingData?starDate=" +
      startDate +
      "&endDate=" +
      endDate +
      "&custId=" +
      custId +
      "&projIds=" +
      projId,
      { headers: header }
    );
  }

  UpdateFMEAStage2MultipleRequests(
    Type,
    FMEAStage2List: FMEAStage2Model[]
  ): Observable<boolean> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      Type: Type.toString(),
    });

    return this._http.post<boolean>(
      this.apiurl + "/UpdateFMEAStage2MultipleRequests",
      FMEAStage2List,
      { headers: header }
    );
  }

  GetFindingsForProject(
    projId,
    serviceAreaId
  ): Observable<ProjectServiceAreaProcessMappingModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ProjectServiceAreaProcessMappingModel[]>(
      this.apiurl +
      "/GetFindingsForProject?projId=" +
      projId +
      "&serviceAreaId=" +
      serviceAreaId,
      { headers: header }
    );
  }

  getAssessmentExceutionDetails(): Observable<ChecklisExecutionDetails[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ChecklisExecutionDetails[]>(
      this.apiurl + "/GetAssessmentExecutionDetails",
      { headers: header }
    );
  }
  GetProcessCompilanceScore(Id): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetProcessCompilanceScore",
      Id,
      { headers: header }
    );
  }
  getIdeasInnovationsImprovements(
    projIds
  ): Observable<CSMDashboardDetailsModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<CSMDashboardDetailsModel[]>(
      this.apiurl + "/GetIdeasInnovationsImprovements",
      projIds,
      { headers: header }
    );
  }

  getContactRoles(): Observable<ContactsRolesModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ContactsRolesModel[]>(
      this.apiurl + "/GetContactRoles",
      { headers: header }
    );
  }

  getCustomerByEmpId(empid): Observable<any[]> {
    empid = localStorage.getItem("empid");
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),

    });
    //return this._http.get<any[]>(this.apiurl + '/GetCustomerList?EmpId=' + empid, { headers: header });
    return this._http.get<any[]>(
      this.apiurl + "/GetCustomerByEmpId?EmpId=" + empid,
      { headers: header }
    );
  }

  GetPortfolioWithProductList(custId): Observable<PortfoliosModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<PortfoliosModel[]>(
      this.apiurl + "/GetPortfolioWithProductList?customerId=" + custId,
      {
        headers: header,
      }
    );
  }
  GetProductListByCustId(custId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetProductListByCustId?custId=" + custId,
      {
        headers: header,
      }
    );
  }

  GetProductList(custId, portId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetProductList?custId=" + custId + "&portId=" + portId,
      {
        headers: header,
      }
    );
  }
  getKpiMetrics(
    prodId,
    modeId,
    d,
    shouldLoadAdditionalData
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetKpiMetrics?prodId=" +
      prodId +
      "&modeId=" +
      modeId +
      "&date=" +
      d +
      "&shouldLoadAdditionalData=" +
      shouldLoadAdditionalData,
      {
        headers: header,
      }
    );
  }
  AddKpiDetailsbyProduct(detail, d, status): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      isDraft: status.toString(),
    });
    return this._http.post<any>(
      this.apiurl + "/AddKpiDetailsByProduct?date=" + d,
      detail,
      {
        headers: header,
      }
    );
  }

  getAllServiceMode(prodId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetServiceLevelModes?prodId=" + prodId,
      {
        headers: header,
      }
    );
  }
  getAllKpiByModeId(modeId, lvlId, prodId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetAllKpiByModeId?modeId=" +
      modeId +
      "&serviceLevelId=" +
      lvlId +
      "&prodId=" +
      prodId,
      {
        headers: header,
      }
    );
  }

  getProductServiceArea(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetProductServiceArea", {
      headers: header,
    });
  }
  getServiceLevel(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetServiceLevel", {
      headers: header,
    });
  }
  getServiceReference(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetServiceReference", {
      headers: header,
    });
  }
  getServiceMetricsForAPeriod(
    custid,
    month,
    year,
    bLastUpdated: boolean
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetServiceMetricsForAPeriod?CustomerId=" +
      custid +
      "&Month=" +
      month +
      "&Year=" +
      year +
      "&bLastUpdated=" +
      bLastUpdated,
      { headers: header }
    );
  }


  GetServiceMetricsDashboardDataPortfolioWise(custid, month, year, bLastUpdated: boolean): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid")
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetServiceMetricsDashboardDataPortfolioWise?CustomerId=" +
      custid +
      "&Month=" +
      month +
      "&Year=" +
      year +
      "&bLastUpdated=" +
      bLastUpdated,
      { headers: header }
    );
  }


  GetServiceMetricsDashboardDataProductWise(custid, month, year, bLastUpdated: boolean): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid")
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetServiceMetricsDashboardDataProductWise?CustomerId=" +
      custid +
      "&Month=" +
      month +
      "&Year=" +
      year +
      "&bLastUpdated=" +
      bLastUpdated,
      { headers: header }
    );
  }

  GetProjectCAPACount(custid, month, year): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid")
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetProjectCAPACount?customerId=" +
      custid +
      "&month=" +
      month +
      "&year=" +
      year,
      { headers: header }
    );
  }

  getWeightage(): Observable<AuditCheckListWeightage[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<AuditCheckListWeightage[]>(
      this.apiurl + "/GetWeightage",
      { headers: header }
    );
  }

  getWeightageForChecklist(checklistId): Observable<AuditCheckListWeightage[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<AuditCheckListWeightage[]>(
      this.apiurl + "/GetWeightageForChecklist?checklistId=" + checklistId,
      { headers: header }
    );
  }

  UpdateWeightageForChecklist(weightage, checklistId: number) {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      checklistId: checklistId.toString(),
    });
    return this._http.post<any>(
      this.apiurl + "/UpdateWeightageForChecklist",
      weightage,
      { headers: header }
    );
  }

  getWeightageForAllChecklist(): Observable<AuditCheckListWeightage[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<AuditCheckListWeightage[]>(
      this.apiurl + "/GetWeightageForAllChecklist",
      { headers: header }
    );
  }

  getChecklistUsedInAssessment(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(this.apiurl + "/GetChecklistUsedInAssessment", {
      headers: header,
    });
  }

  // getUOM(): Observable<any[]> {
  //   let header = new HttpHeaders({
  //     Accept: "application/json",
  //     token: this._util.AppSettings.token,
  //     empId: localStorage.getItem("empid"),
  //   });
  //   return this._http.get<any[]>(this.apiurl + "/GetAllUOM",{ headers: header });
  // }
  //KpiValueAchieved
  getKpiAchievement(detail, kpiId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetKpiAchievementPercentage?kpiId=" + kpiId,
      detail,
      {
        headers: header,
      }
    );
  }
  getCAPAStagesForKPI(kpiDetailsId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetCAPAStagesForKPI?kpiDetailId=" + kpiDetailsId,

      { headers: header }
    );
  }

  addCAPReviewDetailsForKPI(capReviewDetails, selectedPeriod): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      selectedPeriod: selectedPeriod.toString(),
    });
    return this._http.post<any>(
      this.apiurl + "/addCAPReviewDetailsForKPI",
      capReviewDetails,
      { headers: header }
    );
  }

  getProductManagerByProductId(prodId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetProductManagerByProduct?prodId=" + prodId.toString(),
      {
        headers: header,
      }
    );
  }

  IsCAPAApprovalAllowed(
    prodId,
    selectedPeriod,
    kpiDetailsId
  ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      selectedPeriod: selectedPeriod.toString(),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/IsCAPAApprovalAllowed?prodId=" +
      prodId.toString() +
      "&selectedPeriod=" +
      selectedPeriod +
      "&kpiDetailsId=" +
      kpiDetailsId,
      {
        headers: header,
      }
    );
  }

  addCAPImplementationDetailsForKPI(
    capImplementationDetails,
    selectedPeriod
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      selectedPeriod: selectedPeriod.toString(),
    });
    return this._http.post<any>(
      this.apiurl + "/AddCAPImplementationDetailsForKPI",
      capImplementationDetails,
      { headers: header }
    );
  }

  addCAPAApprovalByCustomer(
    capApprovedByCustomerDetails,
    selectedPeriod
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      selectedPeriod: selectedPeriod != null ? selectedPeriod.toString() : "",
    });
    return this._http.post<any>(
      this.apiurl + "/AddCAPAApprovalByCustomer",
      capApprovedByCustomerDetails,
      { headers: header }
    );
  }

  addCAPAApprovalByQASpoc(
    capApprovedByCustomerDetails,
    selectedPeriod
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      selectedPeriod: selectedPeriod != null ? selectedPeriod.toString() : "",
    });
    return this._http.post<any>(
      this.apiurl + "/AddCAPAApprovalByQASpoc",
      capApprovedByCustomerDetails,
      { headers: header }
    );
  }

  addCAPVerificationDetailsForKPI(
    capVerificationDetails,
    selectedPeriod
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      selectedPeriod: selectedPeriod.toString(),
    });
    return this._http.post<any>(
      this.apiurl + "/AddCAPVerificationDetailsForKPI",
      capVerificationDetails,
      { headers: header }
    );
  }

  addCAPAForKPI(
    capaStatus: AuditFindingStage,
    selectedPeriod
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      selectedPeriod: selectedPeriod.toString(),
    });
    return this._http.post<any>(this.apiurl + "/AddCAPAForKPI", capaStatus, {
      headers: header,
    });
  }

  getAccountsForCSATDashboard(allCust): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetAccountsForCSATDashboard?isHaveAllCustomerAccess=" +
      allCust,
      { headers: header }
    );
  }

  getTrendChartforNPSPeriodwise(csatdashboardinputs): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetNPSForPeriod",
      csatdashboardinputs,
      { headers: header }
    );
  }

  getSurveyDataPeriodwise(csatdashboardinputs): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetCSATSurveyResponseForPeriod",
      csatdashboardinputs,
      { headers: header }
    );
  }

  getCSATHeatMapForPeriod(csatdashboardinputs): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetHeatMapForCSATPeriod",
      csatdashboardinputs,
      { headers: header }
    );
  }


  ProcessExternalKPIs(custId, date): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/ProcessExternalKPIs?custId=" + custId + '&date=' + date,
      { headers: header }
    );
  }
  GetExternalKPIDataByBaseMeasure(kpiDetailsId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetExternalKPIDataByBaseMeasure?kpiDetailsId=" + kpiDetailsId,
      { headers: header }
    );
  }

  getEngagementKPIDetails(details): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetEngagementKPIDetails",
      details,
      { headers: header }
    );
  }

  getResponseCategoryData(csatdashboardinputs): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetResponseCategoryData",
      csatdashboardinputs,
      { headers: header }
    );
  }
  getPortfolioWiseKPIDetails(custid, month, year): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetPortfolioWiseKPIDetails?customerId=" +
      custid +
      "&month=" +
      month +
      "&year=" +
      year,
      { headers: header }
    );
  }

  getCSSViewDetails(csatdashboardinputs): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetCSSViewDetails",
      csatdashboardinputs,
      { headers: header }
    );
  }
  getOverallServiceMetricsForAPeriod(custId, month, year): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetOverallServiceMetricsForAPeriod?customerId=" +
      custId +
      "&Month=" +
      month +
      "&Year=" +
      year,
      { headers: header }
    );
  }
  getKpiMetricsAdditionalData(detail): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetKpiMetricsAdditionalData",
      detail,
      {
        headers: header,
      }
    );
  }

  getKpiAdditionalData(detail): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/GetKpiAdditionalData", detail, {
      headers: header,
    });
  }
  getQuestionWiseRatingForCSATInsight(
    csatdashboardinputs,
    shouldLoadTrendWiseData
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      shouldLoadTrendWiseData: shouldLoadTrendWiseData.toString(),
    });
    return this._http.post<any>(
      this.apiurl + "/GetQuestionWiseRatingForCSATInsight",
      csatdashboardinputs,
      { headers: header }
    );
  }

  getFindingTypeForAssessmentFindingsQADeck(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/getFindingTypeForAssessmentFindingsQADeck",
      { headers: header }
    );
  }

  getMandatoryFindingTypeById(findingTypeId: number): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetMandatoryFindingTypeById?findingTypeId=" +
      findingTypeId,
      { headers: header }
    );
  }

  getAssessmentFindingChartData(qagovernancedashboardinputs): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetAssessmentFindingChartData",
      qagovernancedashboardinputs,
      { headers: header }
    );
  }
  GetAllProductList(): Observable<PremierProductsListModel[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid")

    });
    return this._http.get<PremierProductsListModel[]>(
      this.apiurl + "/GetAllProductList",
      {
        headers: header,
      }
    );
  }
  revertProductKPIDetails(prodId, month, year): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/RevertProductKPIDetails?prodId=" +
      prodId +
      "&month=" +
      month +
      "&year=" +
      year,
      { headers: header }
    );
  }

  getAssessmentFindingsViewDetails(
    QagoverancedashboardInputs
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/GetAssessmentFindingDetails",
      QagoverancedashboardInputs,
      { headers: header }
    );
  }

  GetAuditQualityStandardControls(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetAuditorQualifiedStandardSummary", {
      headers: header,
    });
  }

  getCustomerCAPAApprovalStatus(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetCustomerCAPAApprovalStatus",
      {
        headers: header,
      }
    );
  }
  updateSLARejection(detail, date): Observable<any> {
    //
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      requestdate: date,
    });
    return this._http.post<any>(this.apiurl + "/UpdateSLARejection", detail, {
      headers: header,
    });
  }
  sendReviewFeedback(detail, productId, date): Observable<any> {
    //
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      requestdate: date,
    });
    return this._http.post<any>(this.apiurl + "/SendKPIReviewFeedback?productId=" + productId +
      "&period=" + date, detail,
      {
        headers: header,
      });
  }
  getAssessmentFindingsByTime(
    custId: string,
    projIds: string[]
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl +
      "/GetAssessmentFindingsByTime?custId=" +
      custId +
      "&projIds=" +
      JSON.stringify(projIds),
      { headers: header }
    );
  }

  getAppreciationDetails(
    customerId: string,
    allproj: boolean
  ): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetAppreciationDetails?custId=" +
      customerId +
      "&Projflag=" +
      allproj,
      { headers: header }
    );
  }

  updateAppreciation(
    appreciationDtls: AppreciationModel
  ): Observable<AppreciationModel> {
    let updatedScope: ScopeModel;
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<AppreciationModel>(
      this.apiurl + "/UpdateAppreciation",
      appreciationDtls,
      {
        headers: header,
      }
    );
  }

  deleteAppreciation(
    appreciationDtls: AppreciationModel
  ): Observable<AppreciationModel> {
    let updatedScope: ScopeModel;
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<AppreciationModel>(
      this.apiurl + "/DeleteAppreciation",
      appreciationDtls,
      {
        headers: header,
      }
    );
  }

  getConfigextDetails(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetConfigDetails", {
      headers: header,
    });
  }

  AddUpdateConfigext(item): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<AppreciationModel>(
      this.apiurl + "/UpdateConfiguration",
      item,
      {
        headers: header,
      }
    );
  }

  DeleteConfiguration(item): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.post<any>(this.apiurl + "/DeleteConfiguration", item, {
      headers: header,
    });
  }

  UpdateAuditor(item: AuditQualifiedStandardModel): Observable<AuditQualifiedStandardModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<AuditQualifiedStandardModel>(this.apiurl + "/UpdateAuditor", item, {
      headers: header,
    });
  }

  GetCustomerDetails(customerId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetCustomerDetails?customerId=" + customerId, {
      headers: header,
    });
  }

  getproductResponsibleDetails(productId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetProductResponsibleDetails?productId=" + productId,
      { headers: header }
    );
  }

  getEmployeeDetailsfromCustomer(customerId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetEmployeeDetailsFromCustomer?customerId=" + customerId,
      { headers: header }
    );
  }

  getProductResponsibleManagementTypeDetails(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetProductResponsibleManagementTypeDetails", {
      headers: header
    }
    );
  }

  AddUpdateProductResponsible(addItem: ProductResponsibleModel): Observable<ProductResponsibleModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ProductResponsibleModel>(this.apiurl + "/AddUpdateProductResponsible", addItem, {
      headers: header,
    });
  }

  DeleteProductResponsible(item: ProductResponsibleModel): Observable<ProductResponsibleModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<ProductResponsibleModel>(this.apiurl + "/DeleteProductResponsible", item, {
      headers: header,
    });
  }

  GetProjectHeadsByID(projectId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetProjectHeadsByID?projectId=" + projectId,
      { headers: header }
    );
  }

  UpdateProjectDetails(params): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(this.apiurl + "/UpdateProjectDetails", params, {
      headers: header,
    });
  }


  GetProductDetails(custId: string, portId: any): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetProductDetails?custId=" + custId + "&portId=" + portId,
      {
        headers: header,
      }
    );
  }

  GetInitialDataForCRUDProduct(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetInitialDataForCRUDProduct", {
      headers: header
    }
    );

  }

  AddUpdateProduct(item): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/UpdateProduct",
      item,
      {
        headers: header,
      }
    );
  }

  DeleteProduct(item): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/DeleteProduct",
      item,
      {
        headers: header,
      }
    );
  }

  resubmitChecklistAssessment(plannedAudit): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/ResubmitChecklistAssessment", plannedAudit,
      {
        headers: header,
      }
    );
  }

  revertChecklistAssessmentData(plannedAuditData): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/RevertChecklistAssessmentData", plannedAuditData,
      {
        headers: header,
      }
    );
  }

  getBusinessUnits(): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl + "/GetBusinessUnits",
      { headers: header }
    );
  }


  getEmployeeRolesForProduct(productId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid")
    });
    return this._http.get<any>(this.apiurl + "/GetEmployeeRolesForProduct?productId=" + productId,
      {
        headers: header,
      });
  }

  sendKPIDetailsReviewFeedback(productId, date): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
      requestdate: date,
    });
    return this._http.get<any>(this.apiurl + "/SendKPIReviewFeedback?productId=" + productId +
      "&period=" + date,
      {
        headers: header,
      });
  }


  getRiskFromRepository(customerId, projectId): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any>(
      this.apiurl +
      "/GetRiskFromRepository?customerId=" +
      customerId +
      "&projectId=" +
      projectId,
      { headers: header }
    );
  }

  addRiskList(selectedRiskList): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/AddRiskList", selectedRiskList,
      {
        headers: header,
      }
    );
  }

  getProjectFolders(customerId: string, projectId: string): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetProjectFileStructure?customerId=" + customerId + "&projectId=" + projectId,
      {
        headers: header,
      }
    );
  }

  createFolder(folderData, customerId: string, projectId: string): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/CreateFolder?customerId=" + customerId + "&projectId=" + projectId, folderData,
      {
        headers: header,
      }
    );
  }

  uploadProjectFile(folderId, customerId, projectId, formData): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    let headers = new Headers();
    return this._http.post<any[]>(
      this.apiurl + "/UploadFile?folderId=" + folderId + "&customerId=" + customerId +
      "&projectId=" + projectId, formData,
      {
        headers: header,
      }
    );
  }

  downloadFile(fileData, customerId: string, projectId: string): Observable<Blob> {
    let header = new HttpHeaders({
      Accept: 'application/json',
      token: this._util.AppSettings.token,
      empId: localStorage.getItem('empid'),
    });

    return this._http.post(
      `${this.apiurl}/DownloadFile?&customerId=${customerId}&projectId=${projectId}`,
      fileData,
      {
        headers: header,
        responseType: 'blob',
      }
    );
  }


  renameFile(fileData, newFilename, customerId: string, projectId: string): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/RenameFile?customerId=" + customerId + "&projectId=" + projectId + "&newFilename=" + newFilename, fileData,
      {
        headers: header,
      }
    );
  }

  deleteFile(fileData, customerId: string, projectId: string): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/DeleteFile?customerId=" + customerId + "&projectId=" + projectId, fileData,
      {
        headers: header,
      }
    );
  }

  renameFolder(folderData, customerId: string, projectId: string, newName: string): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/RenameFolder?customerId=" + customerId + "&projectId=" + projectId + "&newName=" + newName, folderData,
      {
        headers: header,
      }
    );
  }

  deleteFolder(folderData, customerId: string, projectId: string): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/DeleteFolder?customerId=" + customerId + "&projectId=" + projectId, folderData,
      {
        headers: header,
      }
    );
  }

  getAllProcessModelReferenceList(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetAllProcessModelReferenceList", {
      headers: header,
    });
  }
  GetAllRiskFromRepository(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetAllRiskFromRepository", {
      headers: header,
    });
  }


  AddUpdateRiskRepo(item): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any>(
      this.apiurl + "/AddUpdateRiskRepository",
      item,
      {
        headers: header,
      }
    );
  }
  DeleteRiskFromRepository(item): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.post<any>(this.apiurl + "/DeleteRiskFromRepository", item, {
      headers: header,
    });
  }

  deleteKpiForProduct(kpiId: number): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.post<any>(this.apiurl + "/DeleteKpiForProduct?kpiId=" + kpiId, null,
      { headers: header }
    );
  }


  getAllKpiMasterList(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetAllKpiMasterData", {
      headers: header,
    });
  }

  addKpiList(selectedKPI): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(
      this.apiurl + "/AddKpiList", selectedKPI,
      {
        headers: header,
      }
    );
  }

  GetProjectDetails(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetProjectInputDetails", {
      headers: header,
    });
  }

  getProjectCertificationScope(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetAllProjectCertificationScopes", {
      headers: header,
    });
  }

  service_UpdateTocustomer(projectId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "GetPortfolioLeadForProject?projectId=" + projectId, {
      headers: header,
    });
  }

  getOpenFindingsCount(auditIds): Observable<any> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });

    return this._http.get<any>(this.apiurl + "/GetOpenFindings?auditIds=" + auditIds, {
      headers: header,
    });
  }

  GetRiskLocation(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetRiskLocation", {
      headers: header,
    });
  }

  GetRiskCategory(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetRiskCategory", {
      headers: header,
    });
  }
  GetRiskIsoMappingList(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetRiskIsoMappingList", {
      headers: header,
    });
  }
  GetIsoStandardList(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetIsoStandardList", {
      headers: header,
    });
  }
  GetIsoStandardProjectMappingList(projectId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetIsoStandardProjectMappingList?projectId=" + projectId, {
      headers: header,
    });
  }


  GetAllCustomerProjectsName(): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(
      this.apiurl + "/GetAllCustomerProjectsName",
      { headers: header }
    );
  }

  getOverallKPIList(): Observable<ServiceAreaModelNew[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<ServiceAreaModelNew[]>(
      this.apiurl + "/GetOverallKPIList",
      { headers: header }
    );
  }

  saveChecklistCopy(checklistId: string, title: string): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    const requestBody = {
      checklistId: checklistId,
      title: title
    };
    return this._http.get<any[]>(this.apiurl + "/SaveChecklistCopy", {
      headers: header,
      params: requestBody
    });
  }


  // sendInternalAuditReportData(plannedAudit): Observable<any[]> {
  //   let header = new HttpHeaders({
  //     Accept: "application/json",
  //     token: this._util.AppSettings.token,
  //     empId: localStorage.getItem("empid"),
  //   });
  //   return this._http.post<any[]>(
  //     this.apiurl + "/SendInternalAuditReport", plannedAudit,
  //     {
  //       headers: header,
  //     }
  //   );
  // }
  service_DowloadFile(category: string, custId: string, projId: string, id: number): Observable<Blob> {
    let apiuri: string = environment.webapiuri + 'DownloadFile';
    let header = new HttpHeaders({
      Accept: 'application/json',
      token: this._util.AppSettings.token,
      empId: localStorage.getItem('empid'),
    });
    return this._http.get(
      `${apiuri}?category=${category}&custId=${custId}&projectId=${projId}&id=${id}`,

      {
        headers: header,

        responseType: 'blob',
      },

    );

  }


  getAllChecklists(includeMerged): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.get<any[]>(this.apiurl + "/GetChecklistList?includeMerged=" + includeMerged, {
      headers: header,
    });
  }


  getMultiChecklistPreview(ChecklistIds: number[]): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(this.apiurl + "/GetMultiChecklistPreview", ChecklistIds,
      { headers: header }
    );

  }



  createNewMultiChecklist(checklistIds: number[], title: string): Observable<ChecklistModel> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    const requestData = {
      title: title
    };
    return this._http.post<ChecklistModel>(this.apiurl + "/CreateNewMultiChecklist", checklistIds,
      {
        headers: header,
        params: requestData
      });
  }

  saveNewMultiChecklist(checklistData, checklistId): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    const requestData = {
      checklistId: checklistId
    };
    return this._http.post<any[]>(this.apiurl + "/SaveNewMultiChecklist", checklistData,
      {
        headers: header,
        params: requestData
      });
  }

  sendRequestAccess(controlId: number,feature :string, empId: string, accessType, custId: string,projId: string): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    const requestBody = {
      empId: empId,
      feature: feature,
      custId: custId,
      projId: projId,
      accessType: accessType
    };
    return this._http.post<any[]>(this.apiurl + "/RequestEditResourceAccess", controlId,
      {
        headers: header,
        params: requestBody
      });

  }
saveApproveRejectRequestAccess( accessRequestData: AccessRequestModel ): Observable<any[]> {
    let header = new HttpHeaders({
      Accept: "application/json",
      token: this._util.AppSettings.token,
      empId: localStorage.getItem("empid"),
    });
    return this._http.post<any[]>(this.apiurl + "/ApproveOrRejectEditResourceAccess",
      accessRequestData,
      {
        headers: header
      });

  }


  /**
        *  get(url: string, options: {
          headers?: HttpHeaders | {
              [header: string]: string | string[];
          };
          observe: 'response';
          params?: HttpParams | {
              [param: string]: string | string[];
          };
          reportProgress?: boolean;
          responseType: 'blob';
          withCredentials?: boolean;
      }): Observable<HttpResponse<Blob>>;
        */
}

//Reference: https://angular.io/guide/http

