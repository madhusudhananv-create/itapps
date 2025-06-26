import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { myUtility } from '../../Shared/myUtility';
import { AppsService } from '../../Services/apps.service';
import { CssQuestionMasterModel, BatchCustomerAndQuestions } from '../../models/css-question-master-model';
import { CssQuestionRepliesModel } from '../../models/css-question-replies-model';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { RatingCriteriaRemarksComponent } from '../rating-criteria-remarks/rating-criteria-remarks.component';
import { StarRatingColor } from '../star-rating/star-rating.component';
import { E } from '@angular/core/src/render3';
import { ViewTemplateComponent } from '../../../app/controls/view-template/view-template.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent implements OnInit {
  sub: any;
  code: string;
  questions: BatchCustomerAndQuestions = new BatchCustomerAndQuestions();
  questions_Criteria: CssQuestionRepliesModel[] = [];
  questions_NPS: CssQuestionRepliesModel = new CssQuestionRepliesModel();
  questions_Others: CssQuestionRepliesModel[] = [];
  IsCompleted: boolean = false;
  npsRating: number = null;
  bShowNpsComments: boolean = false;
  NpsCommentsTitle: string = '';
  proj: string = '';
  projtext: string = '';
  cust: string = '';
  displayname: string = '';
  isMonthly: boolean = false;
  rating: number = 3;
  starCount: number = 5;
  starColor: StarRatingColor = StarRatingColor.accent;
  starColorP: StarRatingColor = StarRatingColor.primary;
  starColorW: StarRatingColor = StarRatingColor.warn;
  warnNps: boolean = true;
  companyName = environment.company_name;
  dialogMessage: string = '';
  dialogHeading: string = '';
  dialogSuccess: boolean = false;
  // ddRatings = [
  //   { 'key': '1 - Poor', 'value': 1 },
  //   { 'key': '2 - Fair', 'value': 2 },
  //   { 'key': '3 - Good', 'value': 3 },
  //   { 'key': '4 - Very Good', 'value': 4 },
  //   { 'key': '5 - Excellent', 'value': 5 },];

  ddRatings = [
    { 'key': '1 - Dissatisfied', 'value': 1 },
    { 'key': '2 - Somewhat Satisfied', 'value': 2 },
    { 'key': '3 - Satisfied', 'value': 3 },
    { 'key': '4 - Highly Satisfied', 'value': 4 },
    { 'key': '5 - Delighted', 'value': 5 },];

  ddRatings2 = [
    { 'key': '1 - Poor', 'value': 1 },
    { 'key': '2 - Fair', 'value': 2 },
    { 'key': '3 - Good', 'value': 3 },
    { 'key': '4 - Very Good', 'value': 4 },
    { 'key': '5 - Excellent', 'value': 5 },];

  //  (1),  (2),  (3),  (4),  (5)
  @Input('guId') guId: any;
  @Input('showQualitativeFeedback') showQualitativeFeedback: boolean = false;
  @Input('showCSSFields') showCSSFields: boolean = false;
  @ViewChild('confirmationDialog') confirmationDialogTemplate: TemplateRef<any>
  displayTemp: boolean = false;
  pName: any;
  empId: string;
  meetingDate: Date;
  isCSMNotified: boolean = false;
  showTemplate: boolean = false;
  templateName: any;
  templateHeading: any;
  maxDate: Date = new Date();


  constructor(private route: ActivatedRoute, private _util: myUtility, private _appservice: AppsService, public dialog: MatDialog) { }

  ngOnInit() {
    this.questions = new BatchCustomerAndQuestions();
    this.questions_Criteria = [];
    this.questions_NPS = new CssQuestionRepliesModel();
    this.questions_Others = [];

    this.sub = this.route.params.subscribe(params => {
      this.code = params['code'];
      this.service_GetSurveyQuestions(this.code);
    });

    if (this.guId != undefined && this.guId != null) {
      this.displayTemp = true;
      this.service_GetSurveyQuestions(this.guId.guid);
    }
  }

  ngOnChanges() {
    if (this.guId != undefined && this.guId != null) {
      this.displayTemp = true;
      this.service_GetSurveyQuestions(this.guId.guid);
    }
  }

  onCheckboxChange(event: any): void {
    if (event.checked) {
      this.isCSMNotified = true;
    } else {
      this.isCSMNotified = false;
    }
  }

  Rating_OnClick(rating) {
    this.npsRating = Number(rating);
    if (this.npsRating >= 0) {
      if (this.questions_NPS == undefined && this.questions_NPS == null) {
        this.questions_NPS = new CssQuestionRepliesModel();
      }
      this.questions_NPS.rating = this.npsRating;
      if (rating <= 9) {
        this.bShowNpsComments = true;
        if (rating <= 8)
          this.NpsCommentsTitle = "You rated us " + rating.toString() + " out of 10. What improvements could we make to bring your rating closer to 10?";
        else if (rating == 9)
          this.NpsCommentsTitle = "Feedback for Improvement:- What can we do in the future to earn a score of 10?";
      }
      else {
        this.bShowNpsComments = false;
      }
    }
  }
  onInputNpsChange() {
    this.warnNps = false;
    if (this.questions_NPS != undefined && this.questions_NPS != null) {
      const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
      const numberPattern = /^[0-9\s]+$/;
      if ((specialCharPattern.test(this.questions_NPS.ratinG_DESCRIPTION)) || numberPattern.test(this.questions_NPS.ratinG_DESCRIPTION)) {
        this.warnNps = true;
      }
    }
  }


  SubmitForm() {
    if (this.showCSSFields) {
      if (this.meetingDate == null || this.meetingDate == undefined) {
        alert("Please enter the meeting date");
        return;
      }

      if (this.meetingDate > this.maxDate) {
        alert("Future date will not be allowed.");
        return;
      }
    }

    for (let q of this.questions_Criteria) {
      if (q.rating == 0) {
        alert("Please provide rating for '" + q.question + "'");
        return;
      }
      if (q.rating <= 3 && q.rating > 0 && q.ratinG_DESCRIPTION == "") {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {
          Field: q.question,
          Rating: q.rating
        }
        this.dialog.open(RatingCriteriaRemarksComponent, dialogConfig);
        return;
      }
      else if (q.rating <= 3 && q.rating > 0 && q.ratinG_DESCRIPTION != "") {
        const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
        const numberPattern = /^[0-9\s]+$/;
        if ((specialCharPattern.test(q.ratinG_DESCRIPTION)) || numberPattern.test(q.ratinG_DESCRIPTION)) {
          alert('Please enter valid text for improvement areas in text for the project team to act on.');
          return;
        }
      }
    }
    if (this.showQualitativeFeedback) {
      for (let q of this.questions_Others) {
        if ((q.ratinG_DESCRIPTION == undefined || q.ratinG_DESCRIPTION == null || q.ratinG_DESCRIPTION.trim() == "")) {
          alert("Please provide your comments for '" + q.question + "'");
          return;
        }
      }
    }
    if (!this.showQualitativeFeedback && this.questions_NPS != undefined && this.questions_NPS != null) {
      if (this.questions_NPS.rating <= 9 && (this.questions_NPS.ratinG_DESCRIPTION == null ||
        this.questions_NPS.ratinG_DESCRIPTION == undefined || this.questions_NPS.ratinG_DESCRIPTION.trim() == "")) {
        alert("Please provide your comments for '" + this.questions_NPS.question + "'");
        return;
      }
    }

    this.dialogHeading = 'Confirm';
    this.dialogMessage = 'Are you sure you want to submit this feedback? Once submitted, you won\'t be able to modify and re-submit your feedback.';
    const dialogRef = this.dialog.open(this.confirmationDialogTemplate, {
      width: '500px',
      height: '180px',
      data: '',
      position: {
        top: '20px'
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        this.service_SaveSurveyAnswers(this.questions);
      }
    });


  }
  gettry: number = 1
  service_GetSurveyQuestions(code: string) {
    if (code == undefined || code == null) return;
    this._appservice.GetCSSSurveyQuestions(code, this.showQualitativeFeedback, this.showCSSFields).subscribe(data => {
      this.questions = data;
      if (this.questions == undefined || this.questions == null) return;

      this.questions_Criteria = data.csS_QUESTION_REPLIES.filter(t => t.questioN_CATEGORY == 'Criteria').sort(t => t.SEQUENCE);
      this.questions_NPS = data.csS_QUESTION_REPLIES.filter(t => t.questioN_CATEGORY == 'NPS')[0];
      this.questions_Others = data.csS_QUESTION_REPLIES.filter(t => t.questioN_CATEGORY == 'Others').sort(t => t.id);

      if (data.csS_BATCH_CUSTOMERS_EXTENDED != undefined && data.csS_BATCH_CUSTOMERS_EXTENDED != null) {
        this.proj = data.csS_BATCH_CUSTOMERS_EXTENDED.proJ_NM;
        this.cust = data.csS_BATCH_CUSTOMERS_EXTENDED.cusT_NM;
        this.displayname = data.csS_BATCH_CUSTOMERS_EXTENDED.displaY_NAME;
        this.projtext = 'Project/Portfolio:';
        this.meetingDate = data.csS_BATCH_CUSTOMERS_EXTENDED.meetinG_DATE;
        this.isCSMNotified = data.csS_BATCH_CUSTOMERS_EXTENDED.csM_NOTIFIED;
        if (data.csS_BATCH_CUSTOMERS_EXTENDED.status == "COMPLETED") {
          this.IsCompleted = true;
          if (this.questions_NPS != null)
            this.npsRating = this.questions_NPS.rating;
          this.Rating_OnClick(this.npsRating)
        }
      }
      else if (data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED != undefined && data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED != null) {
        this.cust = data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.cusT_NM;
        this.proj = data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.proJ_ID;
        this.displayname = data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.displaY_NAME;
        this.pName = "";
        if (data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.proJ_ID != null)
          this.pName = data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.proJ_NM;
        if (data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.proD_ID != null)
          this.pName = data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.proD_NM;
        if (data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.proJ_ID != null)
          this.projtext = 'Project:';
        if (data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.proD_ID != null)
          this.projtext = 'Project/Portfolio:';
        if (data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.meetinG_DATE != null)
          this.meetingDate = data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.meetinG_DATE;
        if (data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.csM_NOTIFIED != null)
          this.isCSMNotified = data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.csM_NOTIFIED;

        this.isMonthly = true;
        if (data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.status == "COMPLETED") {
          this.IsCompleted = true;
          if (this.questions_NPS != null)
            this.npsRating = this.questions_NPS.rating;
          this.Rating_OnClick(this.npsRating)
        }
      }
    }, error => {
      if (this.gettry == 1) {
        this.gettry = 2;
        this.service_GetSurveyQuestions(code);
      }
      else
        this._util.serviceError(error);
    });
  }

  bbtnSubmitDisable = false;
  service_SaveSurveyAnswers(replies: BatchCustomerAndQuestions) {
    this.bbtnSubmitDisable = true;

    if (this.showCSSFields) {
      this.empId = localStorage.getItem("empid");
      this.meetingDate = new Date(this.meetingDate);
    }
    else {
      this.empId = "";
      this.meetingDate = null;
    }
    this._appservice.SaveCSSSurveyAnswers(replies, this.empId, this.meetingDate, this.isCSMNotified).subscribe(data => {
      this.dialogSuccess = true;
      this.dialogHeading = '';
      this.dialogMessage = 'Thanks for your time!! Customer Satisfaction Survey Submitted successfully. A detailed report would be sent to your mail shortly.';

      const dialogRef = this.dialog.open(this.confirmationDialogTemplate, {
        width: '500px',
        height: '180px',
        data: '',
        position: {
          top: '20px'
        },
      });
      dialogRef.afterClosed().subscribe(result => {
      });
      this.IsCompleted = true;
      if (this.questions.csS_BATCH_CUSTOMERS_EXTENDED != undefined && this.questions.csS_BATCH_CUSTOMERS_EXTENDED != null)
        this.questions.csS_BATCH_CUSTOMERS_EXTENDED.status = "COMPLETED";

      if (this.questions.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED != undefined && this.questions.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED != null)
        this.questions.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.status = "COMPLETED";

    }, error => {
      this.bbtnSubmitDisable = false;
      this._util.serviceError(error);
    });
  }

  getDetail(text) {
    if (text == undefined || text == null || text == "") return "";
    return "(" + text + ")";
  }

  onRatingChanged(newRating: number, index: number) {
    this.questions_Criteria[index].rating = newRating;

    //130003742 — Auto fill rating based on Overall Experience Question
    if (this.questions_Criteria[index].ratinG_PARAM == "Overall Experience" && newRating == 5) {
      this.dialogHeading = 'Quick Check';
      this.dialogMessage = 'Since you have rated 5 for Overall Experience, would you like to rate all other parameters as 5?';
      const dialogRef = this.dialog.open(this.confirmationDialogTemplate, {
        width: '500px',
        height: '180px',
        data: '',
        position: {
          top: '20px'
        },
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 1) {
          for (let i = 0; i < this.questions_Criteria.length; i++) {
            this.questions_Criteria[i].rating = newRating;
          }
        }
      });
    }


  }


  getRemaining(text) {
    return text.length;

  }

  viewTemplate(element) {
    this.showTemplate = true;
    this.templateName = element;
    this.templateHeading = "Mail Template for Customer Success Survey";
  }

  changeEvent(event) {
    this.showTemplate = event;
  }

}