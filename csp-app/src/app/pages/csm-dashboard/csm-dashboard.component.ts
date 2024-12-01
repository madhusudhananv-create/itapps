
import { Component, OnInit,Input,SimpleChanges } from '@angular/core';
@Component({
  selector: 'app-csm-dashboard',
  templateUrl: './csm-dashboard.component.html',
  styleUrls: ['./csm-dashboard.component.scss']
})
export class CSMDashboardComponent implements OnInit {
  isOpened = true;
  constructor() { }

  ngOnInit() {
  }
  
  toggle() {
    this.isOpened = !this.isOpened;
  }

  
}





