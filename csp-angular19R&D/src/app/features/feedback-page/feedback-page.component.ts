import { Component, OnInit, OnChanges, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { LayoutService } from '../layout/layout.service';
import { FeedbackModel } from '../../core/models/feedback-model';
import { AppsService } from '../../core/services/apps.service';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';
import { TableFilterComponent } from '../../shared/components/table-filter/table-filter.component';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';

@Component({
  selector: 'app-feedback-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatDatepickerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    TableFilterComponent,
    NavbarNewComponent
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './feedback-page.component.html',
  styleUrls: ['./feedback-page.component.scss']
})
export class FeedbackPageComponent implements OnInit, OnChanges {

  private route = inject(ActivatedRoute);
  private _appservice = inject(AppsService);
  private changeDetectorRefs = inject(ChangeDetectorRef);
  public _layoutService = inject(LayoutService);
  public _util = inject(MyUtility);
  public _access = inject(AccessControl);
  private _snackBar = inject(MatSnackBar);

  CUST_ID!: string;
  feedbacks!: FeedbackModel[];
  newFeedback!: FeedbackModel;
  editmode: Boolean = false;
  showTable: boolean = true;
  mindate = new Date();
  _loading: boolean = true;

  filterCriteria: any;
  filteredData: any;

  @ViewChild('tabpaginator') paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  // displayedColumns = ['index' ,'email','description', 'status', 'remarks','date','targetdate','action'];
  displayedColumns = ['tickeT_ID', 'customeR_EMAILID', 'feedback', 'status', 'comments', 'createD_DATE', 'targeT_DATE', 'action'];

  /*
   {id: 14, customeR_ID: 202100010, customeR_EMAILID: "Rahamath.Mulabagal@ihsmarkit.com", feedback: "testFdbackupdatednew", status: "Submitted", …} 
   */

  dataSource!: MatTableDataSource<FeedbackModel>

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.CUST_ID = params['custid'];
      this._layoutService.selectedCust = this.CUST_ID;

    });
    this.feedbacks = [];
    this.newFeedback = new FeedbackModel;
    this.LoadDetails();

  }

  ngAfterViewInit() {
    if (this.dataSource != undefined) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    this.changeDetectorRefs.detectChanges();
  }

  ngOnChanges() {
    this.LoadDetails();
  }

  LoadDetails() {
    this._appservice.getFeedbacks(this.CUST_ID).subscribe({
      next: (data: any) => {
        this.feedbacks = data;
        this.dataSource = new MatTableDataSource<FeedbackModel>(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this._loading = false;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  SubmitForm(isValid: any) {
    this._loading = true;
    if (!isValid) {
      this.showToast('Please enter required fields', 'warn');
      this._loading = false;
      return;
    }
    if (this.newFeedback.id === 0 || this.newFeedback.id === undefined) {
      this.newFeedback.id = 0;
      this.newFeedback.customeR_ID = this.CUST_ID;
      this.newFeedback.customeR_EMAILID = localStorage.getItem('empid') || undefined;
      this.newFeedback.status = "New";
      this.newFeedback.createD_BY = localStorage.getItem('empid') || undefined;
      this.newFeedback.createD_DATE = new Date();
      this.newFeedback.updateD_BY = localStorage.getItem('empid') || undefined;
      this.newFeedback.updateD_DATE = new Date();

      this._appservice.addFeedback(this.newFeedback)
        .subscribe({
          next: (data: any) => {
            this.feedbacks.push(data);
            this.showToast('Feedback sent successfully', 'success');
            this.LoadDetails();
            this._loading = false;
          },
          error: (error: any) => { 
            this._util.serviceError(error);
            this.showToast('Something went wrong', 'error');
            this._loading = false;
          }
        });
    }
    else {
      this.newFeedback.updateD_BY = localStorage.getItem('empid') || undefined;
      this.newFeedback.updateD_DATE = new Date();
      this._appservice.updateFeedback(this.newFeedback)
        .subscribe({
          next: (data: any) => {
            this.showToast('Feedback updated successfully', 'success');
            this.LoadDetails();
            this._loading = false;
          },
          error: (error: any) => { 
            this._util.serviceError(error);
            this.showToast('Something went wrong', 'error');
            this._loading = false;
          }
        });
    }
    this.newFeedback = new FeedbackModel;
    this.editmode = false;
    this.showTable = true;

    this.changeDetectorRefs.detectChanges();
  }

  EditRow_onClick(element: any) {
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
    this.showTable = false;
  }
  Cancel_onClick() {
    this.editmode = false;
    this.showTable = true;
  }
  ClientCancel_OnClick() {

    this.showTable = true;
    this.editmode = false;
    this.newFeedback = new FeedbackModel();
  }

  AddFeedback_onClick() {
    this.showTable = false;
    this.editmode = true;
  }

  Filter_onChange($event: any) {

    // let filteredData = $event;
    this.filterCriteria = $event.criteria;
    this.filterData();

  }

  filterData() {

    this.filteredData = this._util.ApplyCriteriaRange(this.filterCriteria, this.feedbacks);
    this.RefreshTableForProject(this.filteredData);

  }


  RefreshTableForProject(data: any) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Toast notification helper (bottom-center position)
  private showToast(message: string, type: 'success' | 'warn' | 'error'): void {
    const duration = type === 'error' ? 4000 : 3000;
    const panelClass = `${type}-snackbar`;

    this._snackBar.open(message, 'Close', {
      duration: duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [panelClass]
    });
  }

}
