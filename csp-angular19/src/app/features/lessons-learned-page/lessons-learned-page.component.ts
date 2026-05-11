import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';
import { LessonLearntModel } from '../../models/lesson-learnt-model';
import { MyUtility } from '../../shared/my-utility';
import { AppsService } from '../../core/services/apps.service';
import { AccessControl } from '../../shared/access-control';
import { environment } from '../../../environments/environment';
import { LayoutService } from '../layout/layout.service';
import { enumDateRange, enumRoles } from '../../shared/enum';
import { ProjectsModel } from '../../models/projects-model';
import { DialogYesNoComponent } from '../../controls/dialog-yes-no/dialog-yes-no.component';

@Component({
  selector: 'app-lessons-learned-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressBarModule,
    NavbarNewComponent
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './lessons-learned-page.component.html',
  styleUrls: ['./lessons-learned-page.component.scss']
})
export class LessonsLearnedPageComponent implements OnInit {

  editLessonLearnt: LessonLearntModel = new LessonLearntModel();
  readonlymode: boolean = true;
  editmode: boolean = false;
  ddCategoryOfLesson: string[] = [];
  ddProcessArea: string[] = [];
  input_projectid: string = '';
  allLessonsLearnt: any;
  
  private route = inject(ActivatedRoute);
  private _http = inject(HttpClient);
  public _util = inject(MyUtility);
  private _appservice = inject(AppsService);
  public _access = inject(AccessControl);
  public _layoutService = inject(LayoutService);
  private _snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private sub: any;
  input_customerid: string = '';
  allproj: boolean = false;
  projNames: ProjectsModel[] = [];
  showdetails: boolean = false;
  _loading: boolean = true;
  maxdate = new Date();

  @ViewChild('bppaginator') paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns = ['index', 'categorY_OF_LESSON', 'description', 'publisheD_BY', 'publisheD_DATE', 'procesS_AREA', 'edit', 'delete'];
  dataSource!: MatTableDataSource<LessonLearntModel>;

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.input_customerid = params['custid'];
    });

    let role = localStorage.getItem('role');

    if (role == enumRoles.BUHeadIMS.toString() || role == enumRoles.PMO.toString() || role == enumRoles.Quality.toString())
      this.allproj = true;

    this._layoutService.selectedCust = this.input_customerid;
    this.getAllProjectsFromCustomer();
  }

  getAllProjectsFromCustomer() {
    this._appservice.GetCustomerProjectsName(this.input_customerid, this.allproj).subscribe({
      next: (data) => {
        this.projNames = data;

        if (this.projNames != undefined && this.projNames != null && this.projNames.length > 0) {
          this.input_projectid = this.projNames[0].proJ_ID;
          this.onProjectChange();
        }
      },
      error: (error) => {
        this._util.serviceError(error);
      }
    });
  }

  onProjectChange() {
    this.getLessonLearntforProject();
  }

  getLessonLearntforProject() {
    this._loading = true;

    this._appservice.getLessonLearntbyProjId(this.input_projectid).subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource<LessonLearntModel>(data.lessonlearnt);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.ddCategoryOfLesson = data.ddCategoryOfLesson;
        this.ddProcessArea = data.ddProcessArea;
        this.allLessonsLearnt = data.lessonlearnt;

        this.showdetails = true;
        this._loading = false;
      },
      error: (error) => {
        this._loading = false;
        this._util.serviceError(error);
      }
    });
  }

  Edit_onClick() {
    this.readonlymode = false;
    this.editmode = true;
  }

  Cancel_onClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.editLessonLearnt = new LessonLearntModel();
  }

  EditRow_onClick(element: LessonLearntModel) {
    this.editLessonLearnt = element;
    this.editmode = true;
    this.readonlymode = false;
  }

  DeleteRow_onClick(element: LessonLearntModel): void {
    const dialogRef = this.dialog.open(DialogYesNoComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this lesson learned? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
        icon: 'delete',
        iconColor: '#ef4444'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._loading = true;
        this._appservice.deleteLessonLearnt(element).subscribe({
          next: (data) => { 
            this.getLessonLearntforProject();
            this.showToast('Deleted successfully', 'warn');
          },
          error: (error) => { 
            this._util.serviceError(error);
            this.showToast('Failed to delete lesson learned', 'error');
          }
        });
      }
    });
  }

  SubmitForm(isValid: boolean) {
    this._loading = true;
    if (!isValid) {
      this._loading = false;
      this.showToast('Please enter all required fields', 'error');
      return;
    }
    if (this.editLessonLearnt.id === 0 || this.editLessonLearnt.id === undefined) {
      this.editLessonLearnt.projecT_ID = this.input_projectid;
      
      // Set audit fields for new record
      const currentDate = new Date();
      const currentUser = this._util.AppSettings.empid || localStorage.getItem('empid') || '';
      
      this.editLessonLearnt.createD_BY = currentUser;
      this.editLessonLearnt.createD_DATE = currentDate;
      this.editLessonLearnt.updateD_BY = currentUser;
      this.editLessonLearnt.updateD_DATE = currentDate;
      
      this.service_addLessonLearnt(this.editLessonLearnt);
      this.showToast('Lesson learned added successfully', 'success');
      this.readonlymode = true;
      this.editmode = false;
    }
    else {
      // Set audit fields for update
      this.editLessonLearnt.updateD_BY = this._util.AppSettings.empid || localStorage.getItem('empid') || '';
      this.editLessonLearnt.updateD_DATE = new Date();
      
      this.service_updateLessonLearnt(this.editLessonLearnt);
      this.showToast('Lesson learned updated successfully', 'success');
      this.readonlymode = true;
      this.editmode = false;
    }
    this.editLessonLearnt = new LessonLearntModel();
  }

  GetAuthHeader() {
    let headers = new HttpHeaders({ 'Accept': 'application/json' });
    headers = headers.append('token', this._util.AppSettings.token);
    headers = headers.append('empId', localStorage.getItem('empid') || '');
    return headers;
  }

  service_addLessonLearnt(lessonlearnt: LessonLearntModel) {
    let apiuri: string = environment.webapiuri + 'AddLessonLearnt';
    this._http.post(apiuri, lessonlearnt, { headers: this.GetAuthHeader() })
      .subscribe({
        next: (data) => {
          this.getLessonLearntforProject();
        },
        error: (error) => { this._util.serviceError(error); }
      });
  }

  service_updateLessonLearnt(lessonlearnt: LessonLearntModel) {
    let apiuri: string = environment.webapiuri + 'UpdateLessonLearnt';
    this._http.post(apiuri, lessonlearnt, { headers: this.GetAuthHeader() })
      .subscribe({
        next: (data) => {
          this.getLessonLearntforProject();
        },
        error: (error) => { this._util.serviceError(error); }
      });
  }

  bShowFilter: boolean = true;
  ToggleFilter_onClick() {
    this.bShowFilter = !this.bShowFilter;
  }

  Filter_onChange($event: any) {
    let filteredData = $event;
    this.dataSource = new MatTableDataSource(filteredData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Show toast notification
   * @param message Message to display
   * @param type Toast type: 'success', 'warn', or 'error'
   */
  private showToast(message: string, type: 'success' | 'warn' | 'error' = 'success'): void {
    const panelClass = type === 'success' ? 'success-snackbar' : 
                       type === 'warn' ? 'warn-snackbar' : 
                       'error-snackbar';
    
    const duration = type === 'error' ? 4000 : 3000;

    this._snackBar.open(message, 'Close', {
      duration: duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }
}
