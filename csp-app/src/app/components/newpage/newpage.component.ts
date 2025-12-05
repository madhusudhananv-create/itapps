import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, TemplateRef } from '@angular/core';
import { myUtility } from '../../Shared/myUtility';
import { AppsService } from '../../Services/apps.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { AccessControl } from '../../Shared/accessControl';

@Component({
  selector: 'app-newpage',
  templateUrl: './newpage.component.html',
  styleUrls: ['./newpage.component.scss']
})
export class NewpageComponent implements OnInit {
  constructor( public _util: myUtility, private _appservice: AppsService, private router: Router, public dialog: MatDialog) { }

  ngOnInit() {

    this.logout();
  }

  logout() {
      if (this._util.IsGAVS()) {
        this.service_Logout();
        this.router.navigateByUrl('/login');
      }
      else {
        this.service_Logout();
        this.router.navigateByUrl('/login');
      }
  }

  service_Logout() {
    this._appservice.Logout().subscribe(data => {
      this._util.empid('');
      this._util.displayname('');
      this._util.token('');
    }, error => { this._util.serviceError(error); });
  }


}