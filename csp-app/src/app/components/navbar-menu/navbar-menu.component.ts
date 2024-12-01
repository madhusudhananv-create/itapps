import { Component, OnInit } from '@angular/core';
import { myUtility } from '../../Shared/myUtility';
import { AccessControl } from '../../Shared/accessControl';

@Component({
  selector: 'app-navbar-menu',
  templateUrl: './navbar-menu.component.html',
  styleUrls: ['./navbar-menu.component.scss']
})
export class NavbarMenuComponent implements OnInit {

  constructor(public _util: myUtility, public _access: AccessControl) { }

  ngOnInit() {
  }

}
