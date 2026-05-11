import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UtilityService } from '../../../../core/services/utility.service';
import { MyUtility } from '../../../../shared/my-utility';
import { HighlightsModel } from '../../../../models/highlights-model';
import { AppsService } from '../../../../services/apps.service';
import { ChartsService } from '../../../../services/charts.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-notes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './add-notes.component.html',
  styleUrls: ['./add-notes.component.scss']
})
export class AddNotesComponent implements OnInit {

  readonlymode: boolean = true;
  editmode: boolean = false;
  menuToggleStatus: boolean = false;
  input: any;
  tableMonth: string | undefined;
  tableYear: number | undefined;
  tableWeek: any;
  dataSource = new MatTableDataSource<any>();
  displayedColumns = ['index', 'description', 'publisH_DATE', 'edit'];


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  tempNote: HighlightsModel = {} as HighlightsModel;
  newNote: HighlightsModel = {} as HighlightsModel;



  constructor(
    private dialogRef: MatDialogRef<AddNotesComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private _util: UtilityService,
    private _myUtil: MyUtility,
    private _appservice: AppsService,
    private _chartsService: ChartsService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    if (this.data != null && this.data != undefined) {
      this.input = this.data;
    }
    
    // Initialize dataSource - always create it even if empty
    this.dataSource = new MatTableDataSource<any>([]);
    
    // Populate dataSource with notes data if available
    if (this.input && this.input.notes && Array.isArray(this.input.notes) && this.input.notes.length > 0) {
      // Sort notes first
      this.input.notes.forEach((i: any) => {
        i.tempmonth = i.publisH_DATE + " " + i.week
      })
      this.input.notes.sort((x: any, y: any): number => {
        if (x.tempmonth > y.tempmonth) return -1;
        if (x.tempmonth < y.tempmonth) return 1;
        return 0;
      });
      this.dataSource.data = this.input.notes;
    } else {
      console.warn('No notes data available');
      this.dataSource.data = [];
    }
  }

  ngAfterViewInit() {
    // Set paginator and sort after view initialization
    setTimeout(() => {
      if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
      this.tableWeek = 0;
      // Trigger change detection to update the view
      this.cdr.detectChanges();
    }, 100);
  }

  // Remove ngOnChanges - not needed for dialog component
  // ngOnChanges() {
  //   this.dataSource = new MatTableDataSource<any>(this.input.notes);
  //   this.dataSource.paginator = this.paginator;
  //   this.dataSource.sort = this.sort;
  // }
  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

  addNotes_OnClick() {
    this.newNote = {} as HighlightsModel;
    this.tableMonth = undefined;
    this.tableYear = undefined
    this.readonlymode = false;
    this.editmode = true;
  }

