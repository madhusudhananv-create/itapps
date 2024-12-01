import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Notes } from '../../../../models/notes';
import { myUtility } from '../../../../Shared/myUtility';
import { HighlightsModel } from '../../../../models/highlights-model';
import { AppsService } from '../../../../Services/apps.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-notes',
  templateUrl: './add-notes.component.html',
  styleUrls: ['./add-notes.component.scss']
})
export class AddNotesComponent implements OnInit {

  readonlymode: boolean = true;
  editmode: boolean = false;
  menuToggleStatus: boolean;
  input: any;
  tableMonth: string;
  tableYear: number;
  tableWeek: any;
  dataSource = new MatTableDataSource<any>();
  displayedColumns = ['index', 'description', 'publisH_DATE', 'edit'];


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  tempNote: HighlightsModel = new HighlightsModel();
  newNote: HighlightsModel = new HighlightsModel();



  constructor(private dialogRef: MatDialogRef<AddNotesComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {
    if (this.data != null || this.data != undefined) {
      this.input = this.data;
    }
    this.dataSource = new MatTableDataSource<any>(this.input.notes);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.tableWeek = 0;
  }

  ngOnChanges() {
    this.dataSource = new MatTableDataSource<any>(this.input.notes);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  onMenuToggleChange(value: boolean) {
    this.menuToggleStatus = value;
  }

  addNotes_OnClick() {
    this.newNote = new HighlightsModel();
    this.tableMonth = undefined;
    this.tableYear = undefined
    this.readonlymode = false;
    this.editmode = true;
  }

  saveNotes() {
    const specialCarPattern = /^[!@#$%^&*(),.?":{}|<>~`_\-+=\[\]\\\/\s]+$/;
    const numberPattern = /^[0-9\s]+$/;
    if (specialCarPattern.test(this.newNote.description) || numberPattern.test(this.newNote.description)) {
      alert('Invalid Description - Please enter alphanumeric or numeric values along with special characters for description');
      return;
    }

    if ((this.newNote.description != undefined && this.newNote.description != null && this.newNote.description.trim() != '') && (this.tableMonth != undefined || this.tableMonth != null || this.tableMonth != '')
      && (this.tableYear != undefined || this.tableYear != null)) {
      if (this.newNote.id === 0 || this.newNote.id === undefined) {
        // let publishDate = "01" + this.tableMonth + this.tableYear.toString();
        let monthnum = this._util.getMonthNum(this.tableMonth);
        let publishDate = new Date(Date.UTC(this.tableYear, monthnum, 1));
        this.newNote.publisH_DATE = publishDate;

        // Copy object to new one

        let dbNotes = this._util.CopyObject(this.newNote);

        dbNotes.description = dbNotes.description.trim();
        // dbNotes.id = 0;
        dbNotes.publisH_DATE = this._util.GetLocalDate(dbNotes.publisH_DATE);
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
        let monthnum = this._util.getMonthNum(this.tableMonth);
        let publishDate = new Date(this.tableYear, monthnum, 1);
        this.newNote.publisH_DATE = publishDate;
        let dbNotes = this._util.CopyObject(this.newNote);
        dbNotes.publisH_DATE = this._util.GetLocalDate(this.newNote.publisH_DATE);
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
      alert('Please enter required fields');
    }
  }

  LoadNotes() {
    this._appservice.getNotesForCustomer(this.input.custid)
      .subscribe
      (
        data => {
          this.input.notes = data;
          console.log('add notes', this.input.notes)
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
        }
        ,
        error => {
          this._util.serviceError(error);
        }
      );
  }

  service_addNotes(note) {
    this._appservice.addNote(note)
      .subscribe(data => {
        this.LoadNotes();
        this.readonlymode = true;
        this.editmode = false;
        this.newNote = new HighlightsModel();
        alert("Notes added successfully");
      }, error => { this._util.serviceError(error); },
        //  () => {
        //   this.readonlymode = true;
        //   this.editmode = false;
        //   this.newNote = new HighlightsModel();
        //  }
      );
  }

  service_updateNotes(note) {
    this._appservice.updateNote(note).subscribe(data => {
      this.LoadNotes();
      this.readonlymode = true;
      this.editmode = false;
      this.newNote = new HighlightsModel();
      alert("Notes updated successfully");
    }, error => { this._util.serviceError(error); }
      // () => {

      //   this.readonlymode = true;
      //   this.editmode = false;
      //   this.newNote = new HighlightsModel();
      // }
    );
  }

  cancel_OnClick() {
    this.readonlymode = true;
    this.editmode = false;
    this.newNote = new HighlightsModel();
    this.tableMonth = undefined;
    this.tableYear = undefined;
    this.LoadNotes();
    this.dataSource = new MatTableDataSource<any>(this.input.notes);
    //   this.dataSource.paginator = this.paginator;
    //   this.dataSource.sort = this.sort;
  }


  EditRow_onClick(element) {
    console.log(element)
    this.readonlymode = false;
    this.editmode = true;
    this.newNote = new HighlightsModel();
    this.newNote = element;
    let dt = new Date(this.newNote.publisH_DATE);
    this.tableMonth = this._util.getMonthAbr(dt.getMonth());
    this.tableYear = dt.getFullYear();
    this.tableWeek = element.week;
    console.log(this.tableWeek)
  }

  DeleteRow_onClick(element) {
    if (confirm('Are you sure want to delete the record?')) {
      this._appservice.deleteNotes(element).subscribe(data => {
        this.input.notes.splice(this.input.notes.indexOf(element), 1);
        this.dataSource = new MatTableDataSource<any>(this.input.notes);
        alert("Notes deleted successfully");
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }, error => { this._util.serviceError(error); }

        // () =>
        // {
        //   this.input.notes.splice(this.input.notes.indexOf(element), 1);
        //   this.dataSource = new MatTableDataSource<any>(this.input.notes);
        //  // this.dataSource.paginator = this.paginator;
        // //  this.dataSource.sort = this.sort;
        // }
      );
    }
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

}
