import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BvdEntryService } from '../services/bvd-entry.service';
import { myUtility } from '../../../Shared/myUtility';
import { IdeaStatus } from '../../../models/bvd-entry/idea-model';
import { IdeaReview } from '../../../models/bvd-entry/idea-review-model';
import { MatStepper } from '@angular/material';


@Component({
  selector: 'app-idea-review-approve',
  templateUrl: './idea-review-approve.component.html',
  styleUrls: ['./idea-review-approve.component.scss', '../bvd-entry-shared-css.scss']
})
export class IdeaReviewApproveComponent implements OnInit {

  stages: any[] = [];
  status: any[] = [];
  review = new IdeaReview();
  isLoading: boolean = false;
  @ViewChild('stepper') stepper: MatStepper;
  disabled: boolean = false;
  @Output() setStep: EventEmitter<number> = new EventEmitter<number>();

  constructor(private _bvdService: BvdEntryService, public _util: myUtility) {
    if (this._bvdService.bvdreview && this._bvdService.bvdreview != null)
      this.review = this._bvdService.bvdreview;
  }

  setBack() {
    this.setStep.emit(2);
  }

  setNext() {
    this.setStep.emit(4);
  }

  ngOnInit() {
    //this.status = this._util.enumSelector(IdeaStatus)
    this.getIdeaStages();
    this.getIdeaStatus();
  }


  getIdeaStatus() {
    this._bvdService.getIdeaStatus().subscribe(data => {
      this.status = data;
      this.status = this.status.filter(x => x.stagE_ID == 4);
      console.log("reviewer status", this.status);
    }, (err) => { this._util.serviceError(err) })
  }


  getIdeaStages() {
    if (!this._bvdService.ideA_ID || this._bvdService.ideA_ID == 0)
      return;

    this._bvdService.getIdeaStages(this._bvdService.ideA_ID).subscribe(data => {
      this._bvdService.bvdstages = data;
      if (this.review.ideA_STATUS_ID == 4 || this.review.ideA_STATUS_ID == 3) {
        this.disabled = true;
        this._bvdService.isIdeaApproved = true;
      }
      //this.stepper.selectedIndex = this._bvdService.bvdstages.length > 0 ? this._bvdService.bvdstages.length - 1 : -1;
    }, (err) => { this._util.serviceError(err); })
  }

  getStatusTitle(id) {
    let statusRec = this.status.find(x => x.id == id);
    if (statusRec != undefined)
      return statusRec.title

    return "";
  }

  submitReviewerResponse() {
    console.log("reviewer response", this.review.ideA_STATUS_ID);
    if (!this.review.ideA_STATUS_ID || this.review.ideA_STATUS_ID == null) {
      alert('Please choose a reponse before submitting');
      return;
    }
    this.review.ideA_ID = this._bvdService.ideA_ID;
    this.review.ideA_STATUS_TITLE = this.getStatusTitle(this.review.ideA_STATUS_ID);
    this._bvdService.saveReviewerResponse(this.review).subscribe(data => {
      alert('Response submitted successfully');

      this.getIdeaStages();

      if (this.review.ideA_STATUS_ID == 5)
        this._bvdService.isIdeaSubmitted = false;

    }, (err) => { this._util.serviceError(err); })
  }

}
