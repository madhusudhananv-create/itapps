import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bvd-implementaion-schedule',
  templateUrl: './bvd-implementaion-schedule.component.html',
  styleUrls: ['./bvd-implementaion-schedule.component.scss']
})
export class BvdImplementaionScheduleComponent implements OnInit {

  constructor() { }
  
  ngOnInit() {
  }
  displayedColumns: string[] = ['milestonetask','description','efforts','responsible','comments','estimatedDates','actualDate','status','actions'];
  dataSource = implementationSchedule;

}
export interface impSchedule {
  milestonetask: string;
  description: string;
  efforts:string;
  responsible:string;
  comments:string;
  estimatedDates: string;
  actualDate:string;
  status:string//'Object Cleanup
  estimatedEndDate: string;
  actualEndDate:string;
}

const implementationSchedule : impSchedule[] = [
{milestonetask:'Automate server availability',description:'Prepare Technical Design',efforts:'20 hrs',responsible:'Ramanathan K',comments:'This is the place to enter comments of the Milestone',estimatedDates:'03-Sep-2018',estimatedEndDate:'25-sep-2021',actualDate:'13-Oct-2018',actualEndDate:'25-oct-2018',status:'Planned'},
{milestonetask:'Oject Cleanup',description:'Oject Cleanup',efforts:'30 hrs',responsible:'John Sebastian',comments:'This is the place to enter comments of the Milestone',estimatedDates:'22-Mar-2018',estimatedEndDate:'20-sep-2021',actualDate:'31-Mar-2018',actualEndDate:'25-Apr-2018',status:'Planned'},
{milestonetask:'Automate server availability',description:'Prepare Technical Design',efforts:'26 hrs',responsible:'Jacob S Martin',comments:'This is the place to enter comments of the Milestone',estimatedDates:'03-Sep-2018',estimatedEndDate:'25-sep-2021',actualDate:'13-Oct-2018',actualEndDate:'25-oct-2018',status:'Planned'}]

