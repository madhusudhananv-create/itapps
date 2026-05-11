import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmDashboardComponent } from './csm-dashboard.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('CsmDashboardComponent', () => {
  let component: CsmDashboardComponent;
  let fixture: ComponentFixture<CsmDashboardComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ CsmDashboardComponent ],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
