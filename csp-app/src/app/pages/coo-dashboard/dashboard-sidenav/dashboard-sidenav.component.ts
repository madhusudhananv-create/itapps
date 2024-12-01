import { Component, OnInit,ViewChild,Input,Output,EventEmitter } from '@angular/core';
import { MatSidenav, MatButton } from '@angular/material';



@Component({
  selector: 'app-dashboard-sidenav',
  templateUrl: './dashboard-sidenav.component.html',
  styleUrls: ['./dashboard-sidenav.component.scss']
})
export class DashboardSidenavComponent implements OnInit {
@ViewChild('sidenav') sidenav : MatSidenav;
btnShow : boolean = true

  constructor() { }

  ngOnInit() {
  }

  openSideNav()
  {
    this.sidenav.open();
    this.btnShow = false
  }
  closeSideNav(){
    this.sidenav.close();
    this.btnShow = true;
  }
}
