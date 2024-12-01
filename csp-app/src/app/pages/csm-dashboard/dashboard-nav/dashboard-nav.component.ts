import { Component, OnInit,Output, EventEmitter,Input } from '@angular/core';
import { MatSidenav } from '@angular/material';


@Component({
  selector: 'app-dashboard-nav',
  templateUrl: './dashboard-nav.component.html',
  styleUrls: ['./dashboard-nav.component.scss']
})
export class DashboardNavComponent implements OnInit {
  
 selectedCust : string
  
  constructor() { }

  ngOnInit() {
    
  }
  setCust(event){
  this.selectedCust = event
  }
}
