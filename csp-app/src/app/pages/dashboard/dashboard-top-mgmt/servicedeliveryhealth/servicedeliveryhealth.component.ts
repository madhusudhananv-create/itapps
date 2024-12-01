import { Component, OnInit } from '@angular/core';
import { myUtility } from './../../../../Shared/myUtility';
import { CustomerProjectsListModel } from '../../../../models/customer-projects-model';

@Component({
  selector: 'app-servicedeliveryhealth',
  templateUrl: './servicedeliveryhealth.component.html',
  styleUrls: ['./servicedeliveryhealth.component.scss']
})
export class ServicedeliveryhealthComponent implements OnInit {

  CustomerProjectsList : CustomerProjectsListModel[] = [];
  projectListIndex : number = -1;

  constructor(private _myUtil : myUtility) { }

  ngOnInit() {
    this._myUtil.getCustomerProjectListBasedOnRole().subscribe(
      data => {
        this.CustomerProjectsList = data;
//console.log("customerlist", this.CustomerProjectsList);
      },
      (error) =>{}
    )
  }

  showProjectDetails(i)
  {
   // console.log(i);
    if(i == this.projectListIndex)
      this.projectListIndex = -1;
    else
    {
      this.projectListIndex = i;
    }  
  }

}
