import { Component, OnInit, Input } from '@angular/core';
import { CrispCategorySummaryModel } from '../../../models/crisp-category-summary-model';
import { myUtility } from '../../../Shared/myUtility';
import { AppsService } from '../../../Services/apps.service';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { CrispDialogComponent } from '../crisp-dialog/crisp-dialog.component';

@Component({
  selector: 'app-crisp-summary',
  templateUrl: './crisp-summary.component.html',
  styleUrls: ['./crisp-summary.component.scss']
})
export class CrispSummaryComponent implements OnInit {
  @Input('ProjectIds') projectIds: string[];
  @Input('month') month: string;
  @Input('year') year: number;
  summary: CrispCategorySummaryModel[] = [];
  details = [];
  _loading: boolean = false;
  constructor(private _util: myUtility, private _appservice: AppsService, public dialog: MatDialog) { }

  ngOnInit() {
    this.LoadData();
  }
  LoadData() {
    this.service_getCrispSummary(this.projectIds, this.month, this.year);
  }
  ngOnChanges() {
    this.service_getCrispSummary(this.projectIds, this.month, this.year);
  }

  ShowCrispDetails(ProjectIds) {
    this.service_getCrispDetails(ProjectIds, this.month, this.year);
  }
  showRisk() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      summary: this.details
    }
    const dialogRef = this.dialog.open(CrispDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
     
    });
  }

  service_getCrispSummary(projectIds, month, year) {
    this._loading = true;
    this._appservice.GetCrispSummary(projectIds, month, year).subscribe(data => {
      this.summary = data;
      this._loading = false;
    }, error => {
      this._loading = false;
      this._util.serviceError(error);
    });
  }
  service_getCrispDetails(ProjectIds, month, year) {
    this._appservice.GetCrispDetails(ProjectIds, month, year).subscribe(data => {
      this.details = data;
      this.showRisk();
    }, error => { this._util.serviceError(error); });
  }


}
