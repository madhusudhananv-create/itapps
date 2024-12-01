import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bvd-ideas-list',
  templateUrl: './bvd-ideas-list.component.html',
  styleUrls: ['./bvd-ideas-list.component.scss']
})
export class BvdIdeasListComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  displayedColumns: string[] = ['select','ideaDescription','ideaType','project','responsible','status','identifiedDate','targetDate','actions','ellipsis'];
  dataSource = ideasImplementation;
  
}
export interface Ideas {
  ideaDescription: string;
  ideaType: string;
  project:string;
  responsible:string;
  status:string;
  identifiedDate: string;
  targetDate:string
  
}

const ideasImplementation : Ideas[] = [{ideaDescription:'Object Cleanup',ideaType:'Idea',project:'Clinical Support',responsible:'Database Team',status:'Waiting for Approval',identifiedDate:'03-Sep-2018',targetDate:'03-Sep-2018'},
{ideaDescription:'Created a Offshore tracking channel where',ideaType:'Improvement',project:'Service Support',responsible:'Gokulakannan J',status:'In Progress',identifiedDate:'03-Dec-2018',targetDate:'03-Dec-2018'},
{ideaDescription:'Ticket Reduction in DL tickets - No Owner DL',ideaType:'Release',project:'Incident Management',responsible:'Leads Team',status:'Completed',identifiedDate:'08-Oct-2018',targetDate:'08-Oct-2018'}]

