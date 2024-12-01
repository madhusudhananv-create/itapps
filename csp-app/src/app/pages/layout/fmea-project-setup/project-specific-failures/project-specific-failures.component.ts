import { Component, OnInit, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { AppsService } from '../../../../Services/apps.service';
import { myUtility } from '../../../../Shared/myUtility';
import { MatTableDataSource, MatPaginator, MatCheckboxChange } from '@angular/material';
import { FMEAStage2Model } from '../../../../models/fmea-model';
import { ProjectFailureDetails, ProjectFailures, FailureAssessment } from '../../../../models/fmea/fm-project-mapping';
import { LayoutService } from '../../layout.service';
import { SelectionModel } from '@angular/cdk/collections';
import { AccessControl } from '../../../../Shared/accessControl';

@Component({
  selector: 'app-project-specific-failures',
  templateUrl: './project-specific-failures.component.html',
  styleUrls: ['./project-specific-failures.component.scss']
})
export class ProjectSpecificFailuresComponent implements OnInit {

  filteredData: any[];
  filterCriteria: any;
  @Input('projectmapping') projectmapping: ProjectFailureDetails[];
  @Input('projectid') projectid: string;
  selectedParamsStage2 = new ProjectFailureDetails();
  FMEAStage2List: any;
  ratings: any[] = [];
  detectionRatings: any[] = [];
  severityRatings: any[] = [];
  occuranceRatings: any[] = [];
  mappingDict: any = {}
  EditMode: boolean;
  projectId: string = "";
  isSubmitted: boolean;
  allApplicable: boolean;
  allApprove: boolean;
  readOnly: boolean = false;

  constructor(private _appservice: AppsService, private _util: myUtility, private cdref: ChangeDetectorRef,
    private _layoutService: LayoutService, private _access: AccessControl) { }

  dataSource: MatTableDataSource<ProjectFailureDetails>;
  @ViewChild('paginator') paginator: MatPaginator;
  displayedColumnsStage: string[] = ['select', 'index', 'functioN_ACTIVITIES', 'potentiaL_FAILURE_MODE', 'occurrencE_RATING_DEFINITION', 'severitY_RATING_DEFINITION', 'detectioN_RATING_DEFINITION',
    'rpn', 'applicable', 'approve', 'view', 'edit', 'delete'];
  selection = new SelectionModel<ProjectFailureDetails>(true, []);


  ngOnInit() {
    this.getRatingFactors();
  }

  ngOnChanges() {
    this.cdref.detectChanges();
    this.refreshTable(this.projectmapping);
  }

  viewElement_onClick(element) {
    this.EditMode = true;
    this.selectedParamsStage2 = element;
    this.readOnly = true;

  }
  getValue(flag) {
    if (flag == null)
      return null;
    else
      return (flag == 0) ? "No" : "Yes";
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  Filter_onChange($event) {
    this.filterCriteria = $event.criteria;
    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.projectmapping);
    this.refreshTable(this.filteredData);
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  changeApprovedStatus(event) {
    if (event.checked) {
      this.projectmapping.forEach(x => {
        if (!x.isapproved)
          x.isapproved = true
      });
    }
    else {
      this.projectmapping.forEach(x => {
        if (!x.isapproved)
          x.isapproved = false
      });
    }

    this.refreshTable(this.projectmapping);
  }

  refreshTable(data) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
  }

  btnCancel() {
    this.EditMode = false;
    this.cdref.detectChanges();
    this.refreshTable(this.projectmapping);
  }

  changeStatus(event: MatCheckboxChange) {
    if (event.checked) {
      this.projectmapping.forEach(x => {
        if (!x.isapplicable && !x.mappinG_ID)
          x.isapplicable = true;
      })
    }
    else {

      this.projectmapping.forEach(x => {
        if (x.isapplicable && !x.mappinG_ID)
          x.isapplicable = false;
      })
    }

    this.refreshTable(this.projectmapping);
  }

  getRatingFactors() {
    this._layoutService.GetRatingFactors("All").subscribe(data => {
      this.ratings = data;
      this.detectionRatings = this.ratings.filter(x => x.ratinG_FACTORS_CATEGORY == 'DETECTION');
      this.occuranceRatings = this.ratings.filter(x => x.ratinG_FACTORS_CATEGORY == 'OCCURRENCE');
      this.severityRatings = this.ratings.filter(x => x.ratinG_FACTORS_CATEGORY == 'SEVERITY');
      this.mappingDict['S'] = this.severityRatings;
      this.mappingDict['O'] = this.occuranceRatings;
      this.mappingDict['D'] = this.detectionRatings;
    }, error => this._util.serviceError(error))
  }

  setRating(type, id, value) {
    let list = this.mappingDict[type];
    if (list && list.length > 0) {
      let rec = list.find(x => x.ratinG_FACTORS_RATING == id);
      if (rec == null)
        this.selectedParamsStage2[value] = "";
      else
        this.selectedParamsStage2[value] = rec.ratinG_DEFINITION;
    }
    this.calcRPN();
  }

  calcRPN() {
    if (!this.selectedParamsStage2.rF_DETECTION_ID || !this.selectedParamsStage2.rF_OCCURRENCE_ID || !this.selectedParamsStage2.rF_SEVERITY_ID)
      return;

    this.selectedParamsStage2.rpn = parseFloat(this.selectedParamsStage2.rF_OCCURRENCE_ID.toString()) *
      parseFloat(this.selectedParamsStage2.rF_SEVERITY_ID.toString()) *
      parseFloat(this.selectedParamsStage2.rF_DETECTION_ID.toString());
  }

  updateStatus(status) {
    let selectedList = this.projectmapping.filter(x => x.mappinG_ID > 0 && x.isselected == true);
    if (selectedList.length == 0) {
      alert("Please select applicable records to approve/ reject");
      this.selection.clear();
      this.projectmapping.forEach(x => x.isselected = false);
      return;
    }

    selectedList.forEach(x => {
      if (status == 'Approve')
        x.isapproved = true;
      else
        x.isapproved = false;
    })

    let result = this.constructData(selectedList);
    this.service_UpdateApproveFlag(result, status);
  }

  setApplicable() {
    let selectedList = this.projectmapping.filter(x => x.isselected && (x.mappinG_ID == 0 || !x.mappinG_ID));
    if (selectedList.length == 0) {
      alert("Please select records to map");
      this.selection.clear();
      this.projectmapping.forEach(x => x.isselected = false);
      return;
    }

    selectedList.forEach(x => x.isapproved = null);
    let result = this.constructData(selectedList);
    this.service_UpdateProjectFailure(result);
  }

  setApplFlag(event, row) {
    if (event.checked)
      row.isapplicable = true;
    else
      row.isapplicable = false

  }

  constructData(data) {
    let mappingsList = [];
    for (var rec of data) {
      var mapping = new ProjectFailures();
      mapping.id = rec.mappinG_ID;
      mapping.projecT_ID = this.projectid;
      mapping.failurE_MODE_ID = rec.id;
      mapping.rF_OCCURRENCE_ID = rec.rF_OCCURRENCE_ID
      mapping.rF_DETECTION_ID = rec.rF_DETECTION_ID
      mapping.rF_SEVERITY_ID = rec.rF_SEVERITY_ID;
      mapping.rpn = rec.rpn;
      mapping.currenT_DETECTION_CONTROL = rec.currenT_DETECTION_CONTROL;
      mapping.currenT_PREVENTIVE_CONTROL = rec.currenT_PREVENTIVE_CONTROL;
      mapping.recommendeD_DETECTIVE_CONTROL = rec.recommendeD_DETECTIVE_CONTROL;
      mapping.recommendeD_PREVENTIVE_CONTROL = rec.recommendeD_PREVENTIVE_CONTROL;
      mapping.potentiaL_CAUSE = rec.potentiaL_CAUSE;
      mapping.potentiaL_CAUSE_FACTOR = rec.potentiaL_CAUSE_FACTOR;
      mapping.potentiaL_EFFECT_OF_FAILURE = rec.potentiaL_EFFECT_OF_FAILURE;
      mapping.responsible = rec.responsible;
      mapping.targeT_DATE = rec.targeT_DATE;
      mapping.isapplicable = true;
      mapping.isapproved = rec.isapproved;
      mappingsList.push(mapping);
    }
    return mappingsList;
  }

  service_UpdateProjectFailure(inputArray: ProjectFailureDetails[]) {
    this.isSubmitted = true;
    this._layoutService.UpdateProjectFailure(inputArray).subscribe(data => {
      alert("Data updated successfully");

      for (var rec of data) {
        let row = this.projectmapping.find(x => x.id == rec.failurE_MODE_ID);
        if (row == null)
          continue;

        row.mappinG_ID = rec.id;
        row.isapplicable = true;
      }
      this.selection.clear();
      this.projectmapping.forEach(x => x.isselected = false);
      this.refreshTable(this.projectmapping);

      this.isSubmitted = false;
      this.EditMode = false;
    }, error => {
      if (error.status === 409)
        alert(error.error);
      this._util.serviceError(error);
      this.isSubmitted = false;
    })
  }

  service_UpdateApproveFlag(data, status) {
    this._layoutService.ApproveSelected(data).subscribe(data => {
      alert(`Applicable rows ${status}ed successfully`);
      for (var row of data) {
        let index = this.projectmapping.findIndex(x => x.mappinG_ID == row.id);
        if (index > -1)
          this.projectmapping[index].isapproved = row.isapproved;
      }
      this._layoutService.approvedMappings = this.getDataForAssessment(this.projectmapping.filter(x => x.isapproved == true));
      this.selection.clear();
      this.projectmapping.forEach(x => x.isselected = false);
      this.refreshTable(this.projectmapping);
    }, (err) => this._util.serviceError(err));
  }

  getDataForAssessment(data: ProjectFailureDetails[]) {
    var output = [];
    for (var row of data) {
      var rec = new FailureAssessment();
      rec.currenT_DETECTION_CONTROL = row.currenT_DETECTION_CONTROL;
      rec.currenT_PREVENTIVE_CONTROL = row.currenT_PREVENTIVE_CONTROL;
      rec.projecT_FAILURES_MAPPING_ID = row.mappinG_ID;
      rec.rpn = row.rpn;
      rec.rF_DETECTION_ID = row.rF_DETECTION_ID;
      rec.rF_OCCURRENCE_ID = row.rF_OCCURRENCE_ID;
      rec.rF_SEVERITY_ID = row.rF_SEVERITY_ID;
      rec.potentiaL_CAUSE = row.potentiaL_CAUSE;
      rec.potentiaL_CAUSE_FACTOR = row.potentiaL_CAUSE_FACTOR;
      rec.potentiaL_EFFECT_OF_FAILURE = row.potentiaL_EFFECT_OF_FAILURE;
      rec.potentiaL_FAILURE_MODE = row.potentiaL_FAILURE_MODE;
      rec.functioN_ACTIVITIES = row.functioN_ACTIVITIES;
      output.push(rec);
    }

    return output;
  }

  saveMapping() {
    let list = [];
    this.selectedParamsStage2.isapproved = null;
    list.push(this.selectedParamsStage2);
    let result = this.constructData(list);
    this.service_UpdateProjectFailure(result);
  }

  EditRow_onClick(element: ProjectFailureDetails) {

    this.selectedParamsStage2 = element;
    this.readOnly = false;
    this.EditMode = true;
  }

  DeleteRow_onClick(element: ProjectFailureDetails) {
    if (!element.mappinG_ID || element.mappinG_ID == 0) {
      alert("There is no mapping exists");
      return;
    }

    if (!confirm('Are you sure want to delete?'))
      return;

    this._layoutService.DeleteProjectFailure(element.mappinG_ID).subscribe(data => {
      alert("Record deleted successfully");

      element.mappinG_ID = 0;
      element.isapplicable = false;
      element.isapproved = false;
      element.rpn = undefined;
      element.currenT_DETECTION_CONTROL = undefined;
      element.currenT_PREVENTIVE_CONTROL = undefined;
      element.potentiaL_CAUSE = undefined;
      element.potentiaL_CAUSE_FACTOR = undefined;
      element.potentiaL_EFFECT_OF_FAILURE = undefined;
      element.responsible = undefined;
      element.targeT_DATE = undefined;
      element.occurencE_RATING = undefined;
      element.severitY_RATING = undefined;
      element.detectioN_RATING = undefined;
      var index = this.projectmapping.findIndex(x => x.mappinG_ID == element.mappinG_ID);
      if (index > -1)
        this.projectmapping[index] = element;
      this.refreshTable(this.projectmapping);

    }, (err) => this._util.serviceError(err))
  }

}
