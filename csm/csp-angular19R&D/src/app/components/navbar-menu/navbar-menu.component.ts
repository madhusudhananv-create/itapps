import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MyUtility } from '../../shared/my-utility';
import { AccessControl } from '../../shared/access-control';

@Component({
  selector: 'app-navbar-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatMenuModule
  ],
  templateUrl: './navbar-menu.component.html',
  styleUrls: ['./navbar-menu.component.scss']
})
export class NavbarMenuComponent implements OnInit {

  constructor(
    public _util: MyUtility,
    public _access: AccessControl
  ) { }

  ngOnInit(): void {
  }

}

