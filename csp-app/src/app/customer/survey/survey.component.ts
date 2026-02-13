import { Component, OnInit, Input, ViewChild, TemplateRef, ViewChildren, QueryList } from '@angular/core';
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
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { MatTooltip } from '@angular/material/tooltip';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

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
  bShowNpsComments: boolean = true;
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
  formerlyText = environment.formerly_text;
  dialogMessage: string = '';
  dialogHeading: string = '';
  dialogSuccess: boolean = false;
  dialogExpiry: boolean = false;
  hasRatingBeenSelected: boolean = false;
  disableSubmit: boolean = false;
  dropdownName: string = "QUALITATIVE_ANALYSIS";
  dropdownText: any;
  loading: boolean = false;
  lastEmpId: string;
  lastUpdateDateQualitative: Date;
  lastUpdateByQualitative: string;
  @ViewChildren(MatTooltip) tooltips!: QueryList<MatTooltip>;
  replies: CssQuestionRepliesModel[] = [];

  private currentOpenTooltip: MatTooltip | null = null;
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
  @Input('showQualitativeAnalysisFields') showQualitativeAnalysisFields: boolean = false;
  @Input('disableSubmitQualitative') disableSubmitQualitative: boolean = false;
  @Input('isQualitativeEditable') isQualitativeEditable: boolean = false;
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
  // rowspan: number = 1;

  constructor(private route: ActivatedRoute, private _util: myUtility, private _appservice: AppsService, public dialog: MatDialog,
    private _spinner: Ng4LoadingSpinnerService
  ) { }

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
      this.getDropdownValues();
    }
    document.addEventListener('click', () => {
      if (this.currentOpenTooltip) {
        this.currentOpenTooltip.hide();
        this.currentOpenTooltip = null;
      }
    });
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
    if (this.IsCompleted) return;
    this.npsRating = Number(rating);
    if (this.npsRating >= 0) {
      if (this.questions_NPS == undefined && this.questions_NPS == null) {
        this.questions_NPS = new CssQuestionRepliesModel();
      }
      this.questions_NPS.rating = this.npsRating;
      this.hasRatingBeenSelected = true;
      // if (rating < 9) {
      //   this.bShowNpsComments = true;
      //   // if (rating <= 8)
      //   //   this.NpsCommentsTitle = "You rated us " + rating.toString() + " out of 10. What improvements could we make to bring your rating closer to 10?";
      //   // else if (rating == 9)
      //   //   this.NpsCommentsTitle = "Feedback for Improvement:- What can we do in the future to earn a score of 10?";
      // }
      // else {
      //   this.bShowNpsComments = false;
      // }
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

  showWarningPopup(message: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      Message: message,
    }
    dialogConfig.hasBackdrop = true;
    dialogConfig.scrollStrategy = new NoopScrollStrategy();
    this.dialog.open(RatingCriteriaRemarksComponent, dialogConfig);
  }


  SubmitForm(val) {
    if (val == 0) {
      if (this.showCSSFields) {
        if (this.meetingDate == null || this.meetingDate == undefined) {
          this.showWarningPopup("Please enter the meeting date");
          return;
        }

        if (this.meetingDate > this.maxDate) {
          this.showWarningPopup("Future date will not be allowed.");
          return;
        }
      }
      if (this.questions_NPS != undefined && this.questions_NPS != null) {
        if (!this.hasRatingBeenSelected) {
          this.showWarningPopup("Kindly provide rating for '" + this.questions_NPS.question + "'");
          return;
        }
        if (this.questions_NPS.rating >= 0 && this.questions_NPS.rating < 9 && this.questions_NPS.ratinG_DESCRIPTION == "") {
          this.showWarningPopup("Kindly provide remarks in highlighted fields if the rating is less than 9.");
          return;
        }
      }

      for (let q of this.questions_Criteria) {
        if (q.rating == 0) {
          this.showWarningPopup("Kindly provide rating for '" + q.question + "'");
          return;
        }
        if (q.rating <= 3 && q.rating > 0 && q.ratinG_DESCRIPTION == "") {
          this.showWarningPopup("Kindly provide remarks in highlighted fields if the rating is less than 4 stars.");
          return;
        }
        else if (q.rating <= 3 && q.rating > 0 && q.ratinG_DESCRIPTION != "") {
          const specialCharPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
          const numberPattern = /^[0-9\s]+$/;
          if ((specialCharPattern.test(q.ratinG_DESCRIPTION)) || numberPattern.test(q.ratinG_DESCRIPTION)) {
            this.showWarningPopup("Please enter valid text for improvement areas in text for the project team to act on.");
            return;
          }
        }

      }


      if (this.showQualitativeFeedback) {
        for (let q of this.questions_Others) {
          if ((q.ratinG_DESCRIPTION == undefined || q.ratinG_DESCRIPTION == null || q.ratinG_DESCRIPTION.trim() == "")) {
            this.showWarningPopup("Please provide your comments for '" + q.question + "'");
            return;
          }
        }
      }
      if (!this.showQualitativeFeedback && this.questions_NPS != undefined && this.questions_NPS != null) {
        if (this.questions_NPS.rating < 9 && (this.questions_NPS.ratinG_DESCRIPTION == null ||
          this.questions_NPS.ratinG_DESCRIPTION == undefined || this.questions_NPS.ratinG_DESCRIPTION.trim() == "")) {
          this.showWarningPopup("Please provide your comments for '" + this.questions_NPS.question + "'");
          return;
        }
      }
    }
    if (val === 0) {
      this.dialogSuccess = false;
      this.dialogHeading = 'Quick Confirmation';
      this.dialogMessage = 'Are you sure you want to submit this feedback? Once submitted, you won\'t be able to modify and re-submit your feedback.';
      const dialogRef = this.dialog.open(this.confirmationDialogTemplate, {
        width: '500px',
        height: '180px',
        data: '',
        hasBackdrop: true,
        scrollStrategy: new NoopScrollStrategy(),
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 1) {
          this.disableSubmit = true;
          this.service_SaveSurveyAnswers(this.questions, false);
        }
      });
    }
    else {
      this.service_SaveSurveyAnswers(this.questions, true);
    }

  }


  SubmitFormQualitative(val: number) {

    if (val === 1) {

      // 1. Validate Criteria Questions 
      for (let q of this.questions_Criteria) {
        if (q.ratinG_DESCRIPTION && q.ratinG_DESCRIPTION.trim() !== "") {
          if (!q.qualitativE_CATEGORY || q.qualitativE_CATEGORY === "") {
            this.showWarningPopup(`Please select a Category for the question: "${q.question}"`);
            return;
          }
          if (!q.qualitativE_STATUS || q.qualitativE_STATUS === "") {
            this.showWarningPopup(`Please select a Status for the question: "${q.question}"`);
            return;
          }
        }
      }

      // 2. Validate NPS Question 
      if (this.questions_NPS && this.questions_NPS.ratinG_DESCRIPTION && this.questions_NPS.ratinG_DESCRIPTION.trim() !== "") {
        if (!this.questions_NPS.qualitativE_CATEGORY || this.questions_NPS.qualitativE_CATEGORY === "") {
          this.showWarningPopup(`Please select a Category for the NPS feedback.`);
          return;
        }
        if (!this.questions_NPS.qualitativE_STATUS || this.questions_NPS.qualitativE_STATUS === "") {
          this.showWarningPopup(`Please select a Status for the NPS feedback.`);
          return;
        }
      }

      // 3. Validate "Others" Questions 
      for (let q of this.questions_Others) {
        if (q.ratinG_DESCRIPTION && q.ratinG_DESCRIPTION.trim() !== "") {
          if (!q.qualitativE_CATEGORY || q.qualitativE_CATEGORY === "") {
            this.showWarningPopup(`Please select a Category for the question: "${q.question}"`);
            return;
          }
          if (!q.qualitativE_STATUS || q.qualitativE_STATUS === "") {
            this.showWarningPopup(`Please select a Status for the question: "${q.question}"`);
            return;
          }
        }
      }

      for (let q of this.questions.csS_QUESTION_REPLIES) {
        const hasCategory = q.qualitativE_CATEGORY && q.qualitativE_CATEGORY !== "";
        const hasStatus = q.qualitativE_STATUS && q.qualitativE_STATUS !== "";

        if (hasCategory || hasStatus) {
          if (!hasCategory) {
            this.showWarningPopup(`Please select Category for: "${q.question}"`);
            return;
          }
          if (!hasStatus) {
            this.showWarningPopup(`Please select Status for: "${q.question}"`);
            return;
          }
        }
      }

    }
    if (val === 1) {
      this.openConfirmationDialog('Quick Confirmation', 'Are you sure you want to submit this qualitative feedback? Once submitted, you won\'t be able to modify and re-submit your feedback.',
        '500px', '180px', false).afterClosed().subscribe(result => {
          if (result === 1) {
            this._spinner.show();
            this.disableSubmitQualitative = true;
            this.loading = true;
            this.questions.csS_QUESTION_REPLIES = this.questions.csS_QUESTION_REPLIES.map(q => {
              q.qualitativE_SUBMITTED = true;
              return q;
            });
            this.update_surveyQualitativeAnswers(this.questions.csS_QUESTION_REPLIES);
          }
          else {
            this.loading = false;
            this.disableSubmitQualitative = false;
            return;
          }
        });
    }
    else {
      this._spinner.show();
      this.questions.csS_QUESTION_REPLIES = this.questions.csS_QUESTION_REPLIES.map(q => {
        q.qualitativE_SUBMITTED = false;
        return q;
      });
      this.update_surveyQualitativeAnswers(this.questions.csS_QUESTION_REPLIES);

    }

  }


  update_surveyQualitativeAnswers(replies: CssQuestionRepliesModel[]) {
    this._appservice.UpdateCSSSurveyQualitativeFeedback(replies).subscribe(data => {
      this._spinner.hide();
      const space = '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0';
      this.dialogSuccess = true;
      this.dialogHeading = '';
      this.loading = false;
      if (replies.filter(r => r.qualitativE_SUBMITTED == false).length > 0) {
        this.dialogMessage = space + 'Qualitative Analysis feedback saved as draft successfully.';
      }
      else {
        this.dialogMessage = space + 'Qualitative Analysis feedback submitted successfully.';
      }
      this.openConfirmationDialog('', this.dialogMessage,
        '450px', '150px', true).afterClosed().subscribe(result => {
          if (result === 1) {
            return;
          }
        });
    }, error => {
      const errorMsg = this._util.GetErrorMessage(error);
      this._spinner.hide();
    }
    );
  }
  clearRowQualitative(item: any) {
    if (item && !item.QUALITATIVE_ISSUBMITTED) {
      item.qualitativE_CATEGORY = '';
      item.qualitativE_STATUS = '';
      item.qualitativE_REMARKS = '';
    }
  }

  getNPSRating() {
    if (this.questions_NPS != null) {
      this.npsRating = this.questions_NPS.rating;
      this.Rating_OnClick(this.npsRating)
    }
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
      if (this.showQualitativeAnalysisFields) {
        const hasQualitativeData = data.csS_QUESTION_REPLIES.some(q =>
         !! (q.qualitativE_CATEGORY || q.qualitativE_STATUS || q.qualitativE_REMARKS)
        );

        if (hasQualitativeData) {
          this.lastEmpId = data.csS_QUESTION_REPLIES[0].updateD_BY;
          this.lastUpdateDateQualitative = data.csS_QUESTION_REPLIES[0].updateD_DATE;
          this.getEmpName();
        } else {
          this.lastUpdateByQualitative = 'NA';
        }
      }

      this.disableSubmitQualitative = this.questions.csS_QUESTION_REPLIES.filter(r => r.qualitativE_SUBMITTED == true).length > 0 ? true : false;
      if (!this.isQualitativeEditable) {
        this.disableSubmitQualitative = true;
      }

      if (data.csS_BATCH_CUSTOMERS_EXTENDED != undefined && data.csS_BATCH_CUSTOMERS_EXTENDED != null) {
        this.proj = data.csS_BATCH_CUSTOMERS_EXTENDED.proJ_NM;
        this.cust = data.csS_BATCH_CUSTOMERS_EXTENDED.cusT_NM;
        this.displayname = data.csS_BATCH_CUSTOMERS_EXTENDED.displaY_NAME;
        this.projtext = 'Project/Portfolio:';
        this.meetingDate = data.csS_BATCH_CUSTOMERS_EXTENDED.meetinG_DATE;
        this.isCSMNotified = data.csS_BATCH_CUSTOMERS_EXTENDED.csM_NOTIFIED;

        // if (data.csS_BATCH_CUSTOMERS_EXTENDED.proJ_ID == null)
        //   this.rowspan = 2;
        if (data.csS_BATCH_CUSTOMERS_EXTENDED.status == "COMPLETED") {
          this.IsCompleted = true;
          this.bShowNpsComments = true;
          this.getNPSRating();
        }
        else if (data.csS_BATCH_CUSTOMERS_EXTENDED.status == "DRAFT") {
          this.getNPSRating();
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
          this.bShowNpsComments = true;
          this.getNPSRating();
        }
        else if (data.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.status == "DRAFT") {
          this.getNPSRating();
        }
      }
    }, error => {
      if (this.gettry == 1) {
        this.gettry = 2;
        this.service_GetSurveyQuestions(code);
      }
      else {
        const errorMsg = this._util.GetErrorMessage(error);

        this.showCSSFields = false;
        // this.bShowNpsComments = false;
        this.questions_NPS = null;
        this.IsCompleted = true;
        if (errorMsg.includes("This survey is now closed")) {
          this.dialogSuccess = true;
          this.dialogExpiry = true;
          this.dialogHeading = 'Survey Closed!';
          this.dialogMessage = errorMsg;
          const dialogRef = this.dialog.open(this.confirmationDialogTemplate, {
            width: '600px',
            height: '250px',
            data: '',
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result === 1) {
            }
          });
        }
        else {
          this._util.serviceError(error);
        }
      }
    });

  }

  getEmpName() {
    this._appservice.getEmpNameById(this.lastEmpId).subscribe(
      data => {
        if (this.showQualitativeAnalysisFields)
          this.lastUpdateByQualitative = data;
      },
      error => {
        { this._util.serviceError(error); }
      }
    )
  }

  bbtnSubmitDisable = false;
  service_SaveSurveyAnswers(replies: BatchCustomerAndQuestions, isDraft: boolean) {
    //this.bbtnSubmitDisable = true;

    if (this.showCSSFields) {
      this.empId = localStorage.getItem("empid");
      this.meetingDate = new Date(this.meetingDate);
    }
    else {
      this.empId = "";
      this.meetingDate = null;
    }
    this._appservice.SaveCSSSurveyAnswers(replies, this.empId, isDraft, this.meetingDate, this.isCSMNotified).subscribe(data => {
      this.dialogSuccess = true;
      this.dialogExpiry = false;
      this.dialogHeading = '';
      if (isDraft) {
        this.dialogMessage = 'Your response to the Customer Satisfaction Survey is saved as draft. You can modify and submit later.';
      } else {
        this.dialogMessage = 'Thanks for your time! Customer Satisfaction Survey submitted successfully. A detailed report will be sent to your e-mail shortly.';
        this.IsCompleted = true;
        if (this.questions.csS_BATCH_CUSTOMERS_EXTENDED != undefined && this.questions.csS_BATCH_CUSTOMERS_EXTENDED != null)
          this.questions.csS_BATCH_CUSTOMERS_EXTENDED.status = "COMPLETED";

        if (this.questions.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED != undefined && this.questions.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED != null)
          this.questions.csS_BATCH_CUSTOMER_MONTHLY_EXTENDED.status = "COMPLETED";
      }

      const dialogRef = this.dialog.open(this.confirmationDialogTemplate, {
        width: '500px',
        height: '170px',
        data: '',
        hasBackdrop: true,
        scrollStrategy: new NoopScrollStrategy()
      });
      dialogRef.afterClosed().subscribe(result => {
      });

    }, error => {
      //this.bbtnSubmitDisable = false;
      this._util.serviceError(error);
    });
  }


  private openConfirmationDialog(
    heading: string,
    message: string,
    width: string = '500px',
    height: string = '180px',
    isSuccess: boolean = false,
    isExpiry: boolean = false
  ) {
    this.dialogHeading = heading;
    this.dialogMessage = message;
    this.dialogSuccess = isSuccess;
    this.dialogExpiry = isExpiry;

    return this.dialog.open(this.confirmationDialogTemplate, {
      width: width,
      height: height,
      hasBackdrop: true,
      scrollStrategy: new NoopScrollStrategy(),
    });

  }
  getDetail(text) {
    if (text == undefined || text == null || text == "") return "";
    return text;
  }

  onInfoIconClick(event: MouseEvent, tooltip: MatTooltip): void {
    event.stopPropagation();

    // If there's already an open tooltip, hide it
    if (this.currentOpenTooltip && this.currentOpenTooltip !== tooltip) {
      this.currentOpenTooltip.hide();
    }

    // Toggle the clicked tooltip
    if (tooltip['_isTooltipVisible']()) {
      tooltip.hide();
      this.currentOpenTooltip = null;
    } else {
      tooltip.show();
      this.currentOpenTooltip = tooltip;
    }
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
        data: ''
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

  getDropdownValues() {
    this._appservice.getDropdownValues(this.dropdownName).subscribe((data) => {
      if (data) {
        this.dropdownText = data;
      }
    })
  }

}