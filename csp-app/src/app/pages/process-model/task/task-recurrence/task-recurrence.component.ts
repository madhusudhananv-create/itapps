import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormControl } from '@angular/forms';
import { RecurrenceModel } from '../../../../models/task-model';

@Component({
  selector: 'app-task-recurrence',
  templateUrl: './task-recurrence.component.html',
  styleUrls: ['./task-recurrence.component.scss']
})
export class TaskRecurrenceComponent implements OnInit {
  Project1 = new FormControl();
  ProjectList1: string[] = ['1', '2', '3', '4', '5', '6', '7', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
  BiAnnual = new FormControl();
  BiAnnualList1: string[] = ['1', '2', '3', '4', '5', '6', '7', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];

  disableTool = new FormControl(false);
  disableDaily: boolean = false;
  disableWeekly: boolean = false;
  disableBiWeekly: boolean = false;
  disableMonthly: boolean = false;
  disableYearly: boolean = false;
  disableQuarterly: boolean = false;
  disableBiAnnual: boolean = false;
  // favoriteSeason: string;
  constructor(
    public dialogRef: MatDialogRef<TaskRecurrenceComponent>,
    @Inject(MAT_DIALOG_DATA) public recurrence: RecurrenceModel) {

  }
  //   seasons: string[] = ['Option1', 'Option2', 'Option3', 'Option4'];
  ngOnInit() {
    //alert(this.recurrence.frequency);
  }
  users6: Tool[] = [
    { value: 'First-0', viewValue: 'First' },
    { value: 'Second-0', viewValue: 'Second' },
    { value: 'Third-0', viewValue: 'Third' },
    { value: 'Fourth-0', viewValue: 'Fourth' },
    { value: 'Last-0', viewValue: 'Last' }

  ];
  onNoClick(): void {
    this.dialogRef.close();
  }
  btnSave_Onclick() {
    alert("save successfull");
  }
  users7: Tool[] = [
    { value: 'Monday-0', viewValue: 'Monday' },
    { value: 'Tuesday-0', viewValue: 'Tuesday' },
    { value: 'Wednesday-0', viewValue: 'Wednesday' },
    { value: 'Thursday-0', viewValue: 'Thursday' },
    { value: 'Friday-0', viewValue: 'Friday' },
    { value: 'Saturday-0', viewValue: 'Saturday' },
    { value: 'Sunday-0', viewValue: 'Sunday' }

  ];
  users8: Tool[] = [
    { value: ' January-0', viewValue: ' January' },
    { value: ' February-0', viewValue: ' February' },
    { value: 'March-0', viewValue: 'March' },
    { value: 'April-0', viewValue: 'April' },
    { value: 'May-0', viewValue: 'May' },
    { value: 'June-0', viewValue: 'June' },
    { value: ' July-0', viewValue: ' July' },
    { value: 'August-0', viewValue: 'August' },
    { value: 'September-0', viewValue: 'September' },
    { value: 'October-0', viewValue: 'October' },
    { value: 'November-0', viewValue: 'November' },
    { value: ' December-0', viewValue: ' December' }

  ];
  users9: Tool[] = [
    { value: 'First-0', viewValue: 'First' },
    { value: 'Second-0', viewValue: 'Second' },
    { value: 'Third-0', viewValue: 'Third' },
    { value: 'Fourth-0', viewValue: 'Fourth' },
    { value: 'Last-0', viewValue: 'Last' }

  ];
  users10: Tool[] = [
    { value: 'Monday-0', viewValue: 'Monday' },
    { value: 'Tuesday-0', viewValue: 'Tuesday' },
    { value: 'Wednesday-0', viewValue: 'Wednesday' },
    { value: 'Thursday-0', viewValue: 'Thursday' },
    { value: 'Friday-0', viewValue: 'Friday' },
    { value: 'Saturday-0', viewValue: 'Saturday' },
    { value: 'Sunday-0', viewValue: 'Sunday' }

  ];
  users11: Tool[] = [
    { value: ' January-0', viewValue: ' January' },
    { value: ' February-0', viewValue: ' February' },
    { value: 'March-0', viewValue: 'March' },
    { value: 'April-0', viewValue: 'April' },
    { value: 'May-0', viewValue: 'May' },
    { value: 'June-0', viewValue: 'June' },
    { value: ' July-0', viewValue: ' July' },
    { value: 'August-0', viewValue: 'August' },
    { value: 'September-0', viewValue: 'September' },
    { value: 'October-0', viewValue: 'October' },
    { value: 'November-0', viewValue: 'November' },
    { value: ' December-0', viewValue: ' December' }

  ];
  users12: Tool[] = [
    { value: 'First-0', viewValue: 'First' },
    { value: 'Second-0', viewValue: 'Second' },
    { value: 'Third-0', viewValue: 'Third' },
    { value: 'Fourth-0', viewValue: 'Fourth' },
    { value: 'Last-0', viewValue: 'Last' }

  ];
  users13: Tool[] = [
    { value: 'Monday-0', viewValue: 'Monday' },
    { value: 'Tuesday-0', viewValue: 'Tuesday' },
    { value: 'Wednesday-0', viewValue: 'Wednesday' },
    { value: 'Thursday-0', viewValue: 'Thursday' },
    { value: 'Friday-0', viewValue: 'Friday' },
    { value: 'Saturday-0', viewValue: 'Saturday' },
    { value: 'Sunday-0', viewValue: 'Sunday' }

  ];
  BiAnnuals1: Tool[] = [
    { value: ' January-0', viewValue: ' January' },
    { value: ' February-0', viewValue: ' February' },
    { value: 'March-0', viewValue: 'March' },
    { value: 'April-0', viewValue: 'April' },
    { value: 'May-0', viewValue: 'May' },
    { value: 'June-0', viewValue: 'June' },
    { value: ' July-0', viewValue: ' July' },
    { value: 'August-0', viewValue: 'August' },
    { value: 'September-0', viewValue: 'September' },
    { value: 'October-0', viewValue: 'October' },
    { value: 'November-0', viewValue: 'November' },
    { value: ' December-0', viewValue: ' December' }

  ];
  BiAnnuals2: Tool[] = [
    { value: 'First-0', viewValue: 'First' },
    { value: 'Second-0', viewValue: 'Second' },
    { value: 'Third-0', viewValue: 'Third' },
    { value: 'Fourth-0', viewValue: 'Fourth' },
    { value: 'Last-0', viewValue: 'Last' }

  ];
  BiAnnuals3: Tool[] = [
    { value: 'Monday-0', viewValue: 'Monday' },
    { value: 'Tuesday-0', viewValue: 'Tuesday' },
    { value: 'Wednesday-0', viewValue: 'Wednesday' },
    { value: 'Thursday-0', viewValue: 'Thursday' },
    { value: 'Friday-0', viewValue: 'Friday' },
    { value: 'Saturday-0', viewValue: 'Saturday' },
    { value: 'Sunday-0', viewValue: 'Sunday' }

  ];
  BiAnnuals4: Tool[] = [
    { value: ' January-0', viewValue: ' January' },
    { value: ' February-0', viewValue: ' February' },
    { value: 'March-0', viewValue: 'March' },
    { value: 'April-0', viewValue: 'April' },
    { value: 'May-0', viewValue: 'May' },
    { value: 'June-0', viewValue: 'June' },
    { value: ' July-0', viewValue: ' July' },
    { value: 'August-0', viewValue: 'August' },
    { value: 'September-0', viewValue: 'September' },
    { value: 'October-0', viewValue: 'October' },
    { value: 'November-0', viewValue: 'November' },
    { value: ' December-0', viewValue: ' December' }

  ];
  onChangeBrand(val) {
    if (this.recurrence.frequency === 'Daily')
      this.disableWeekly = true;
    this.disableMonthly = true;
    this.disableYearly = true;
    this.disableBiWeekly = true;
    this.disableQuarterly = true;
    this.disableBiAnnual = true;
    this.disableDaily = false;
  }
  onFrequenceChange(frequency){
    if (frequency === 'Daily')
    this.disableWeekly = true;
  this.disableMonthly = true;
  this.disableYearly = true;
  this.disableBiWeekly = true;
  this.disableQuarterly = true;
  this.disableBiAnnual = true;
  this.disableDaily = false;
  }
  IsDisabled(frequency) {
    if (this.recurrence.frequency != frequency)
      return true;
  }
  onChangeBrand1(val) {
    if (this.recurrence.frequency === 'Deekly')
      this.disableDaily = true;
    this.disableMonthly = true;
    this.disableYearly = true;
    this.disableBiWeekly = true;
    this.disableQuarterly = true;
    this.disableBiAnnual = true;
    this.disableWeekly = false;
  }
  onChangeBrand4(val) {
    alert(this.recurrence.frequency);
    // if (this.recurrence.frequency === 'BiWeekly')
    //   this.disableDaily = true;
    // this.disableMonthly = true;
    // this.disableYearly = true;
    // this.disableWeekly = true;
    // this.disableQuarterly = true;
    // this.disableBiAnnual = true;
    // this.disableBiWeekly = false;
  }
  onChangeBrand5(val) {
    if (this.recurrence.frequency === 'Monthly')
      this.disableDaily = true;
    this.disableMonthly = true;
    this.disableYearly = true;
    this.disableWeekly = true;
    this.disableBiWeekly = true;
    this.disableBiAnnual = true;
    this.disableQuarterly = false;
  }
  onChangeBrand2(val) {
    // if (this.recurrence.frequency === 'Monthly')
    //   this.disableWeekly = true;
    // this.disableDaily = true;
    // this.disableYearly = true;
    // this.disableBiWeekly = true;
    // this.disableQuarterly = true;
    // this.disableBiAnnual = true;
    // this.disableMonthly = false;
  }
  onChangeBrand3(val) {
    if (this.recurrence.frequency === 'Yearly')
      this.disableWeekly = true;
    this.disableMonthly = true;
    this.disableDaily = true;
    this.disableBiWeekly = true;
    this.disableQuarterly = true;
    this.disableBiAnnual = true;
    this.disableYearly = false;
  }
  onChangeBrand6(val) {
    if (this.recurrence.frequency === 'BiAnnual')
      this.disableWeekly = true;
    this.disableMonthly = true;
    this.disableDaily = true;
    this.disableBiWeekly = true;
    this.disableQuarterly = true;
    this.disableYearly = true;
    this.disableBiAnnual = false;
  }
}
export interface Tool {
  value: string;
  viewValue: string;
}
export interface keyValuePair {
  value: number;
  viewValue: string;
}




