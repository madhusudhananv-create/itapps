import { Component, OnInit, Inject } from '@angular/core';
import { ProcessSQAObjectiveNew } from '../../../models/process-sqa-model';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material'
import { AppsService } from '../../../Services/apps.service';
import { myUtility } from '../../../Shared/myUtility';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  model : ProcessSQAObjectiveNew = new ProcessSQAObjectiveNew();

  constructor(private _appservice : AppsService,
              private _util : myUtility,
              public dialogRef : MatDialogRef<CreateComponent>,
              @Inject(MAT_DIALOG_DATA) public data : any)   
              { }

  ngOnInit() {
  }

  SubmitObjectiveForm(objmodel)
  {
    if(objmodel.valid)
    {
      if (this.model.id == 0) {
        this._appservice.addProcessModelObjective(this.model).subscribe(data => {
          //this.modelList.push(data)
          //this.LoadData()
          alert("Added Successfully");
          this.close(data);
        }, error => { this._util.serviceError(error); });
      }
    }
  }

  close(data)
  {
    this.dialogRef.close(data);
  }
}
