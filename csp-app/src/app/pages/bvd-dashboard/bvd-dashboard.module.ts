import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SharedModule } from '../../Shared/shared.module';
//import { TokenInterceptor } from './services/token-interceptor';
import { BvdDashboardRouting } from './bvd-dashoboard.routing';
import { BvdDashboardService } from './services/bvd-dashboard.service';
import { BvdDashboardComponent } from './bvd-dashboard.component';
import { BvdQualitativeBenefitsComponent } from './bvd-qualitative-benefits/bvd-qualitative-benefits.component';
import { BvdQuantitativeBenefitsComponent } from './bvd-quantitative-benefits/bvd-quantitative-benefits.component';
import { BvdEntryModule } from '../bvd-entry/bvd-entry.module';
import { BvdQualitativeBenefitsDetailComponent } from './bvd-qualitative-benefits-detail/bvd-qualitative-benefits-detail.component';
import { BvdQuantitativeBenefitsDetailComponent } from './bvd-quantitative-benefits-detail/bvd-quantitative-benefits-detail.component';



@NgModule({
    imports: [
        CommonModule,
        BvdDashboardRouting,
        SharedModule,
        HttpClientModule,
        BvdEntryModule
    ],
    declarations: [
        BvdDashboardComponent,
        BvdQualitativeBenefitsComponent,
        BvdQuantitativeBenefitsComponent,
        BvdQualitativeBenefitsDetailComponent,
        BvdQuantitativeBenefitsDetailComponent
        
    ],
    
    exports:[
        BvdDashboardComponent,
        BvdQualitativeBenefitsComponent,
        BvdQuantitativeBenefitsComponent,
        BvdQualitativeBenefitsDetailComponent,
        BvdQuantitativeBenefitsDetailComponent
    ],
    
    entryComponents:[
        BvdQualitativeBenefitsDetailComponent,
        BvdQuantitativeBenefitsDetailComponent
    ],
    providers: [  BvdDashboardService],
    
})
export class BvdDashboardModule { }  