import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { AppsService } from '../../Services/apps.service';
import { myUtility } from '../../Shared/myUtility';

@Component({
  selector: 'app-portfolio-product-selector',
  templateUrl: './portfolio-product-selector.component.html',
  styleUrls: ['./portfolio-product-selector.component.scss']
})
export class PortfolioProductSelectorComponent implements OnInit {
  @Input("custId") custId: string;
  @Input("portId") portfolioId: number;
  @Input("prodId") productId: number;
  portfolioList: any[];
  productList: any[];
  originalProductList: any[];
  portId: number;
  prodArray: number;
  portArray: number;
  isLoading: boolean = true;
  tierId: number;
  includePortfolio: boolean = false;
  @ViewChild('searchInput') searchInput: ElementRef;
  @Output() productSelected: EventEmitter<any> = new EventEmitter<any>();
  constructor(private _appservice: AppsService, public _util: myUtility,) { }

  ngOnInit() {
    let portfolioCustomers = "";
    this._appservice.GetDBConfigValueFields("PORTFOLIO_ENABLED_CUSTOMERS", -1, "").subscribe(data => {
      portfolioCustomers = data;
      if (portfolioCustomers.includes(this.custId)) {
        this.includePortfolio = true;
      }

      if (this.includePortfolio)
        this.service_getPortfolioDetails();
      else
        this.getProductListByCustId();
    });
  }

  service_getPortfolioDetails() {
    this._appservice.GetPortfolioWithProductList(this.custId).subscribe(data => {
      this.isLoading = true;
      this.portfolioList = data;
      this.portArray = undefined;
      this.portArray = this.portfolioList.filter(x => x.id)[0].id;
      if (this.portfolioId != undefined && this.portfolioId != null) {
        this.portArray = this.portfolioList.filter(x => x.id == Number(this.portfolioId))[0].id;
      }
      else {
        this.productId = undefined;
      }
      this.service_getProductPortfolioMapping(this.portArray);
    }, error => { this._util.serviceError(error); })
  }

  service_getProductPortfolioMapping(portId) {
    this._appservice.GetProductList(this.custId, portId).subscribe(data => {
      this.productList = data;
      this.originalProductList = data;
      this.prodArray = undefined;
      this.prodArray = this.productList.filter(x => x.id)[0].id;
      this.tierId = this.productList.filter(x => x.id)[0].tieR_ID;
      if (this.productId != undefined && this.productId != null) {
        this.prodArray = this.productList.filter(x => x.id == Number(this.productId))[0].id;
        this.tierId = this.productList.filter(x => x.id == Number(this.productId))[0].tieR_ID;
      }
      this.emitChanges();
      this.isLoading = false;
    }, error => { this._util.serviceError(error); });
  }

  getProductList(portId) {
    this.isLoading = true;
    this.portfolioId = undefined;
    this.productId = undefined;
    this.service_getProductPortfolioMapping(portId);
  }

  getProductListByCustId() {
    this.isLoading = true;
    this._appservice.GetProductListByCustId(this.custId).subscribe(data => {
      this.productList = data;
      this.originalProductList = data;
      this.prodArray = undefined;
      this.prodArray = this.productList.filter(x => x.id)[0].id;
      this.tierId = this.productList.filter(x => x.id)[0].tieR_ID;
      if (this.productId != undefined && this.productId != null) {
        this.prodArray = this.productList.filter(x => x.id == Number(this.productId))[0].id;
        this.tierId = this.productList.filter(x => x.id == Number(this.productId))[0].tieR_ID;
      }
      this.emitChanges();
      this.isLoading = false;
    }, error => { this._util.serviceError(error); });

  }

  ddProduct_Onchange() {
    this.isLoading = true;
    this.tierId = this.productList.filter(x => x.id == this.prodArray)[0].tieR_ID;
    this.emitChanges();
  }

  resetFilterValue(opened: boolean) {
    this.searchInput.nativeElement.value = '';
    this.applyFilterForScope(this.searchInput.nativeElement.value);
  }

  applyFilterForScope(value: string) {
    if (value.trim() === '') {
      this.productList = this.originalProductList;
    }
    else {
      if (this.productList != null && this.productList != undefined && this.productList.length > 0) {
        let products = this.originalProductList.filter(x => x.producT_TITLE.toLowerCase().includes(value.toLowerCase()));
        this.productList = products;
      }
    }
  }

  emitChanges() {
    this.productSelected.emit({ prodArray: this.prodArray, tierId: this.tierId });
    this.isLoading = false;
  }
}
