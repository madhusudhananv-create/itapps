import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { COODashboardComponent } from './coo-dashboard.component';

describe('COODashboardComponent', () => {
  let component: COODashboardComponent;
  let fixture: ComponentFixture<COODashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ COODashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(COODashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
