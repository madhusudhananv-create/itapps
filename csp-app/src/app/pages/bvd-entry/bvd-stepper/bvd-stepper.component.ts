import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-bvd-stepper',
  templateUrl: './bvd-stepper.component.html',
  styleUrls: ['./bvd-stepper.component.scss']
})
export class BvdStepperComponent implements OnInit {
  //isLinear = true;
  IdeaDetails : FormGroup; 
  EvaluateBenefits : FormGroup ;
  ImplementationPlan : FormGroup;
  ReviewApprove : FormGroup;
  isEditable = false; 
 
  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.IdeaDetails = this._formBuilder.group({
    });
    this.EvaluateBenefits = this._formBuilder.group({
    });
    this.ImplementationPlan = this._formBuilder.group({
    });
    this.ReviewApprove = this._formBuilder.group({
    });
  }

}
