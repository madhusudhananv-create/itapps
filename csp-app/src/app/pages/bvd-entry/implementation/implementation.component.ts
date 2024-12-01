import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { BvdEntryService } from '../services/bvd-entry.service';
import { myUtility } from '../../../Shared/myUtility';
import { MatTableDataSource } from '@angular/material';
import { ImplementationPlan } from '../../../models/bvd-entry/idea-implementation-plan-model';
import { IdeaStatus } from '../../../models/bvd-entry/idea-model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-implementation',
  templateUrl: './implementation.component.html',
  styleUrls: ['./implementation.component.scss', '../bvd-entry-shared-css.scss']
})
export class ImplementationComponent implements OnInit {

  status: IdeaStatus[] = [];
  implementationSchdules: ImplementationPlan[] = [];
  constructor(private _bvdService: BvdEntryService, private _util: myUtility) { }
  iEditIndex = -1
  displayedColumns: string[] = ['milestonetask', 'description', 'efforts', 'responsible', 'comments', 'estimatedDate', 'actualstartDate', 'status', 'actions'];
  dataSource = new MatTableDataSource(this.implementationSchdules);
  @Input('issubmitted') issubmitted: boolean;
  @Input('isapproved') isapproved: boolean;
  actualstartDate: Date;
  actualendDate: Date;
  isComplete: boolean = false;
  @Output() setStep: EventEmitter<number> = new EventEmitter<number>();

  ngOnInit() {
    //this.status = this._util.enumSelector(IdeaStatus);
    this.getIdeaStatus();
  }

  ngOnChanges() {
    if (this._bvdService.isIdeaApproved)
      this.getSchdules(this._bvdService.ideA_ID);
  }

  getIdeaStatus() {
    this._bvdService.getIdeaStatus().subscribe(data => {
      this.status = data;
      this.status = this.status.filter(x => x.stagE_ID == 5);
    }, (err) => { this._util.serviceError(err) })
  }

  getSchdules(idea) {
    if (!this._bvdService.ideA_ID || this._bvdService.ideA_ID == 0)
      return;

    this._bvdService.getImplementationSchdule(idea).subscribe(data => {
      this.implementationSchdules = data;
      this.implementationSchdules.forEach(x => {
        if (x.ideA_STATUS_ID == 8)
          x.iscomplete = true;
      })
      console.log("schdules", this.implementationSchdules)
      this.refreshTable(this.implementationSchdules);
    }, (err) => { this._util.serviceError(err) })
  }

  getstatus(id) {
    let rec = this.status.find(x => x.id == id);
    if (rec != null)
      return rec.title;
    else
      return "";
  }

  UpdateRecord(rec: ImplementationPlan) {
    if (rec.ideA_STATUS_ID == 8) {
      if (this.actualstartDate == null || this.actualendDate == null) {
        alert("Please enter actual start and end date to mark as complete");
        return;
      }
    }
    rec.actuaL_START_DATE = new Date(this.actualstartDate).toDateString();
    rec.actuaL_END_DATE = new Date(this.actualendDate).toDateString();
    this._bvdService.updateImplementationSchdule(rec).subscribe(data => {
      alert('Data updated Successfully');
      rec = data;
      if (rec.ideA_STATUS_ID == 8)
        rec.iscomplete = true;
      this.iEditIndex = -1;
    }, (err) => { this._util.serviceError(err) })
  }

  DeleteRow_onClick(listImplementation: ImplementationPlan) {
    if (confirm('Are you sure want to delete')) {
      this._bvdService.deleteImplementationSchdule(listImplementation.id).subscribe(data => {
        alert("Deleted Successfully");
        this.implementationSchdules = this.implementationSchdules.filter(x => x.id != listImplementation.id);
        this.refreshTable(this.implementationSchdules);
      }, (err) => { this._util.serviceError(err) })
    }
  }

  getFormattedDate(date) {
    if (date == null || date == "Invalid Date")
      return null;

    var datePipe = new DatePipe('en-US');
    return datePipe.transform(date, 'dd-MM-yyyy');
  }

  refreshTable(data) {
    this.dataSource = new MatTableDataSource(data);
  }

  EditRow_onClick(row: ImplementationPlan, id) {
    if (row.actuaL_START_DATE != null)
      this.actualstartDate = new Date(row.actuaL_START_DATE);

    if (row.actuaL_END_DATE != null)
      this.actualendDate = new Date(row.actuaL_END_DATE);

    this.iEditIndex = id;
  }

  setBack() {
    this.setStep.emit(3);
  }

  CancelEdit_onClick() { this.iEditIndex = -1; }

  getRowCount() {
    return this.implementationSchdules.length;
  }
}