  saveNotes() {
    const specialCarPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;
    if (specialCarPattern.test(this.newNote.description) || numberPattern.test(this.newNote.description)) {
      this.snackBar.open('Invalid Description - Please enter alphanumeric or numeric values along with special characters for description', 'Close', {
        duration: 5000,
        panelClass: ['warning-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }


    if ((this.newNote.description != undefined && this.newNote.description != null && this.newNote.description.trim() != '') && (this.tableMonth != undefined || this.tableMonth != null || this.tableMonth != '')
      && (this.tableYear != undefined || this.tableYear != null)) {
      if (this.newNote.id === 0 || this.newNote.id === undefined) {
        // let publishDate = "01" + this.tableMonth + this.tableYear.toString();
        let monthnum = this.getMonthNum(this.tableMonth!);
        let publishDate = new Date(Date.UTC(this.tableYear!, monthnum, 1));
        this.newNote.publisH_DATE = publishDate;

        // Copy object to new one

        let dbNotes = this.CopyObject(this.newNote);

        dbNotes.description = dbNotes.description.trim();
        // dbNotes.id = 0;
        dbNotes.publisH_DATE = this.GetLocalDate(dbNotes.publisH_DATE);
        dbNotes.customeR_ID = this.input.custid;
        dbNotes.projecT_ID = null;
        dbNotes.portfoliO_ID = null;
        dbNotes.createD_BY = localStorage.getItem('empid');
        dbNotes.createD_DATE = new Date();
        dbNotes.week = this.tableWeek;

        // Add row to database
        this.service_addNotes(dbNotes);

        // Add row to mat-table data source
        // this.input.notes.push(dbNotes);

      }
      else {
        let monthnum = this.getMonthNum(this.tableMonth!);
        let publishDate = new Date(this.tableYear!, monthnum, 1);
        this.newNote.publisH_DATE = publishDate;
        let dbNotes = this.CopyObject(this.newNote);
        dbNotes.publisH_DATE = this.GetLocalDate(this.newNote.publisH_DATE);
        dbNotes.updateD_BY = localStorage.getItem('empid');
        dbNotes.week = this.tableWeek;

        // Update row to database
        this.service_updateNotes(dbNotes);

        // Update row to mat-table data source
        // let itemtoUpdate =  this.input.notes.find(x => x.id == dbNotes.id)[0];
        // let reqindex = this.input.notes.indexOf(itemtoUpdate);
        // this.input.notes[reqindex] = itemtoUpdate;

      }


      // this.dataSource.paginator = this.paginator;
      //   this.dataSource.sort = this.sort;


    }
    else {
      this.snackBar.open('Please enter required fields', 'Close', {
        duration: 4000,
        panelClass: ['warning-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  LoadNotes() {
    this._chartsService.getNotesForCustomer(this.input.custid)
      .subscribe({
        next: (data) => {
          this.input.notes = data;
          this.input.notes.forEach((i: any) => {
            i.tempmonth = i.publisH_DATE + " " + i.week
          })
          this.input.notes.sort((x: any, y: any): number => {
            if (x.tempmonth > y.tempmonth) return -1;
            if (x.tempmonth < y.tempmonth) return 1;
            return 0;
          });
          this.dataSource = new MatTableDataSource<any>(this.input.notes);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        error: (error) => {
          this._util.serviceError(error);
        }
      });
  }

  service_addNotes(note: any) {
    
    this._appservice.addNote(note)
      .subscribe({
        next: (data) => {
          
          // Reload notes and update UI only after reload completes
          this._chartsService.getNotesForCustomer(this.input.custid).subscribe({
            next: (notes: any[]) => {
              
              this.input.notes = notes;
              this.input.notes.forEach((i: any) => {
                i.tempmonth = i.publisH_DATE + " " + i.week
              })
              this.input.notes.sort((x: any, y: any): number => {
                if (x.tempmonth > y.tempmonth) return -1;
                if (x.tempmonth < y.tempmonth) return 1;
                return 0;
              });
              this.dataSource.data = this.input.notes;
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
              
              
              // Trigger change detection
              this.cdr.detectChanges();
              
              // Update UI state only after data is loaded
              this.readonlymode = true;
              this.editmode = false;
              this.newNote = {} as HighlightsModel;
              this.tableMonth = undefined;
              this.tableYear = undefined;
              this.snackBar.open('Notes added successfully', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar'],
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            },
            error: (error) => { 
              console.error('Error reloading notes:', error);
              this._util.serviceError(error); 
            }
          });
        },
        error: (error) => { 
          console.error('Error saving note:', error);
          this._util.serviceError(error); 
        }
      });
  }

  service_updateNotes(note: any) {
    this._appservice.updateNote(note).subscribe({
      next: (data) => {
        // Reload notes and update UI only after reload completes
        this._chartsService.getNotesForCustomer(this.input.custid).subscribe({
          next: (notes: any[]) => {
            this.input.notes = notes;
            this.input.notes.forEach((i: any) => {
              i.tempmonth = i.publisH_DATE + " " + i.week
            })
            this.input.notes.sort((x: any, y: any): number => {
              if (x.tempmonth > y.tempmonth) return -1;
              if (x.tempmonth < y.tempmonth) return 1;
              return 0;
            });
            this.dataSource.data = this.input.notes;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            // Update UI state only after data is loaded
            this.readonlymode = true;
            this.editmode = false;
            this.newNote = {} as HighlightsModel;
            this.tableMonth = undefined;
            this.tableYear = undefined;
            this.snackBar.open('Notes updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          },
          error: (error) => { this._util.serviceError(error); }
        });
      },
      error: (error) => { this._util.serviceError(error); }
    });
  }

  cancel_OnClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.newNote = {} as HighlightsModel;
    this.tableMonth = undefined;
    this.tableYear = undefined;
    this.LoadNotes();
    this.dataSource = new MatTableDataSource<any>(this.input.notes);
    //   this.dataSource.paginator = this.paginator;
    //   this.dataSource.sort = this.sort;
  }


  EditRow_onClick(element: any) {
    this.readonlymode = false;
    this.editmode = true;
    this.newNote = {} as HighlightsModel;
    this.newNote = element;
    let dt = new Date(this.newNote.publisH_DATE);
    this.tableMonth = this.getMonthAbr(dt.getMonth());
    this.tableYear = dt.getFullYear();
    this.tableWeek = element.week;
  }

  DeleteRow_onClick(element: any) {
    this._myUtil.showDeleteConfirmation(
      'Are you sure you want to delete this note? This action cannot be undone.',
      'Confirm Delete'
    ).subscribe((result: boolean) => {
      if (result === true) {
        this._appservice.deleteNotes(element).subscribe({
          next: (data) => {
            this.snackBar.open('Notes deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.LoadNotes(); // Use LoadNotes for consistency
          },
          error: (error) => { this._util.serviceError(error); }
        });
      }
    });
  }

  closedialog() {
    if (this.editmode) {
      this.readonlymode = true;
      this.editmode = false;
    }
    else {
      this.dialogRef.close();
    }

  }

  // Utility methods from legacy myUtility
  public getMonthAbr(month: number): string | undefined {
    month = month + 1;
    if (month == 1) return "Jan";
    if (month == 2) return "Feb";
    if (month == 3) return "Mar";
    if (month == 4) return "Apr";
    if (month == 5) return "May";
    if (month == 6) return "Jun";
    if (month == 7) return "Jul";
    if (month == 8) return "Aug";
    if (month == 9) return "Sep";
    if (month == 10) return "Oct";
    if (month == 11) return "Nov";
    if (month == 12 || month == 0) return "Dec";
    return undefined;
  }

  public getMonthNum(month: string): number {
    if (month == "Jan") return 0;
    if (month == "Feb") return 1;
    if (month == "Mar") return 2;
    if (month == "Apr") return 3;
    if (month == "May") return 4;
    if (month == "Jun") return 5;
    if (month == "Jul") return 6;
    if (month == "Aug") return 7;
    if (month == "Sep") return 8;
    if (month == "Oct") return 9;
    if (month == "Nov") return 10;
    if (month == "Dec") return 11;
    return 0;
  }

  public CopyObject(inObj: any): any {
    let str = JSON.stringify(inObj);
    let outObj: any = JSON.parse(str);
    return outObj;
  }

  public GetLocalDate(date: Date): any {
    try {
      return date.toDateString();
    }
    catch {
      return date;
    }
  }

  public Years(n: number): number[] {
    let datearray: number[] = [];
    let d = new Date();
    let b = d.getFullYear();
    for (let i = 0; i < n; i++) {
      datearray[i] = b - i;
    }
    return datearray;
  }

}
