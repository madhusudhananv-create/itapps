import { ComponentFixture, TestBed } from '@angular/core/testing';

import {  AccountHealthViewdetailsComponent } from './account-health-viewdetails.component';
import { provideHttpClient } from '@angular/common/http';
import { COODashboardCommon } from '../../../../models/coo-dashboard-common.model';

describe('AccountHealthViewdetailsComponent', () => {
  let component: AccountHealthViewdetailsComponent;
  let fixture: ComponentFixture<AccountHealthViewdetailsComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ AccountHealthViewdetailsComponent ],
      providers: [provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    // Initialize COODashboardCommon singleton with required data structure
    const commonInstance = COODashboardCommon.GetInstance();
    commonInstance.accountOverallHealth = {
      projecT_KPIS: [],
      cusT_KPIS: []
    };

    fixture = TestBed.createComponent(AccountHealthViewdetailsComponent);
    component = fixture.componentInstance;
    
    // Initialize the component's reference to the singleton
    component._cooDashboardCommon = commonInstance;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
