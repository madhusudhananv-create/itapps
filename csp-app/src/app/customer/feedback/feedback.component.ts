import { Component, OnInit, Input } from '@angular/core';
import { AppsService } from '../../Services/apps.service';
import { FeedbackModel } from '../../models/feedback-model';
import { myUtility } from '../../Shared/myUtility';
import { AccessControl } from '../../Shared/accessControl';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
  @Input('CustomerId') CUST_ID: string;
  feedbacks: FeedbackModel[];
  newFeedback: FeedbackModel;
  editmode: Boolean = false;
  constructor(private _appservice: AppsService, public _util: myUtility, private _access:AccessControl) { }

  ngOnInit() {
    this.feedbacks = [];
    this.newFeedback = new FeedbackModel;
    //this.LoadDetails();
  }
  ngOnChanges() {
    this.LoadDetails();
  }
  LoadDetails() {
    this._appservice.getFeedbacks(this.CUST_ID).subscribe(data => { 
      this.feedbacks = data;
     }, error => { this._util.serviceError(error); });
  }
  SubmitForm(isValid) {
    if (!isValid) {
      alert("Please enter required fields");
      return;
    }
    if (this.newFeedback.id === 0 || this.newFeedback.id === undefined) {
      this.newFeedback.id = 0;
      this.newFeedback.customeR_ID = this.CUST_ID;
      this.newFeedback.customeR_EMAILID = localStorage.getItem('empid');
      this.newFeedback.status = "New";
      this.newFeedback.createD_BY = localStorage.getItem('empid');
      this.newFeedback.createD_DATE = new Date();
      this.newFeedback.updateD_BY = localStorage.getItem('empid');
      this.newFeedback.updateD_DATE = new Date();
      this._appservice.addFeedback(this.newFeedback)
        .subscribe(data => {
          this.feedbacks.push(data);
          alert("Feedback sent successfully")
        }, error => { this._util.serviceError(error); });
    }
    else {
      this.newFeedback.updateD_BY = localStorage.getItem('empid');
      this.newFeedback.updateD_DATE = new Date();
      this._appservice.updateFeedback(this.newFeedback)
        .subscribe(data => {
          this.LoadDetails();
        }, error => { this._util.serviceError(error); });
    }
    this.newFeedback = new FeedbackModel;
    this.editmode = false;
  }

  EditRow_onClick(element) {
    this.newFeedback.id = element.id;
    this.newFeedback.customeR_ID = element.customeR_ID;
    this.newFeedback.customeR_EMAILID = element.customeR_EMAILID;
    this.newFeedback.feedback = element.feedback;
    this.newFeedback.status = element.status;
    this.newFeedback.comments = element.comments;
    this.newFeedback.createD_BY = element.createD_BY;
    this.newFeedback.createD_DATE = element.createD_DATE;
    this.newFeedback.updateD_BY = element.updateD_BY;
    this.newFeedback.updateD_DATE = element.updateD_DATE;
    this.newFeedback.isactive = element.isactive;
    this.editmode = true;
  }
  Cancel_onClick(){
    this.editmode = false;
  }
  ClientCancel_OnClick(){
    this.newFeedback = new FeedbackModel();
  }
}
