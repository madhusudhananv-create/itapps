import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AppsService } from '../../../core/services/apps.service';
import { MyUtility } from '../../my-utility';

@Component({
  selector: 'app-portfolio-product-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './portfolio-product-selector.component.html',
  styleUrls: ['./portfolio-product-selector.component.scss']
})
export class PortfolioProductSelectorComponent implements OnInit {
  @Input("custId") custId: string = '';
  @Input("portId") portfolioId: number | undefined;
  @Input("prodId") productId: number | undefined;
  
  portfolioList: any[] = [];
  productList: any[] = [];
  originalProductList: any[] = [];
  portId: number = 0;
  prodArray: number | undefined;
  portArray: number | undefined;
  isLoading: boolean = true;
  tierId: number = 0;
  includePortfolio: boolean = false;
  
  @ViewChild('searchInput') searchInput!: ElementRef;
  @Output() productSelected: EventEmitter<any> = new EventEmitter<any>();
  
  constructor(
    private _appservice: AppsService, 
    public _util: MyUtility
  ) { }

  ngOnInit() {
    let portfolioCustomers = "";
    this._appservice.GetDBConfigValue("PORTFOLIO_ENABLED_CUSTOMERS", -1, "").subscribe((data: any) => {
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
    this._appservice.GetPortfolioWithProductList(this.custId).subscribe({
      next: (data: any) => {
        this.isLoading = true;
        this.portfolioList = data;
        this.portArray = undefined;
        
        
        // Check if portfolioList has items before accessing
        const firstPortfolio = this.portfolioList.filter((x: any) => x.id)[0];
        if (firstPortfolio) {
          this.portArray = firstPortfolio.id;
        }
        
        if (this.portfolioId != undefined && this.portfolioId != null) {
          const selectedPortfolio = this.portfolioList.filter((x: any) => x.id == Number(this.portfolioId))[0];
          if (selectedPortfolio) {
            this.portArray = selectedPortfolio.id;
          }
        }
        else {
          this.productId = undefined;
        }
        
        if (this.portArray) {
          this.service_getProductPortfolioMapping(this.portArray);
        } else {
          console.warn('🔍 No portfolio selected, cannot load products');
        }
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  service_getProductPortfolioMapping(portId: any) {
    this._appservice.getProductList(this.custId, portId).subscribe({
      next: (data: any) => {
        this.productList = data;
        this.originalProductList = data;
        this.prodArray = undefined;
        
        
        // Check if productList has items before accessing
        if (this.productList && this.productList.length > 0) {
          const firstProduct = this.productList.filter((x: any) => x.id)[0];
          if (firstProduct) {
            this.prodArray = firstProduct.id;
            this.tierId = firstProduct.tieR_ID;
          }
          
          if (this.productId != undefined && this.productId != null) {
            const selectedProduct = this.productList.filter((x: any) => x.id == Number(this.productId))[0];
            if (selectedProduct) {
              this.prodArray = selectedProduct.id;
              this.tierId = selectedProduct.tieR_ID;
            }
          }
        } else {
          console.warn('🔍 No products received for portfolio:', portId);
        }
        
        this.emitChanges();
        this.isLoading = false;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });
  }

  getProductList(portId: any) {
    this.isLoading = true;
    this.portfolioId = undefined;
    this.productId = undefined;
    this.service_getProductPortfolioMapping(portId);
  }

  getProductListByCustId() {
    this.isLoading = true;
    this._appservice.GetProductListByCustId(this.custId).subscribe({
      next: (data: any) => {
        this.productList = data;
        this.originalProductList = data;
        this.prodArray = undefined;
        
        // Check if productList has items before accessing
        if (this.productList && this.productList.length > 0) {
          const firstProduct = this.productList.filter((x: any) => x.id)[0];
          if (firstProduct) {
            this.prodArray = firstProduct.id;
            this.tierId = firstProduct.tieR_ID;
          }
          
          if (this.productId != undefined && this.productId != null) {
            const selectedProduct = this.productList.filter((x: any) => x.id == Number(this.productId))[0];
            if (selectedProduct) {
              this.prodArray = selectedProduct.id;
              this.tierId = selectedProduct.tieR_ID;
            }
          }
        }
        
        this.emitChanges();
        this.isLoading = false;
      },
      error: (error: any) => { this._util.serviceError(error); }
    });

  }

  ddProduct_Onchange() {
    this.isLoading = true;
    // Check if productList has the selected product
    const selectedProduct = this.productList.filter((x: any) => x.id == this.prodArray)[0];
    if (selectedProduct) {
      this.tierId = selectedProduct.tieR_ID;
    }
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
        let products = this.originalProductList.filter((x: any) => x.producT_TITLE.toLowerCase().includes(value.toLowerCase()));
        this.productList = products;
      }
    }
  }

  emitChanges() {
    this.productSelected.emit({ prodArray: this.prodArray, tierId: this.tierId });
    this.isLoading = false;
  }
}
