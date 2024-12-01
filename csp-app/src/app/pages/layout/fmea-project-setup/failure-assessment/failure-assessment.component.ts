import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FMEAStage3Model } from '../../../../models/fmea-model';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { FailureAssessment } from '../../../../models/fmea/fm-project-mapping';
import { LayoutService } from '../../layout.service';
import { myUtility } from '../../../../Shared/myUtility';

@Component({
  selector: 'app-failure-assessment',
  templateUrl: './failure-assessment.component.html',
  styleUrls: ['./failure-assessment.component.scss']
})
export class FailureAssessmentComponent implements OnInit {

  mappingDict: any = {};
  severityRatings: any[] = [];
  occuranceRatings: any[] = [];
  detectionRatings: any[] = [];
  ratings: any[];
  constructor(private _layoutService: LayoutService, private _util: myUtility) { }
  @Input('approvedData') approvedData: any[];
  editMode: boolean;
  dataSource: MatTableDataSource<any>;
  @ViewChild('paginator') paginator: MatPaginator;
  displayedColumns: string[] = ['index', 'functioN_ACTIVITIES', 'potentiaL_FAILURE_MODE', 'potentiaL_CAUSE_FACTOR', 'potentiaL_CAUSE', 'futurE_ACTION_TAKEN', 'futurE_OCCURRENCE_RATING_DEFINITION', 'futurE_SEVERITY_RATING_DEFINITION', 'futurE_DETECTION_RATING_DEFINITION', 'futurE_RPN', 'edit'];

  selectedParamsStage = new FailureAssessment();

  ngOnInit() {
    this.getRatingFactors();
  }

  refreshTable(data) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges() {
    console.log("data", this.approvedData);
    this.refreshTable(this.approvedData);
  }

  EditRow_onClick(element) {
    this.selectedParamsStage = element;
    this.editMode = true;
  }

  Add_onClick() {
    this.selectedParamsStage = new FailureAssessment();
    this.editMode = true;
  }

  btnCancel() {
    this.editMode = false;
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
        this.selectedParamsStage[value] = "";
      else
        this.selectedParamsStage[value] = rec.ratinG_DEFINITION;
    }
    this.calcRPN();
  }

  calcRPN() {
    if (!this.selectedParamsStage.rF_DETECTION_ID || !this.selectedParamsStage.rF_OCCURRENCE_ID || !this.selectedParamsStage.rF_SEVERITY_ID)
      return;

    this.selectedParamsStage.rpn = parseFloat(this.selectedParamsStage.rF_OCCURRENCE_ID.toString()) *
      parseFloat(this.selectedParamsStage.rF_SEVERITY_ID.toString()) *
      parseFloat(this.selectedParamsStage.rF_DETECTION_ID.toString());
  }
}
