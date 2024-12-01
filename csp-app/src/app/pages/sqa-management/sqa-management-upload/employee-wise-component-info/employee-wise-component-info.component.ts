import { Component, OnInit ,Inject} from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MAT_CHIPS_DEFAULT_OPTIONS,MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-employee-wise-component-info',
  templateUrl: './employee-wise-component-info.component.html',
  styleUrls: ['./employee-wise-component-info.component.scss']
})
export class EmployeeWiseComponentInfoComponent implements OnInit {
  employeeData:any
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,private dialogRef: MatDialogRef<EmployeeWiseComponentInfoComponent>){ }

  ngOnInit() {
    this.employeeData = this.data.details;
  }
  ngOnChanges() {
    this.employeeData = this.data;
  }
  CancelOnClick() {
    this.dialogRef.close();
  }
}
