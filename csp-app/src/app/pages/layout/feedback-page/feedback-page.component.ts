import { Component, OnInit, OnChanges, ViewChild, ChangeDetectorRef } from '@angular/core';
import { LayoutService } from '../layout.service';
import { FeedbackModel } from '../../../models/feedback-model';
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';
import { AccessControl } from '../../../Shared/accessControl';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-feedback-page',
  templateUrl: './feedback-page.component.html',
  styleUrls: ['./feedback-page.component.scss']
})
export class FeedbackPageComponent implements OnInit,OnChanges {

  CUST_ID: string;
  feedbacks: FeedbackModel[];
  newFeedback: FeedbackModel;
  editmode: Boolean = false;
  showTable:boolean=true;
  mindate=new Date();
  _loading:boolean=true;

  filterCriteria:any;
  filteredData: any;

  @ViewChild('tabpaginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  // displayedColumns = ['index' ,'email','description', 'status', 'remarks','date','targetdate','action'];
  displayedColumns = ['tickeT_ID' ,'customeR_EMAILID','feedback', 'status', 'comments','createD_DATE','targeT_DATE','action'];

  /*
   {id: 14, customeR_ID: 202100010, customeR_EMAILID: "Rahamath.Mulabagal@ihsmarkit.com", feedback: "testFdbackupdatednew", status: "Submitted", …} 
   */

  dataSource : MatTableDataSource<FeedbackModel>

  constructor(public _layoutService: LayoutService,private route: ActivatedRoute,private _appservice: AppsService, public _util: myUtility, private _access:AccessControl,private changeDetectorRefs: ChangeDetectorRef) { }

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.CUST_ID = params['custid'];
      this._layoutService.selectedCust=this.CUST_ID;
      
    });
    this.feedbacks = [];
    this.newFeedback = new FeedbackModel;
    this.LoadDetails();
    
  }

  ngAfterViewInit() {
    if(this.dataSource != undefined)
    { 
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    }
    this.changeDetectorRefs.detectChanges();
  }

  ngOnChanges() {
    this.LoadDetails();
    //console.log("in ngonchanges");
  }

  LoadDetails() {
    this._appservice.getFeedbacks(this.CUST_ID).subscribe(data => { 
      this.feedbacks = data;
      this.dataSource = new MatTableDataSource<FeedbackModel>(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort; 
      this._loading=false;
      //console.log("this.feedbacks",this.feedbacks);

     }, error => { this._util.serviceError(error); });
  }

  SubmitForm(isValid) {
    this._loading=true;
    if (!isValid) {
      alert("Please enter required fields");
      this._loading=false;
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
          this.LoadDetails();
          this._loading=false;
        }, error => { this._util.serviceError(error); });
    }
    else {
      this.newFeedback.updateD_BY = localStorage.getItem('empid');
      this.newFeedback.updateD_DATE = new Date();
      this._appservice.updateFeedback(this.newFeedback)
        .subscribe(data => {
          alert("Feedback updated successfully")
          this.LoadDetails();
          this._loading=false;
        }, error => { this._util.serviceError(error); });
    }
    this.newFeedback = new FeedbackModel;
    this.editmode = false;
    this.showTable=true;

    this.changeDetectorRefs.detectChanges();
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
    this.newFeedback.targeT_DATE = element.targeT_DATE;
    this.newFeedback.isactive = element.isactive;
    this.editmode = true;
    this.showTable=false;
  }
  Cancel_onClick(){
    this.editmode = false;
    this.showTable=true;
  }
  ClientCancel_OnClick(){
    
    this.showTable=true;
    this.editmode = false;
    this.newFeedback = new FeedbackModel();
  }

  AddFeedback_onClick(){
    this.showTable=false;
    this.editmode = true;
  }

  Filter_onChange($event) {

    // let filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filterData();

  }

  filterData() {
     
    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.feedbacks);
    this.RefreshTableForProject(this.filteredData);
    
  }
  

  RefreshTableForProject(data) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
