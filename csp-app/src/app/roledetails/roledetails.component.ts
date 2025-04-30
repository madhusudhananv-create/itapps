import { Component, OnInit } from '@angular/core';
import { DomainConfigService } from '../Services/app.domain.config';
@Component({
  selector: 'app-roledetails',
  templateUrl: './roledetails.component.html',
  styleUrls: ['./roledetails.component.scss']
})
export class RoledetailsComponent implements OnInit {

  constructor(private domainconfig: DomainConfigService) { }

  ngOnInit() {
  }

}
