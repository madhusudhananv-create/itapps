import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfolioProjectSelectorComponent } from '../../../controls/portfolio-project-selector/portfolio-project-selector.component';
import { myUtility } from '../../../Shared/myUtility';
import { SharedService } from '../../../Shared/shared.service';
import { CustomerModel } from '../../../models/customer-model';
import { AppsService } from '../../../Services/apps.service';


@Component({
  selector: 'app-dashboard-previous-next',
  templateUrl: './dashboard-previous-next.component.html',
  styleUrls: ['./dashboard-previous-next.component.scss'],
  providers: [PortfolioProjectSelectorComponent]
})
export class DashboardPreviousNextComponent implements OnInit {
  @Input('currIndex') currIndex: number;
  showFilter: boolean;
  sub: any;
  customerId: string;
  selectedCustomer: CustomerModel;
  customerList: CustomerModel[] = [];
  customerName: string;
  reset: boolean = false;
  portArray: number[] = [];
  projArray: any[] = [];
  prodArray: any[] = [];

  constructor(private route: ActivatedRoute, private _router: Router, private _shared: SharedService, public _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.customerId = params['customerid'];
      this.reset = params['reset'];
    });
    if (this.reset == undefined)
      this.reset = true;
    if (this.customerId != undefined && this.customerId != null) {
      this.service_LoadCustomerByEmpIdByCustomerId(this.customerId)
    }
  }
  ngOnChanges() {
  }
  ngAfterViewInit() {

    if (this._shared.selectedPortfolios != undefined && this._shared.selectedPortfolios.length > 0)
      this.portArray = this._shared.selectedPortfolios;

    if (this._shared.selectedProjects != undefined && this._shared.selectedProjects.length > 0)
      this.projArray = this._shared.selectedProjects;

    if (this._shared.selectedProducts != undefined && this._shared.selectedProducts.length > 0)
      this.prodArray = this._shared.selectedProducts;

  }
  onPrev() {
    this.currIndex--;
  }
  onNext() {
    this.currIndex++;
  }

  service_LoadCustomerByEmpIdByCustomerId(customerId) {
    this._appservice.GetCustomerList(localStorage.getItem('empid'), false).subscribe(data => {
      this.customerList = data;
      this.selectedCustomer = this.customerList.filter(t => t.cusT_ID == customerId)[0];
      this.customerName = this.selectedCustomer.cusT_NM;
    })
  }




  getSelectedProjectsList(event) {
    this.projArray = event;
    //this.applyFilter();
  }
  getSelectedProdList(event) {
    this.prodArray = event;
    // this.filterProductList();
  }
}
