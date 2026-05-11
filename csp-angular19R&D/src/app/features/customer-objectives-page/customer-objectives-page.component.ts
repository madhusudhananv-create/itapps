import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppsService } from '../../core/services/apps.service';
import { ProjectsModel } from '../../models/projects.model';
import { enumRoles } from '../../shared/enum';
import { LayoutService } from '../layout/layout.service';
import { CustomerObjectivesSectionComponent } from './customer-objectives-section/customer-objectives-section.component';
import { NavbarNewComponent } from '../../components/navbar-new/navbar-new.component';

@Component({
  selector: 'app-customer-objectives-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CustomerObjectivesSectionComponent,
    NavbarNewComponent
  ],
  templateUrl: './customer-objectives-page.component.html',
  styleUrl: './customer-objectives-page.component.scss'
})
export class CustomerObjectivesPageComponent implements OnInit {
  private sub: any;
  input_projectid: string = '';
  input_customerid: string = '';
  _loading: boolean = false;
  selectedDatanew: any[] = [];
  projNames: ProjectsModel[] = [];
  allproj: boolean = false;
  empid: string = '';

  constructor(
    private route: ActivatedRoute,
    private _appservice: AppsService,
    public _layoutService: LayoutService
  ) {}

  ngOnInit() {
    let role = localStorage.getItem('role');
    if (
      role == enumRoles.BUHeadIMS.toString() ||
      role == enumRoles.PMO.toString() ||
      role == enumRoles.Quality.toString()
    )
      this.allproj = true;

    this.sub = this.route.params.subscribe((params) => {
      this.input_customerid = params['custid'];
      this._layoutService.selectedCust = this.input_customerid;
    });

    this.getAllProjectsFromCustomer();
  }

  getAllProjectsFromCustomer() {
    this._appservice
      .GetCustomerProjectsName(this.input_customerid, this.allproj)
      .subscribe({
        next: (data) => {
          this.projNames = data;
          if (
            this.projNames != undefined &&
            this.projNames != null &&
            this.projNames.length > 0
          ) {
            this.input_projectid = this.projNames[0].proJ_ID;
          }
        },
        error: (error) => {
          console.error('Error fetching projects:', error);
        }
      });
  }
}
